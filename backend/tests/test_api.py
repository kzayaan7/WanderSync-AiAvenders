import unittest
from app import create_app

class TestAPIEndpoints(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()

    def test_health_endpoint(self):
        res = self.client.get('/health')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['status'], 'healthy')
        self.assertIn('Groq', data['llm_provider'])

    def test_chat_message_endpoint(self):
        res = self.client.post('/api/v1/chat/message', json={
            "message": "I want to visit Paris for 3 days in May with a budget of $1000."
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['status'], 'success')
        self.assertIn('extracted_parameters', data)

    def test_shared_itinerary_endpoint(self):
        res = self.client.get('/api/v1/itinerary/share/demo-shared-uuid')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['status'], 'success')
        self.assertTrue(data['is_read_only'])

if __name__ == "__main__":
    unittest.main()
