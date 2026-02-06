from firebase_admin import firestore
from hotspot.logic import (
    get_recent_detections,
    get_existing_hotspots,
    find_nearest_hotspot,
    update_hotspot_with_detection,
    create_new_hotspot_from_detection,
    find_hotspots,
    merge_nearby_hotspots
)

def run_hotspot_analysis(db, radius_km=10, detection_hours=24):
    """
    Main hotspot analysis function with strict 24-hour rolling window.
    
    STRATEGY: RE-AGGREGATION
    1. Fetch ALL valid detections from last 24h.
    2. Cluster them into 'fresh' hotspots (in-memory).
    3. Fetch existing hotspots from Firestore.
    4. Match fresh hotspots to existing ones to preserve IDs:
       - If fresh matches existing: Update existing doc with fresh counts/ids.
       - If fresh has no match: Create new hotspot doc.
       - If existing has no match: Leave it alone (it becomes naturally 'stale' as timestamps age).
    
    This ensures that hotspots ALWAYS reflect only the last 24h of activity.
    """
    
    # Step 1: Fetch recent detections
    print(f"[RUNNER] Fetching detections from last {detection_hours} hours...")
    detections = get_recent_detections(db, hours=detection_hours)
    print(f"[RUNNER] Found {len(detections)} recent detections")
    
    if len(detections) == 0:
        print(f"[RUNNER] No recent detections. Hotspots will naturally go stale.")
        return {"status": "No detections found", "hotspots_created": 0, "hotspots_updated": 0}

    # Map for easy lookup to calculate max timestamp
    detections_map = {d['id']: d for d in detections}

    # Step 2: Calculate 'Ideal' Hotspots from Scratch (Clustering)
    print(f"[RUNNER] Clustering recent detections into fresh hotspots...")
    # This clusters all passed detections. 
    # Logic note: find_hotspots only returns clusters that contain at least one high/extreme risk detection.
    # This is correct behavior: we don't want hotspots of just low-risk animals.
    fresh_hotspots = find_hotspots(detections, radius_km)
    
    # Merge nearby fresh hotspots to ensure clean clusters
    if len(fresh_hotspots) > 1:
        fresh_hotspots = merge_nearby_hotspots(fresh_hotspots, radius_km)
    
    print(f"[RUNNER] Calculated {len(fresh_hotspots)} fresh hotspots active in last 24h")

    # Step 3: Fetch existing hotspots to try and preserve IDs
    print(f"[RUNNER] Fetching existing hotspots for ID matching...")
    existing_hotspots = get_existing_hotspots(db)
    existing_map = {h['id']: h for h in existing_hotspots}
    used_existing_ids = set()

    hotspots_to_update = {} # ID -> Update Data
    hotspots_to_create = [] # List of dicts

    for fresh in fresh_hotspots:
        # Calculate lastDetectedAt for this cluster
        cluster_timestamps = []
        for det_id in fresh.get("detection_ids", []):
            if det_id in detections_map:
                cluster_timestamps.append(detections_map[det_id]["timestamp"])
        
        last_detected_at = max(cluster_timestamps) if cluster_timestamps else firestore.SERVER_TIMESTAMP
        
        # Try to find a matching existing hotspot
        nearest_existing, distance = find_nearest_hotspot(
            fresh["center_lat"], fresh["center_lng"],
            existing_hotspots, radius_km
        )

        match_id = None
        if nearest_existing and distance < radius_km:
            # Found a match!
            eid = nearest_existing["id"]
            if eid not in used_existing_ids:
                match_id = eid
                used_existing_ids.add(eid)
                print(f"[RUNNER] Fresh hotspot ({fresh['species']}) matches existing {eid} (dist={distance:.2f}km)")
            else:
                print(f"[RUNNER] Fresh hotspot ({fresh['species']}) matched used ID {eid}, creating new instead.")
        
        # Prepare data (common for update and create)
        hotspot_data = {
            "detection_count": fresh["count"],
            "detection_ids": fresh["detection_ids"],
            "species_counts": fresh["species_counts"],
            "species": fresh["species"],
            "danger_level": fresh["danger_level"],
            "species_summary": fresh.get("summary", ""),
            "center": {
                "lat": fresh["center_lat"],
                "lng": fresh["center_lng"]
            },
            "lastDetectedAt": last_detected_at, # KEY FEATURE: Sliding window timestamp
            "updated_at": firestore.SERVER_TIMESTAMP
        }

        if match_id:
            hotspots_to_update[match_id] = hotspot_data
        else:
            # New hotspot needs a few more fields for creation
            create_payload = hotspot_data.copy()
            create_payload["created_at"] = firestore.SERVER_TIMESTAMP
            create_payload["radius_km"] = radius_km
            hotspots_to_create.append(create_payload)

    # Step 4: Execute Updates
    updated_count = 0
    for hid, data in hotspots_to_update.items():
        try:
            db.collection("hotspots").document(hid).update(data)
            updated_count += 1
            print(f"[RUNNER] Updated hotspot {hid}: species='{data['species']}'")
        except Exception as e:
            print(f"[ERROR] Failed to update hotspot {hid}: {e}")

    # Step 5: Execute Creates
    created_count = 0
    created_ids = []
    for data in hotspots_to_create:
        try:
            ref = db.collection("hotspots").add(data)
            hid = ref[1].id
            created_ids.append(hid)
            created_count += 1
            print(f"[RUNNER] Created new hotspot {hid}: species='{data['species']}'")
            
            # Optional: Create Alert for new/re-emerged hotspot
            db.collection("alerts").add({
                "species": data["species"],
                "message": f"Hotspot Active: {data['species_summary']}",
                "hotspot_id": hid,
                "radius_km": radius_km,
                "created_at": firestore.SERVER_TIMESTAMP
            })

        except Exception as e:
            print(f"[ERROR] Failed to create hotspot: {e}")

    return {
        "status": "success",
        "hotspots_created": created_count,
        "hotspots_updated": updated_count,
        "hotspot_ids": created_ids,
        "total_detections_processed": len(detections)
    }
