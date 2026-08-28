import requests
from typing import Dict, Any

class ImageService:
    """
    Looks up a real, relevant photo for a destination name using the Wikipedia
    REST API — free, keyless, and generous rate limits (same style as
    PlacesService/WeatherService elsewhere in this app, which also use free
    keyless APIs instead of a paid provider).

    This replaces the old approach of hardcoding ~20 specific Unsplash photo
    URLs in destinationImages.js (frontend), which meant every destination
    NOT in that short hardcoded list silently fell back to one generic
    default image. Any destination string now gets its own looked-up photo.
    """

    # Small in-process cache so repeated lookups for the same destination
    # within a warm backend instance don't re-hit the network every time.
    _cache: Dict[str, str] = {}

    @staticmethod
    def get_destination_image(query: str) -> Dict[str, Any]:
        key = (query or "").strip().lower()
        if not key:
            return {"url": None, "source": None}

        if key in ImageService._cache:
            return {"url": ImageService._cache[key], "source": "wikipedia"}

        url = "https://en.wikipedia.org/w/api.php"
        params = {
            "action": "query",
            "generator": "search",
            "gsrsearch": query,
            "gsrlimit": 1,
            "gsrnamespace": 0,
            "prop": "pageimages",
            "piprop": "original",
            "format": "json",
            "redirects": 1
        }
        headers = {
            "User-Agent": "WanderSync-AI-TravelPlanner/1.0 (contact@wandersync.ai)"
        }

        try:
            res = requests.get(url, params=params, headers=headers, timeout=5)
            if res.status_code == 200:
                pages = ((res.json() or {}).get("query", {}) or {}).get("pages", {}) or {}
                for _, page in pages.items():
                    img_url = (page.get("original") or {}).get("source")
                    if img_url:
                        ImageService._cache[key] = img_url
                        return {"url": img_url, "source": "wikipedia"}
        except Exception as e:
            print(f"[ImageService Warning] Wikipedia image lookup failed for '{query}': {e}")

        return {"url": None, "source": None}