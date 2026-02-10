import requests
import json

# Test the chatbot endpoint
url = "http://localhost:5000/chat"
payload = {
    "message": "Hello! Can you tell me about mosquito prevention?"
}

try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")
