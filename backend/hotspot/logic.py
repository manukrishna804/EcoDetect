from datetime import datetime, timedelta
from hotspot.distance import haversine

DANGEROUS_LEVELS = ["high", "extreme"]

def get_recent_dangerous_detections(db):
    now = datetime.utcnow()
    last_24_hours = now - timedelta(hours=24)

    detections = []
    docs = db.collection("detections").stream()

    for doc in docs:
        data = doc.to_dict()

        if not data.get("timestamp"):
            continue

        if (
            data.get("danger_level") in DANGEROUS_LEVELS and
            data.get("location", {}).get("available") and
            data["timestamp"].to_datetime() >= last_24_hours
        ):
            detections.append({
                "lat": data["location"]["lat"],
                "lng": data["location"]["lng"],
                "species": data.get("detected_class"),
                "danger_level": data.get("danger_level")
            })

    return detections
def find_hotspots(detections, radius_km=10):
    hotspots = []

    for i in range(len(detections)):
        center = detections[i]
        count = 1

        for j in range(len(detections)):
            if i == j:
                continue

            distance = haversine(
                center["lat"], center["lng"],
                detections[j]["lat"], detections[j]["lng"]
            )

            if distance <= radius_km:
                count += 1

        if count >= 2:
            hotspots.append({
                "center_lat": center["lat"],
                "center_lng": center["lng"],
                "species": center["species"],
                "danger_level": center["danger_level"],
                "count": count
            })

    return hotspots