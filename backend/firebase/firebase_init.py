import firebase_admin
from firebase_admin import credentials, firestore
import os

def init_firebase():
    if not firebase_admin._apps:
        # Get absolute path of this file
        base_dir = os.path.dirname(os.path.abspath(__file__))

        # Build correct path to service account key
        key_path = os.path.join(base_dir, "serviceAccountKey.json")

        cred = credentials.Certificate(key_path)
        firebase_admin.initialize_app(cred)

    return firestore.client()
