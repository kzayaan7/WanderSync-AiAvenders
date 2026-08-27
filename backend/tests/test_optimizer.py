import unittest
from app.services.optimizer_service import OptimizerService

class TestOptimizerService(unittest.TestCase):
    def test_haversine_distance(self):
        # Distance between Paris Eiffel Tower (48.8584, 2.2945) and Louvre (48.8606, 2.3376) ~ 3.16 km
        dist = OptimizerService.haversine_distance_km(48.8584, 2.2945, 48.8606, 2.3376)
        self.assertTrue(2.5 <= dist <= 4.0)

    def test_optimize_daily_activities(self):
        activities = [
            {"title": "Far Point", "lat": 48.9000, "lng": 2.4000, "duration_mins": 60},
            {"title": "Near Point", "lat": 48.8590, "lng": 2.3000, "duration_mins": 90}
        ]
        optimized = OptimizerService.optimize_daily_activities(activities, 48.8580, 2.2940)
        self.assertEqual(len(optimized), 2)
        # Near Point should be sequenced first
        self.assertEqual(optimized[0]["title"], "Near Point")
        self.assertEqual(optimized[0]["sequence_order"], 1)
        self.assertEqual(optimized[1]["sequence_order"], 2)

if __name__ == "__main__":
    unittest.main()
