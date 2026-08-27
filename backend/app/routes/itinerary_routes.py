import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify
from app.utils.validators import ItineraryGenerationRequest, ActivityEditRequest
from app.services.groq_service import GroqService
from app.services.places_service import PlacesService
from app.services.weather_service import WeatherService
from app.services.optimizer_service import OptimizerService
from app.services.vector_service import VectorService
from app.middleware.auth import require_auth, supabase_client

itinerary_bp = Blueprint("itinerary", __name__, url_prefix="/api/v1/itinerary")

# In-memory store fallback for demo & testing if database is offline
ITINERARY_STORE = {}

@itinerary_bp.route("/generate", methods=["POST"])
@require_auth
def generate_itinerary():
    try:
        payload = request.get_json() or {}
        validated = ItineraryGenerationRequest(**payload)
        
        # 1. Geocode destination using OSM Nominatim
        geo_info = PlacesService.geocode_destination(validated.destination)
        lat, lng = geo_info["lat"], geo_info["lng"]
        
        # 2. Calculate duration
        d1 = datetime.strptime(validated.start_date, "%Y-%m-%d")
        d2 = datetime.strptime(validated.end_date, "%Y-%m-%d")
        duration = max(1, (d2 - d1).days + 1)
        
        # 3. Fetch Weather Forecast from Open-Meteo
        weather_map = WeatherService.get_weather_forecast(lat, lng, validated.start_date, validated.end_date)
        
        # 4. Fetch POIs from Overpass API
        pois = PlacesService.fetch_points_of_interest(lat, lng)
        
        # 5. Invoke Groq LLM to generate base itinerary
        raw_itinerary = GroqService.generate_full_itinerary(
            destination=validated.destination,
            start_date=validated.start_date,
            end_date=validated.end_date,
            duration_days=duration,
            budget_category=validated.budget_category,
            total_budget=validated.total_budget,
            interests=validated.interests or [],
            weather_info=weather_map,
            poi_suggestions=pois
        )
        
        # 6. Apply Greedy Optimization & attach lat/lng coordinates to activities
        days_data = raw_itinerary.get("days", [])
        # Ordered per-date forecasts (excluding the synthetic "default" entry), used as a
        # positional fallback below so a day still gets *some* real forecast instead of
        # flashing between real data and an empty {} whenever its exact date string
        # doesn't line up with what Open-Meteo returned (e.g. trip dates past the
        # ~16-day forecast horizon).
        dated_forecasts = [v for k, v in weather_map.items() if k != "default"]
        default_weather = weather_map.get("default", dated_forecasts[0] if dated_forecasts else {})
        for idx, day in enumerate(days_data):
            date_str = day.get("date", validated.start_date)
            if date_str in weather_map:
                day["weather"] = weather_map[date_str]
            elif idx < len(dated_forecasts):
                day["weather"] = dated_forecasts[idx]
            else:
                day["weather"] = default_weather
            
            # Map POI coordinates or offset slightly around destination center
            for idx, act in enumerate(day.get("activities", [])):
                poi = pois[idx % len(pois)] if pois else {}
                act["lat"] = poi.get("lat", lat + (idx * 0.003))
                act["lng"] = poi.get("lng", lng + (idx * 0.002))
            
            # Optimize sequence & schedule
            day["activities"] = OptimizerService.optimize_daily_activities(day.get("activities", []), lat, lng)
            
        itinerary_id = str(uuid.uuid4())
        share_token = str(uuid.uuid4())
        
        result_payload = {
            "id": itinerary_id,
            "user_id": getattr(request, "user", {}).get("id", "guest"),
            "title": raw_itinerary.get("title", f"Trip to {validated.destination}"),
            "destination": validated.destination,
            "destination_lat": lat,
            "destination_lng": lng,
            "start_date": validated.start_date,
            "end_date": validated.end_date,
            "duration_days": duration,
            "total_estimated_cost": raw_itinerary.get("total_estimated_cost", validated.total_budget),
            "share_token": share_token,
            "is_public": False,
            "days": days_data
        }
        
        ITINERARY_STORE[itinerary_id] = result_payload
        ITINERARY_STORE[share_token] = result_payload

        # Best-effort persistence to Supabase (falls back to in-memory store above if it fails,
        # e.g. for guest sessions with no profiles row) so shared links/history survive restarts.
        VectorService.persist_itinerary(result_payload)
        
        return jsonify({
            "status": "success",
            "itinerary": result_payload
        }), 201
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Itinerary generation failed: {str(e)}"
        }), 400

