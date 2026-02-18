import requests
import json

url = "http://localhost:5000/chat"
headers = {"Content-Type": "application/json"}
data = {
    "message": "What are the first aid steps for a Russell's Viper bite?"
}

try:
    response = requests.post(url, json=data, headers=headers)
    print("Status Code:", response.status_code)
    print("Response JSON:", json.dumps(response.json(), indent=2))
except Exception as e:
    print("Error:", e)
