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
    Main hotspot analysis function that:
    1. Fetches recent detections (last 24 hours)
    2. Fetches existing hotspots
    3. Matches detections to existing hotspots (within radius_km)
    4. Updates existing hotspots or creates new ones
    5. Merges nearby hotspots
    6. Cleans up stale hotspots (older than 7 days with no recent activity)
    """
    
    # Step 1: Fetch recent detections
    print(f"[RUNNER] Fetching detections from last {detection_hours} hours...")
    detections = get_recent_detections(db, hours=detection_hours)
    print(f"[RUNNER] Found {len(detections)} recent detections")
    
    if len(detections) == 0:
        print(f"[RUNNER] No detections found.")
        return {"status": "No detections found", "hotspots_created": 0, "hotspots_updated": 0}
    
    # Step 2: Fetch existing hotspots
    print(f"[RUNNER] Fetching existing hotspots...")
    existing_hotspots = get_existing_hotspots(db)
    
    # Step 3: Match detections to existing hotspots or create new ones
    hotspots_to_update = {}  # hotspot_id -> hotspot dict
    hotspots_to_create = []
    processed_detection_ids = set()
    
    # Match detections to existing hotspots or create new ones
    for detection in detections:
        if detection["id"] in processed_detection_ids:
            continue
        
        # EXCLUDE insects/mosquitoes from hotspot creation (but they're still in detections collection)
        detection_category = detection.get("category", "unknown").lower()
        if detection_category in ["mosquito", "insect"]:
            print(f"[RUNNER] Skipping {detection['species']} (category: {detection_category}) - insects don't create hotspots")
            processed_detection_ids.add(detection["id"])  # Mark as processed so we skip it
            continue
        
        # Check if detection is high/extreme risk (required for hotspot)
        if detection["danger_level"] not in ["high", "extreme"]:
            # Skip low-risk detections unless they're near an existing hotspot
            nearest_hotspot, distance = find_nearest_hotspot(
                detection["lat"], detection["lng"],
                existing_hotspots, radius_km
            )
            if nearest_hotspot:
                # Add low-risk detection to existing hotspot
                hotspot_id = nearest_hotspot["id"]
                if hotspot_id not in hotspots_to_update:
                    hotspots_to_update[hotspot_id] = nearest_hotspot.copy()
                update_hotspot_with_detection(hotspots_to_update[hotspot_id], detection, radius_km)
                processed_detection_ids.add(detection["id"])
            else:
                # Low-risk detection with no nearby hotspot - skip it
                processed_detection_ids.add(detection["id"])
            continue
        
        # For high/extreme risk detections, find nearest hotspot
        nearest_hotspot, distance = find_nearest_hotspot(
            detection["lat"], detection["lng"],
            existing_hotspots, radius_km
        )
        
        if nearest_hotspot:
            # Update existing hotspot
            hotspot_id = nearest_hotspot["id"]
            if hotspot_id not in hotspots_to_update:
                hotspots_to_update[hotspot_id] = nearest_hotspot.copy()
            update_hotspot_with_detection(hotspots_to_update[hotspot_id], detection, radius_km)
            processed_detection_ids.add(detection["id"])
        else:
            # Will create new hotspot later - mark as processed to avoid double processing
            # (We'll handle unmatched detections in Step 4)
            pass
    
    # Step 4: Handle unmatched detections (create new hotspots)
    unmatched_detections = [d for d in detections if d["id"] not in processed_detection_ids]
    
    if unmatched_detections:
        print(f"[RUNNER] Processing {len(unmatched_detections)} unmatched detections...")
        
        # For single high/extreme risk detection, create hotspot directly
        if len(unmatched_detections) == 1:
            detection = unmatched_detections[0]
            if detection["danger_level"] in ["high", "extreme"]:
                print(f"[RUNNER] Creating single-detection hotspot for {detection['species']}")
                new_hotspot = create_new_hotspot_from_detection(detection)
                hotspots_to_create.append(new_hotspot)
            else:
                print(f"[RUNNER] Skipping single low-risk detection: {detection['species']}")
        else:
            # Multiple unmatched detections - cluster them
            print(f"[RUNNER] Clustering {len(unmatched_detections)} unmatched detections...")
            new_hotspot_clusters = find_hotspots(unmatched_detections, radius_km)
            hotspots_to_create.extend(new_hotspot_clusters)
            
            # Handle any remaining single detections that didn't cluster
            processed_in_clusters = set()
            for cluster in new_hotspot_clusters:
                processed_in_clusters.update(cluster.get("detection_ids", []))
            
            remaining = [d for d in unmatched_detections if d["id"] not in processed_in_clusters]
            for detection in remaining:
                if detection["danger_level"] in ["high", "extreme"]:
                    print(f"[RUNNER] Creating hotspot for isolated detection: {detection['species']}")
                    new_hotspot = create_new_hotspot_from_detection(detection)
                    hotspots_to_create.append(new_hotspot)
    
    # Step 5: Merge nearby hotspots (both existing and new)
    all_hotspots = list(hotspots_to_update.values()) + hotspots_to_create
    if len(all_hotspots) > 1:
        print(f"[RUNNER] Merging nearby hotspots...")
        merged_hotspots = merge_nearby_hotspots(all_hotspots, radius_km)
        
        # Separate merged hotspots back into update/create lists
        hotspots_to_update = {}
        hotspots_to_create = []
        
        for hotspot in merged_hotspots:
            if hotspot.get("id"):
                # This is an existing hotspot that was merged
                hotspots_to_update[hotspot["id"]] = hotspot
            else:
                # This is a new hotspot
                hotspots_to_create.append(hotspot)
    
    # Step 6: Update existing hotspots in Firestore
    updated_count = 0
    for hotspot_id, hotspot in hotspots_to_update.items():
        try:
            # Prepare update data
            update_data = {
                "detection_count": hotspot["detection_count"],
                "detection_ids": hotspot["detection_ids"],
                "species_counts": hotspot["species_counts"],
                "species": hotspot["species"],
                "danger_level": hotspot["danger_level"],
                "species_summary": hotspot.get("summary", hotspot.get("species_summary", "")),
                "center": {
                    "lat": hotspot["center_lat"],
                    "lng": hotspot["center_lng"]
                },
                "updated_at": firestore.SERVER_TIMESTAMP
            }
            
            db.collection("hotspots").document(hotspot_id).update(update_data)
            updated_count += 1
            print(f"[RUNNER] Updated hotspot {hotspot_id}: {hotspot['detection_count']} detections, species='{hotspot['species']}', species_counts={hotspot['species_counts']}")
        except Exception as e:
            print(f"[ERROR] Failed to update hotspot {hotspot_id}: {e}")
    
    # Step 7: Create new hotspots in Firestore
    created_count = 0
    created_hotspot_ids = []
    
    for hotspot in hotspots_to_create:
        try:
            hotspot_ref = db.collection("hotspots").add({
                "species": hotspot["species"],
                "species_counts": hotspot.get("species_counts", {hotspot["species"]: hotspot["detection_count"]}),
                "danger_level": hotspot["danger_level"],
                "center": {
                    "lat": hotspot["center_lat"],
                    "lng": hotspot["center_lng"]
                },
                "radius_km": radius_km,
                "detection_count": hotspot.get("count", hotspot.get("detection_count", 1)),
                "detection_ids": hotspot.get("detection_ids", []),
                "species_summary": hotspot.get("summary", ""),
                "species_counts": hotspot.get("species_counts", {}),
                "created_at": firestore.SERVER_TIMESTAMP,
                "updated_at": firestore.SERVER_TIMESTAMP
            })
            
            hotspot_id = hotspot_ref[1].id
            created_hotspot_ids.append(hotspot_id)
            created_count += 1
            print(f"[RUNNER] Created hotspot {hotspot_id}: species='{hotspot.get('species')}', species_counts={hotspot.get('species_counts', {})}, summary='{hotspot.get('summary', 'New hotspot')}'")
            
            # Create alert for new hotspot (only for snake/wildlife, not insects)
            # Check if hotspot contains any insect detections
            hotspot_category = hotspot.get("category", "unknown")
            if hotspot_category not in ["mosquito", "insect"]:
                # Alert should show all species, not just primary
                alert_species = hotspot.get("species", "Unknown")
                alert_summary = hotspot.get("summary", hotspot.get("species_summary", "New hotspot"))
                db.collection("alerts").add({
                    "species": alert_species,
                    "message": f"High-risk hotspot detected: {alert_summary}",
                    "hotspot_id": hotspot_id,
                    "radius_km": radius_km,
                    "created_at": firestore.SERVER_TIMESTAMP
                })
                print(f"[RUNNER] Created alert for hotspot {hotspot_id} with species='{alert_species}', summary='{alert_summary}'")
        except Exception as e:
            print(f"[ERROR] Failed to create hotspot: {e}")
    
    # Step 8: Clean up stale hotspots (older than 7 days with no recent detections)
    print(f"[RUNNER] Cleaning up stale hotspots...")
    stale_threshold = firestore.SERVER_TIMESTAMP
    # Note: In production, you'd want to check updated_at timestamp
    # For now, we'll skip this to avoid deleting active hotspots
    
    return {
        "status": "success",
        "hotspots_created": created_count,
        "hotspots_updated": updated_count,
        "hotspot_ids": created_hotspot_ids,
        "total_detections_processed": len(detections)
    }