@itinerary_bp.route("/<itinerary_id>/edit", methods=["PUT"])
@require_auth
def edit_itinerary(itinerary_id):
    try:
        data = request.get_json() or {}
        edit_req = ActivityEditRequest(**data)
        
        itinerary = ITINERARY_STORE.get(itinerary_id)
        if not itinerary:
            return jsonify({"status": "error", "message": "Itinerary not found"}), 404
            
        days = itinerary.get("days", [])
        target_day = next((d for d in days if d.get("day_number") == edit_req.day_number), None)
        
        if not target_day:
            return jsonify({"status": "error", "message": "Day not found"}), 404
            
        if edit_req.action == "reorder" and edit_req.reordered_activity_ids:
            act_map = {str(a.get("id", idx)): a for idx, a in enumerate(target_day["activities"])}
            reordered = []
            for new_id in edit_req.reordered_activity_ids:
                if new_id in act_map:
                    reordered.append(act_map[new_id])
            target_day["activities"] = OptimizerService.optimize_daily_activities(
                reordered, 
                itinerary.get("destination_lat", 48.8566), 
                itinerary.get("destination_lng", 2.3522)
            )
            
        return jsonify({
            "status": "success",
            "message": "Itinerary updated and re-optimized successfully",
            "itinerary": itinerary
        }), 200
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@itinerary_bp.route("/history", methods=["GET"])
@require_auth
def get_itinerary_history():
    """
    Returns this user's past itineraries. Reads from Supabase first (the durable
    source of truth); falls back to the in-memory store for any generated in this
    process but not yet persisted (e.g. Supabase briefly unavailable at generate time).
    """
    user_id = request.user["id"]
    results = []

    if supabase_client:
        try:
            res = supabase_client.table("itineraries").select(
                "id, title, destination, start_date, end_date, duration_days, "
                "total_estimated_cost, share_token, created_at"
            ).eq("user_id", user_id).order("created_at", desc=True).limit(50).execute()
            results = res.data or []
        except Exception as e:
            print(f"[Itinerary History Info] Supabase lookup skipped: {e}")

    if not results:
        seen_ids = set()
        for it in ITINERARY_STORE.values():
            if it.get("user_id") == user_id and it.get("id") not in seen_ids:
                seen_ids.add(it.get("id"))
                results.append({
                    "id": it.get("id"),
                    "title": it.get("title"),
                    "destination": it.get("destination"),
                    "start_date": it.get("start_date"),
                    "end_date": it.get("end_date"),
                    "duration_days": it.get("duration_days"),
                    "total_estimated_cost": it.get("total_estimated_cost"),
                    "share_token": it.get("share_token"),
                    "created_at": None
                })

    return jsonify({"status": "success", "itineraries": results}), 200


@itinerary_bp.route("/<itinerary_id>", methods=["GET"])
@require_auth
def get_itinerary_detail(itinerary_id):
    """Fetches one full itinerary (with days/activities) for the History -> detail view."""
    user_id = request.user["id"]
    itinerary = ITINERARY_STORE.get(itinerary_id)

    if (not itinerary or itinerary.get("user_id") != user_id) and supabase_client:
        try:
            res = supabase_client.table("itineraries").select(
                "*, itinerary_days(*, activities(*))"
            ).eq("id", itinerary_id).eq("user_id", user_id).single().execute()
            if res.data:
                itinerary = res.data
        except Exception as e:
            print(f"[Itinerary Detail Info] Supabase lookup skipped: {e}")

    if not itinerary or itinerary.get("user_id") != user_id:
        return jsonify({"status": "error", "message": "Itinerary not found"}), 404

    return jsonify({"status": "success", "itinerary": itinerary}), 200


@itinerary_bp.route("/recommendations", methods=["GET"])
@require_auth
def get_recommendations():
    """
    Suggests new destinations based on this user's stored preference embeddings and
    past itinerary destinations — the "recommendations related to history" feature,
    grounded in real stored data rather than generic suggestions.
    """
    user_id = request.user["id"]
    preference_texts = []
    past_destinations = []

    if supabase_client:
        try:
            pref_res = supabase_client.table("preferences_embeddings").select(
                "preference_text"
            ).eq("user_id", user_id).order("created_at", desc=True).limit(10).execute()
            preference_texts = [p["preference_text"] for p in (pref_res.data or [])]
        except Exception as e:
            print(f"[Recommendations Info] preference lookup skipped: {e}")

        try:
            dest_res = supabase_client.table("itineraries").select(
                "destination"
            ).eq("user_id", user_id).execute()
            past_destinations = list({d["destination"] for d in (dest_res.data or [])})
        except Exception as e:
            print(f"[Recommendations Info] destination lookup skipped: {e}")

    if not past_destinations:
        past_destinations = list({
            it.get("destination") for it in ITINERARY_STORE.values()
            if it.get("user_id") == user_id and it.get("destination")
        })

    recs = GroqService.generate_recommendations(preference_texts, past_destinations)
    return jsonify({"status": "success", **recs}), 200


def get_shared_itinerary(share_token):
    itinerary = ITINERARY_STORE.get(share_token)

    if not itinerary and supabase_client:
        try:
            res = supabase_client.table("itineraries").select(
                "*, itinerary_days(*, activities(*))"
            ).eq("share_token", share_token).single().execute()
            if res.data:
                itinerary = res.data
        except Exception as e:
            print(f"[Itinerary Share Info] Supabase lookup skipped: {e}")

    if not itinerary:
        # Fallback mock for public shared preview
        itinerary = {
            "id": "demo-shared-uuid",
            "title": "5-Day Tokyo Anime & Culinary Exploration",
            "destination": "Tokyo, Japan",
            "destination_lat": 35.6762,
            "destination_lng": 139.6503,
            "start_date": "2026-10-10",
            "end_date": "2026-10-14",
            "duration_days": 5,
            "total_estimated_cost": 1250.00,
            "share_token": share_token,
            "is_public": True,
            "days": [
                {
                    "day_number": 1,
                    "date": "2026-10-10",
                    "title": "Akihabara Tech & Anime Immersion",
                    "summary": "Explore figures, themed cafes, and taste legendary Tsukemen ramen.",
                    "weather": {"temp_max_c": 22.0, "temp_min_c": 15.0, "condition": "Clear / Sunny"},
                    "activities": [
                        {
                            "sequence_order": 1,
                            "title": "Radio Kaikan Exploration",
                            "category": "attraction",
                            "start_time": "10:00",
                            "end_time": "12:30",
                            "duration_mins": 150,
                            "cost_estimate": 0.0,
                            "lat": 35.6983,
                            "lng": 139.7731,
                            "address": "Akihabara, Tokyo",
                            "description": "Multi-story complex dedicated to anime collectibles and figures."
                        }
                    ]
                }
            ]
        }
    return jsonify({
        "status": "success",
        "is_read_only": True,
        "itinerary": itinerary
    }), 200
