from firebase_admin import firestore, credentials, initialize_app
from datetime import datetime, timezone, timedelta
import firebase_admin

# Initialize Firebase (if not already initialized in the context this runs, 
# but for a standalone script we need to initialize or assume it's run in an environment that handles it.
# However, usually we can just use the existing logic if we mock or import the setup.
# Let's assume we can reuse the app initialization from app.py if we import it, 
# or we just rely on the user running it in a context where firebase is set up.
# Actually, the user's `app.py` initializes it.
# Let's try to just use valid python that mimics the logic checks to show "WHY".

# To run this standalone, we'd need creds.
# Instead, let's create a script that IMPORTS the db from `app.py` or uses the same logic.
# But `app.py` starts the server.
# Let's try to create a function we can run via `python -c` or just a script that assumes `app` context?
# No, simplest is a standalone script that uses `firebase_admin.get_app()` if already running? 
# No, a separate process needs its own init.
# Let's try to grab `db` from `app.py` but avoid running the app.
# Changing strategy: modifying `runner.py` or `logic.py` to include a debug mode is invasive.

# Best approach: Create a temporary script that initializes firebase similarly to `app.py` and runs the check.
# I'll check `app.py` to see how it initializes.

try:
    from app import db # Assuming app.py exposes db
except ImportError:
    # If app.py is hard to import without running, we might need to copy init code.
    print("Could not import db from app.py")
    pass

def inspect_detections():
    print("--- Inspecting Detections ---")
    
    # Range check
    now = datetime.now(timezone.utc)
    last_24_hours = now - timedelta(hours=24)
    print(f"Current Time (UTC): {now}")
    print(f"Cutoff Time (UTC): {last_24_hours}")

    docs = db.collection("detections").stream()
    
    all_count = 0
    valid_count = 0
    
    for doc in docs:
        all_count += 1
        data = doc.to_dict()
        doc_id = doc.id
        
        print(f"\n[Detection ID: {doc_id}]")
        
        # 1. Check Timestamp
        ts = data.get("timestamp")
        print(f" - Timestamp: {ts}")
        
        if not ts:
            print("   -> INVALID: Missing timestamp")
            continue
            
        if not isinstance(ts, datetime):
            print(f"   -> INVALID: Timestamp is not a datetime object (Type: {type(ts)})")
            # Try to help user if it's a string
            continue

        # Check recency
        # Note: timestamps might be offset-naive or offset-aware.
        # Logic.py assumes comparable.
        try:
            is_recent = ts >= last_24_hours
        except TypeError as e:
            print(f"   -> ERROR comparing timestamps: {e}")
            print("   (Maybe one is tz-aware and other is naive?)")
            continue
            
        if not is_recent:
            print(f"   -> SKIPPED: Too old ({ts} < {last_24_hours})")
            continue
        else:
            print("   -> Timestamp: OK (Recent)")

        # 2. Check Location
        loc = data.get("location", {})
        available = loc.get("available")
        lat = loc.get("lat")
        lng = loc.get("lng")
        
        print(f" - Location: available={available}, lat={lat}, lng={lng}")
        
        if not available:
            print("   -> SKIPPED: Location not available")
            continue
            
        if lat is None or lng is None:
            print("   -> SKIPPED: Lat/Lng missing")
            continue
            
        print("   -> Location: OK")
        
        # 3. Species info
        species = data.get("detected_class")
        danger = data.get("danger_level")
        print(f" - Species: {species}, Danger: {danger}")
        
        valid_count += 1
        print("   ==> VALID detection")

    print(f"\nSummary: Found {all_count} total documents. {valid_count} are valid for hotspot analysis.")

if __name__ == "__main__":
    inspect_detections()
