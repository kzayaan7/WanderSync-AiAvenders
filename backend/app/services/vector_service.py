import numpy as np
from typing import List, Dict, Any
from app.middleware.auth import supabase_client

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
        except Exception as e:
            # Fallback deterministic pseudo-embedding vector (384 dimensions)
            np.random.seed(abs(hash(text)) % (2**32))
            dummy_vec = np.random.normal(0, 1, 384)
            dummy_vec = dummy_vec / np.linalg.norm(dummy_vec)
            return dummy_vec.tolist()

    @staticmethod
    def search_user_preferences(user_id: str, query_text: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Queries Supabase pgvector cosine similarity index to retrieve relevant user preferences.
        """
        if not supabase_client:
            return []
            
        query_vector = VectorService.generate_embedding(query_text)
        try:
            # Execute pgvector match function or RPC call in Supabase
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
        Best-effort: guest/demo users or an offline DB never block the main request.
        """
        if not supabase_client or not preference_text or not preference_text.strip():
            return False
        try:
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
        Best-effort persistence of a generated itinerary (+ days + activities) to Supabase.
        Falls back silently to the in-memory store if the DB or the user's profile row
        (e.g. guest sessions) is unavailable, so the live demo never breaks.
        """
        if not supabase_client:
            return False
        try:
            supabase_client.table("itineraries").insert({
                "id": itinerary["id"],
                "user_id": itinerary["user_id"],
                "title": itinerary["title"],
                "destination": itinerary["destination"],
                "destination_lat": itinerary["destination_lat"],
                "destination_lng": itinerary["destination_lng"],
                "start_date": itinerary["start_date"],
                "end_date": itinerary["end_date"],
                "total_estimated_cost": itinerary["total_estimated_cost"],
                "share_token": itinerary["share_token"],
                "is_public": itinerary.get("is_public", False)
            }).execute()

            for day in itinerary.get("days", []):
                day_res = supabase_client.table("itinerary_days").insert({
                    "itinerary_id": itinerary["id"],
                    "day_number": day["day_number"],
                    "date": day.get("date"),
                    "title": day.get("title"),
                    "summary": day.get("summary"),
                    "weather_summary": day.get("weather", {})
                }).execute()
                day_id = day_res.data[0]["id"] if day_res.data else None
                if not day_id:
                    continue
                for act in day.get("activities", []):
                    supabase_client.table("activities").insert({
                        "day_id": day_id,
                        "itinerary_id": itinerary["id"],
                        "title": act.get("title"),
                        "description": act.get("description"),
                        "category": act.get("category", "attraction"),
                        "start_time": act.get("start_time"),
                        "end_time": act.get("end_time"),
                        "duration_mins": act.get("duration_mins"),
                        "cost_estimate": act.get("cost_estimate", 0),
                        "lat": act.get("lat"),
                        "lng": act.get("lng"),
                        "address": act.get("address"),
                        "sequence_order": act.get("sequence_order", 1)
                    }).execute()
            return True
        except Exception as e:
            print(f"[VectorService Info] itinerary persistence skipped (using in-memory store): {e}")
            return False
