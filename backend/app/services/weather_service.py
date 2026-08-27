import requests
from typing import Dict, Any

class WeatherService:
    @staticmethod
    def get_weather_forecast(lat: float, lng: float, start_date: str, end_date: str) -> Dict[str, Any]:
        """
        Fetches daily weather forecasts from the free Open-Meteo API.
        No API key required, 10,000 req/day quota.

        Retries once on transient failures (short timeout, rate limit, flaky network)
        before falling back — this is what was causing the "flickering" weather: a
        single slow response used to fall straight through to a bare fallback with no
        per-date entries, so the same itinerary could show real data on one generate
        and blank/placeholder data on the next.
        """
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": lat,
            "longitude": lng,
            "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode",
            "timezone": "auto"
        }

        last_error = None
        for attempt in range(2):
            try:
                response = requests.get(url, params=params, timeout=8)
                if response.status_code == 200:
                    data = response.json()
                    daily = data.get("daily", {})
                    time_list = daily.get("time", [])
                    max_temps = daily.get("temperature_2m_max", [])
                    min_temps = daily.get("temperature_2m_min", [])
                    precip = daily.get("precipitation_sum", [])
                    codes = daily.get("weathercode", [])

                    forecast_map = {}
                    for i, date_str in enumerate(time_list):
                        code = codes[i] if i < len(codes) else 0
                        condition = WeatherService._decode_weather_code(code)
                        forecast_map[date_str] = {
                            "temp_max_c": max_temps[i] if i < len(max_temps) else 22.0,
                            "temp_min_c": min_temps[i] if i < len(min_temps) else 15.0,
                            "precipitation_mm": precip[i] if i < len(precip) else 0.0,
                            "condition": condition
                        }

                    # Always carry a "default" entry alongside real per-date entries too,
                    # so a day whose date falls outside Open-Meteo's forecast window
                    # (e.g. beyond ~16 days out) still gets *some* consistent weather
                    # instead of silently disappearing from the UI.
                    if forecast_map:
                        first_day = next(iter(forecast_map.values()))
                        forecast_map.setdefault("default", first_day)
                        return forecast_map
                else:
                    last_error = f"HTTP {response.status_code}"
            except Exception as e:
                last_error = e

        print(f"[WeatherService Warning] Failed to fetch Open-Meteo data after retry: {last_error}. Using fallback.")
        return WeatherService._get_fallback_weather(start_date, end_date)

    @staticmethod
    def _decode_weather_code(code: int) -> str:
        if code in [0, 1]:
            return "Clear & Sunny"
        elif code in [2, 3]:
            return "Partly Cloudy"
        elif code in [45, 48]:
            return "Foggy"
        elif code in [51, 53, 55, 61, 63, 65]:
            return "Light / Moderate Rain"
        elif code in [80, 81, 82]:
            return "Rain Showers"
        elif code in [95, 96, 99]:
            return "Thunderstorm"
        return "Mild & Fair"

    @staticmethod
    def _get_fallback_weather(start_date: str, end_date: str) -> Dict[str, Any]:
        return {
            "default": {
                "temp_max_c": 22.0,
                "temp_min_c": 14.5,
                "precipitation_mm": 0.0,
                "condition": "Clear / Mild"
            }
        }
