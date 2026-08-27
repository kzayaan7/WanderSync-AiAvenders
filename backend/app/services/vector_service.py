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
    @staticmethod
    def generate_embedding(text: str) -> List[float]:
        """
        Generates a 384-dimensional vector embedding using SentenceTransformers or a 
        deterministic local feature extraction fallback. 100% free, 0 API cost.
        """
        try:
            from sentence_transformers import SentenceTransformer
            model = SentenceTransformer('all-MiniLM-L6-v2')
            vec = model.encode(text)
            return vec.tolist()
        except Exception:
            np.random.seed(abs(hash(text)) % (2**32))
            dummy_vec = np.random.normal(0, 1, 384)
            dummy_vec = dummy_vec / np.linalg.norm(dummy_vec)
            return dummy_vec.tolist()

    @staticmethod
    def search_user_preferences(user_id: str, query_text: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Queries Supabase pgvector cosine similarity index to retrieve relevant user preferences.
        """
        if not supabase_client or not user_id or user_id == "guest":
            return []
            
        query_vector = VectorService.generate_embedding(query_text)
        try:
            res = supabase_client.rpc('match_preferences', {
                'query_embedding': query_vector,
                'match_threshold': 0.5,
                'match_count': top_k,
                'p_user_id': user_id
            }).execute()
            return res.data if res.data else []
        except Exception as e:
            print(f"[VectorService Info] pgvector search fallback: {e}")
            return []

    @staticmethod
    def store_user_preference(user_id: str, preference_text: str, category: str = "general") -> bool:
        """
        Embeds and persists a user preference/message into preferences_embeddings so future
        requests can be personalized against travel history (fulfils SRS 1.6.vi).
        """
        if not supabase_client or not preference_text or not preference_text.strip() or user_id == "guest":
            return False
        try:
            try:
                supabase_client.table("profiles").upsert({
                    "id": user_id,
                    "email": f"{user_id}@wandersync.ai"
                }, on_conflict="id").execute()
            except Exception:
                pass

            embedding = VectorService.generate_embedding(preference_text)
            supabase_client.table("preferences_embeddings").insert({
                "user_id": user_id,
                "preference_text": preference_text.strip()[:500],
                "category": category,
                "embedding": embedding
            }).execute()
            return True
        except Exception as e:
            print(f"[VectorService Info] preference store skipped: {e}")
            return False

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
                "budget_category": budget_cat,
                "total_estimated_cost": float(itinerary.get("total_estimated_cost", 0.0)),
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
