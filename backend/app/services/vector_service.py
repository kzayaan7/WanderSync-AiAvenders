import uuid
import traceback
import numpy as np
from typing import List, Dict, Any
from app.middleware.auth import supabase_client


def _sanitize_category(cat: Any) -> str:
    if not cat:
        return "attraction"
    c = str(cat).lower().strip()
    if any(k in c for k in ["food", "dining", "restaurant", "meal", "lunch", "dinner", "breakfast", "cafe", "eat"]):
        return "food"
    if any(k in c for k in ["accommodation", "hotel", "stay", "resort", "lodging", "airbnb"]):
        return "accommodation"
    if any(k in c for k in ["transit", "flight", "bus", "train", "transport", "taxi", "subway", "drive", "ride"]):
        return "transit"
    if any(k in c for k in ["leisure", "relax", "park", "beach", "shopping", "nightlife", "entertainment", "spa", "bar"]):
        return "leisure"
    return "attraction"


def _sanitize_time(time_val: Any, default_time: str = "10:00:00") -> str:
    if not time_val or not isinstance(time_val, str):
        return default_time
    t = time_val.strip()
    if len(t) == 5 and ":" in t:
        return f"{t}:00"
    if len(t) == 8 and t.count(":") == 2:
        return t
    return default_time


class VectorService:
    _embedding_model = None

    @staticmethod
    def _get_embedding_model():
        if VectorService._embedding_model is None:
            from sentence_transformers import SentenceTransformer

            print("[VectorService] Loading embedding model...")
            VectorService._embedding_model = SentenceTransformer(
                "all-MiniLM-L6-v2"
            )
            print("[VectorService] Embedding model loaded.")

        return VectorService._embedding_model

    @staticmethod
    def generate_embedding(text: str) -> List[float]:
        """
        Generates a 384-dimensional embedding.

        The SentenceTransformer model is loaded once per Gunicorn worker
        and reused for subsequent requests.
        """
        try:
            model = VectorService._get_embedding_model()

            vec = model.encode(
                text,
                convert_to_numpy=True,
                normalize_embeddings=True
            )

            return vec.astype(float).tolist()

        except Exception as e:
            print(f"[VectorService Warning] Embedding generation failed: {e}")

            # Deterministic 384-dimensional fallback
            np.random.seed(abs(hash(text)) % (2**32))
            dummy_vec = np.random.normal(0, 1, 384)
            dummy_vec = dummy_vec / np.linalg.norm(dummy_vec)

            return dummy_vec.tolist()

    @staticmethod
    def persist_itinerary(itinerary: Dict[str, Any]) -> bool:
        """
        Durable persistence of a generated itinerary (+ days + activities) to Supabase.
        Robustly sanitizes categories, times, foreign key user profiles, and IDs.
        """
        if not supabase_client:
            print("[VectorService Warning] Supabase client unavailable. Cannot persist itinerary to DB.")
            return False

        user_id = itinerary.get("user_id")
        if not user_id or user_id == "guest":
            print("[VectorService Warning] Guest itinerary generation — persistent DB write skipped.")
            return False

        try:
            # 1. Ensure profile exists in public.profiles table to satisfy Foreign Key constraint
            user_email = itinerary.get("user_email") or f"{user_id}@wandersync.ai"
            try:
                supabase_client.table("profiles").upsert({
                    "id": user_id,
                    "email": user_email
                }, on_conflict="id").execute()
            except Exception as pe:
                print(f"[VectorService Info] Profile auto-creation notice: {pe}")

            # 2. Upsert itinerary record into `itineraries` table
            itinerary_id = itinerary["id"]
            share_token = itinerary.get("share_token") or str(uuid.uuid4())
            
            budget_cat = itinerary.get("budget_category", "moderate")
            if budget_cat not in ["backpacker", "moderate", "luxury", "custom"]:
                budget_cat = "moderate"

            itinerary_record = {
                "id": itinerary_id,
                "user_id": user_id,
                "title": itinerary.get("title", f"Trip to {itinerary.get('destination')}"),
                "destination": itinerary.get("destination", "Destination"),
                "destination_lat": float(itinerary.get("destination_lat", 0.0)),
                "destination_lng": float(itinerary.get("destination_lng", 0.0)),
                "start_date": itinerary.get("start_date"),
                "end_date": itinerary.get("end_date"),
                "duration_days": int(itinerary.get("duration_days", 1)),
                "budget_category": budget_cat,
                "travel_style": itinerary.get("travel_style"),
                "total_estimated_cost": float(itinerary.get("total_estimated_cost", 0.0)),
                "currency": itinerary.get("currency", "USD"),
                "currency_symbol": itinerary.get("currency_symbol", "$"),
                "share_token": share_token,
                "is_public": bool(itinerary.get("is_public", False))
            }
            supabase_client.table("itineraries").upsert(itinerary_record, on_conflict="id").execute()

            # 3. Upsert days into `itinerary_days` and activities into `activities`
            for day in itinerary.get("days", []):
                day_id = str(uuid.uuid4())
                day_record = {
                    "id": day_id,
                    "itinerary_id": itinerary_id,
                    "day_number": int(day.get("day_number", 1)),
                    "date": day.get("date") or itinerary.get("start_date"),
                    "title": day.get("title", f"Day {day.get('day_number', 1)}"),
                    "summary": day.get("summary", ""),
                    "weather_summary": day.get("weather", {}) or {}
                }
                supabase_client.table("itinerary_days").upsert(day_record, on_conflict="id").execute()

                for idx, act in enumerate(day.get("activities", [])):
                    act_id = str(uuid.uuid4())
                    act_record = {
                        "id": act_id,
                        "day_id": day_id,
                        "itinerary_id": itinerary_id,
                        "title": act.get("title", f"Activity {idx + 1}"),
                        "description": act.get("description", ""),
                        "category": _sanitize_category(act.get("category")),
                        "start_time": _sanitize_time(act.get("start_time"), "10:00:00"),
                        "end_time": _sanitize_time(act.get("end_time"), "12:00:00"),
                        "duration_mins": int(act.get("duration_mins", 60)),
                        "cost_estimate": float(act.get("cost_estimate", 0.0)),
                        "lat": float(act.get("lat", 0.0)) if act.get("lat") is not None else None,
                        "lng": float(act.get("lng", 0.0)) if act.get("lng") is not None else None,
                        "address": act.get("address", ""),
                        "sequence_order": int(act.get("sequence_order", idx + 1))
                    }
                    supabase_client.table("activities").upsert(act_record, on_conflict="id").execute()

            print(f"[VectorService Success] Itinerary {itinerary_id} successfully persisted to Supabase database.")
            return True

        except Exception as e:
            print(f"[VectorService Error] Itinerary persistence failed: {e}")
            traceback.print_exc()
            return False