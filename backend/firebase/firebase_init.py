import firebase_admin
from firebase_admin import credentials, firestore
import os

def init_firebase():
    if not firebase_admin._apps:
        # Check if environment variable exists (for production/deployment)
        service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT")
        
        if service_account_json:
            import json
            # Initialize using credentials from environment variable string
            service_account_info = json.loads(service_account_json)
            cred = credentials.Certificate(service_account_info)
        else:
            # Fallback to local file (for local development)
            base_dir = os.path.dirname(os.path.abspath(__file__))
            key_path = os.path.join(base_dir, "serviceAccountKey.json")
            if os.path.exists(key_path):
                cred = credentials.Certificate(key_path)
            else:
                raise FileNotFoundError("Firebase credentials not found in env or file!")

        firebase_admin.initialize_app(cred)

    return firestore.client()
