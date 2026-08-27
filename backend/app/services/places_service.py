import requests
import json
from typing import Dict, List, Any, Optional

class PlacesService:
    @staticmethod
    def geocode_destination(destination: str) -> Dict[str, Any]:
        """
        Geocodes a destination name using OpenStreetMap Nominatim API.
        100% Free, 1 req/sec max rate limit.
        """
        url = "https://nominatim.openstreetmap.org/search"
        params = {
            "q": destination,
            "format": "json",
            "limit": 1
        }
        headers = {
            "User-Agent": "WanderSync-AI-TravelPlanner/1.0 (contact@wandersync.ai)"
        }
        
        try:
            res = requests.get(url, params=params, headers=headers, timeout=5)
            if res.status_code == 200 and res.json():
                item = res.json()[0]
                return {
                    "lat": float(item["lat"]),
                    "lng": float(item["lon"]),
                    "display_name": item.get("display_name", destination),
                    "boundingbox": item.get("boundingbox", [])
                }
        except Exception as e:
            print(f"[PlacesService Warning] Nominatim geocoding error: {e}")
            
        # Fallback coordinates for major travel hubs if API fails
        fallback_coords = {
            "tokyo": {"lat": 35.6762, "lng": 139.6503, "display_name": "Tokyo, Japan"},
            "paris": {"lat": 48.8566, "lng": 2.3522, "display_name": "Paris, France"},
            "new york": {"lat": 40.7128, "lng": -74.0060, "display_name": "New York, USA"},
            "london": {"lat": 51.5074, "lng": -0.1278, "display_name": "London, UK"}
        }
        key = destination.lower().strip()
        for k, coords in fallback_coords.items():
            if k in key:
                return coords
                
        return {"lat": 48.8566, "lng": 2.3522, "display_name": destination}

    @staticmethod
    def fetch_points_of_interest(lat: float, lng: float, radius_meters: int = 5000) -> List[Dict[str, Any]]:
        """
        Fetches tourist attractions, cultural sites, and dining options from Overpass API.
        """
        overpass_url = "https://overpass-api.de/api/interpreter"
        query = f"""
        [out:json][timeout:10];
        (
          node["tourism"="attraction"](around:{radius_meters},{lat},{lng});
          node["tourism"="museum"](around:{radius_meters},{lat},{lng});
          node["amenity"="restaurant"](around:{radius_meters},{lat},{lng});
        );
        out body 15;
        """
        try:
            res = requests.post(overpass_url, data={"data": query}, timeout=8)
            if res.status_code == 200:
                elements = res.json().get("elements", [])
                pois = []
                for elem in elements:
                    tags = elem.get("tags", {})
                    name = tags.get("name")
                    if name:
                        pois.append({
                            "name": name,
                            "lat": elem.get("lat"),
                            "lng": elem.get("lon"),
                            "category": tags.get("tourism") or tags.get("amenity", "attraction"),
                            "address": tags.get("addr:street", "")
                        })
                if pois:
                    return pois
        except Exception as e:
            print(f"[PlacesService Warning] Overpass API timeout/error: {e}")
            
        return PlacesService._get_mock_pois(lat, lng)

    @staticmethod
    def _get_mock_pois(lat: float, lng: float) -> List[Dict[str, Any]]:
        return [
            {"name": "Central Historic Plaza", "lat": lat + 0.002, "lng": lng + 0.003, "category": "attraction"},
            {"name": "National Heritage Museum", "lat": lat - 0.004, "lng": lng - 0.002, "category": "museum"},
            {"name": "Artisan Culinary Market", "lat": lat + 0.005, "lng": lng - 0.001, "category": "restaurant"},
            {"name": "Scenic Riverside Promenade", "lat": lat - 0.001, "lng": lng + 0.006, "category": "leisure"}
        ]
