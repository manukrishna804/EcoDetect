from firebase_admin import firestore
from hotspot.logic import (
    get_recent_dangerous_detections,
    find_hotspots
)

def run_hotspot_analysis(db):
    detections = get_recent_dangerous_detections(db)

    if len(detections) < 2:
        return "Not enough data"

    hotspots = find_hotspots(detections)

    for hotspot in hotspots:
        db.collection("hotspots").add({
            "species": hotspot["species"],
            "danger_level": hotspot["danger_level"],
            "center": {
                "lat": hotspot["center_lat"],
                "lng": hotspot["center_lng"]
            },
            "radius_km": 10,
            "detection_count": hotspot["count"],
            "updated_at": firestore.SERVER_TIMESTAMP
        })

        db.collection("alerts").add({
            "species": hotspot["species"],
            "message": "High-risk species detected nearby",
            "radius_km": 10,
            "created_at": firestore.SERVER_TIMESTAMP
        })

    return f"{len(hotspots)} hotspots created"
