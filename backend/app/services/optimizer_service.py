import math
from typing import List, Dict, Any

class OptimizerService:
    @staticmethod
    def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculates distance between two geographical points using Haversine formula."""
        R = 6371.0 # Earth radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (math.sin(dlat / 2) ** 2 +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return round(R * c, 2)

    @classmethod
    def optimize_daily_activities(cls, activities: List[Dict[str, Any]], start_lat: float, start_lng: float) -> List[Dict[str, Any]]:
        """
        Applies a Greedy Nearest Neighbor heuristic to minimize total daily transit distance 
        and re-sequences activities into optimal chronological order.
        """
        if not activities:
            return []

        unvisited = list(activities)
        optimized = []
        current_lat, current_lng = start_lat, start_lng

        current_time_minutes = 9 * 60 # Start day at 09:00 AM

        while unvisited:
            # Find nearest activity
            best_idx = 0
            best_dist = float('inf')
            for i, act in enumerate(unvisited):
                act_lat = act.get("lat") or start_lat
                act_lng = act.get("lng") or start_lng
                dist = cls.haversine_distance_km(current_lat, current_lng, act_lat, act_lng)
                if dist < best_dist:
                    best_dist = dist
                    best_idx = i

            next_act = unvisited.pop(best_idx)
            
            # Estimate transit time (assuming 30 km/h average speed in urban area)
            transit_mins = max(10, int((best_dist / 30.0) * 60))
            current_time_minutes += transit_mins
            
            # Assign start and end times
            duration = next_act.get("duration_mins", 90)
            start_hh = current_time_minutes // 60
            start_mm = current_time_minutes % 60
            
            current_time_minutes += duration
            end_hh = current_time_minutes // 60
            end_mm = current_time_minutes % 60
            
            next_act["sequence_order"] = len(optimized) + 1
            next_act["start_time"] = f"{start_hh:02d}:{start_mm:02d}"
            next_act["end_time"] = f"{end_hh:02d}:{end_mm:02d}"
            next_act["transit_from_prev_km"] = best_dist
            
            optimized.append(next_act)
            current_lat = next_act.get("lat", current_lat)
            current_lng = next_act.get("lng", current_lng)

        return optimized
