from datetime import datetime, timedelta, timezone
from hotspot.distance import haversine

DANGEROUS_LEVELS = ["high", "extreme"]

def get_recent_detections(db, hours=24):
    """
    Fetches all detections from the last N hours that have a valid location.
    Does NOT filter by danger level at this stage.
    """
    now = datetime.now(timezone.utc)
    cutoff_time = now - timedelta(hours=hours)

    detections = []
    docs = db.collection("detections").stream()

    for doc in docs:
        data = doc.to_dict()

        if not data.get("timestamp"):
            continue

        timestamp = data["timestamp"]

        if not isinstance(timestamp, datetime):
            # Handle case where timestamp might not be a datetime object
            print(f"[DEBUG] Invalid timestamp format for {doc.id}: {timestamp} (type: {type(timestamp)})")
            continue

        is_loc_available = data.get("location", {}).get("available")
        is_recent = timestamp >= cutoff_time

        if is_loc_available and is_recent:
            # Normalize danger_level to lowercase to handle "Extreme", "EXTREME", etc.
            raw_danger_level = data.get("danger_level", "unknown")
            normalized_danger_level = str(raw_danger_level).lower().strip() if raw_danger_level else "unknown"
            
            # Extract species - CRITICAL: Use detected_class from Firestore
            # This is the field that contains the actual species name from the AI model
            species = data.get("detected_class")
            if not species:
                # Fallback to other possible field names (for backwards compatibility)
                species = data.get("species_name") or data.get("species") or "Unknown"
            
            # Normalize species name (strip whitespace, handle None)
            if species:
                species = str(species).strip()
            else:
                species = "Unknown"
            
            detection_data = {
                "id": doc.id,
                "lat": data["location"]["lat"],
                "lng": data["location"]["lng"],
                "species": species,  # This will be used in update_hotspot_with_detection
                "danger_level": normalized_danger_level,
                "timestamp": timestamp,
                "confidence": data.get("confidence", 0),
                "category": data.get("category", "unknown")  # Add category to filter insects
            }
            detections.append(detection_data)
            
            # Debug print for each detection
            print(f"[DEBUG] Detection {doc.id}: species='{species}' (from detected_class='{data.get('detected_class')}', species_name='{data.get('species_name')}', species='{data.get('species')}') - danger_level: '{raw_danger_level}' -> normalized: '{normalized_danger_level}'")
        else:
            # Debugging skipped items
            if not is_loc_available:
                print(f"[DEBUG] Skipped {doc.id}: location not available")
            if not is_recent:
                print(f"[DEBUG] Skipped {doc.id}: not recent (timestamp: {timestamp})")

    print(f"[DEBUG] Total recent valid detections: {len(detections)}")
    if len(detections) > 0:
        danger_level_counts = {}
        for d in detections:
            level = d["danger_level"]
            danger_level_counts[level] = danger_level_counts.get(level, 0) + 1
        print(f"[DEBUG] Danger level breakdown: {danger_level_counts}")
    return detections


def get_existing_hotspots(db):
    """
    Fetches all existing hotspots from Firestore.
    Returns a list of hotspot dicts with their document IDs.
    """
    hotspots = []
    docs = db.collection("hotspots").stream()
    
    for doc in docs:
        data = doc.to_dict()
        
        # CRITICAL: Load species_counts from Firestore
        # If missing, initialize as empty dict (don't assume all detections are same species)
        species_counts = data.get("species_counts", {})
        
        # Validate species_counts is a dict
        if not isinstance(species_counts, dict):
            print(f"[WARNING] Hotspot {doc.id} has invalid species_counts type, resetting to empty dict")
            species_counts = {}
        
        # If species_counts is empty but hotspot has a species field, we can't safely
        # reconstruct it without fetching all detection documents. So we leave it empty
        # and let update_hotspot_with_detection rebuild it from new detections.
        # This is safer than assuming all detections are the same species.
        
        hotspot = {
            "id": doc.id,
            "center_lat": data.get("center", {}).get("lat"),
            "center_lng": data.get("center", {}).get("lng"),
            "detection_count": data.get("detection_count", 0),
            "detection_ids": data.get("detection_ids", []),
            "species_counts": species_counts,  # May be empty if old hotspot
            "species": data.get("species", "Unknown"),  # Primary species (for display)
            "danger_level": data.get("danger_level", "unknown"),
            "updated_at": data.get("updated_at"),
            "created_at": data.get("created_at")
        }
        
        # Log warning if species_counts is empty but detection_count > 0
        # This indicates an old hotspot that needs species_counts reconstruction
        if not species_counts and hotspot["detection_count"] > 0:
            print(f"[WARNING] Hotspot {doc.id} has {hotspot['detection_count']} detections but empty species_counts. Will rebuild from new detections.")
        
        print(f"[DEBUG] Loaded existing hotspot {doc.id}: species='{hotspot['species']}', detection_count={hotspot['detection_count']}, species_counts={hotspot['species_counts']}")
        hotspots.append(hotspot)
    
    print(f"[DEBUG] Found {len(hotspots)} existing hotspot(s) in Firestore")
    return hotspots


def find_nearest_hotspot(detection_lat, detection_lng, existing_hotspots, radius_km=10):
    """
    Finds the nearest existing hotspot within radius_km of the detection.
    Returns (hotspot_dict, distance_km) or (None, None) if no hotspot found.
    """
    min_distance = float('inf')
    nearest_hotspot = None
    
    for hotspot in existing_hotspots:
        if hotspot["center_lat"] is None or hotspot["center_lng"] is None:
            continue
            
        distance = haversine(
            detection_lat, detection_lng,
            hotspot["center_lat"], hotspot["center_lng"]
        )
        
        if distance <= radius_km and distance < min_distance:
            min_distance = distance
            nearest_hotspot = hotspot
    
    if nearest_hotspot:
        print(f"[DEBUG] Detection ({detection_lat}, {detection_lng}) is {min_distance:.2f}km from hotspot {nearest_hotspot['id']}")
        return nearest_hotspot, min_distance
    
    return None, None


def update_hotspot_with_detection(hotspot, detection, radius_km=10):
    """
    Updates an existing hotspot with a new detection.
    
    CRITICAL: This function MUST use the species from the CURRENT detection,
    never reuse the first detected species. Each detection's species is tracked
    separately in species_counts.
    
    Args:
        hotspot: Hotspot dict (will be modified in-place)
        detection: Detection dict with 'id', 'species', 'danger_level', etc.
        radius_km: Radius for hotspot (unused but kept for API compatibility)
    
    Returns:
        Updated hotspot dict
    """
    # STEP 1: Ensure detection ID is added (prevent duplicates)
    detection_id = detection.get("id")
    if not detection_id:
        print(f"[ERROR] Detection missing ID, cannot update hotspot")
        return hotspot
    
    if detection_id not in hotspot.get("detection_ids", []):
        if "detection_ids" not in hotspot:
            hotspot["detection_ids"] = []
        hotspot["detection_ids"].append(detection_id)
        print(f"[DEBUG] Added detection {detection_id} to hotspot {hotspot.get('id', 'new')}")
    else:
        print(f"[WARNING] Detection {detection_id} already in hotspot {hotspot.get('id', 'new')}, skipping duplicate")
        return hotspot  # Already processed, don't update counts
    
    # STEP 2: Extract species from CURRENT detection (CRITICAL - never reuse old species)
    # The detection's species comes from detected_class field in Firestore
    species = detection.get("species")
    if not species or species == "Unknown":
        print(f"[ERROR] Detection {detection_id} has invalid/missing species: '{species}'. Cannot update hotspot.")
        return hotspot
    
    # Normalize species name (handle spaces, case variations)
    species = str(species).strip()
    print(f"[DEBUG] Updating hotspot {hotspot.get('id', 'new')} with detection {detection_id}: species='{species}'")
    
    # STEP 3: Initialize species_counts if missing (safely, without overwriting)
    if "species_counts" not in hotspot:
        hotspot["species_counts"] = {}
        print(f"[DEBUG] Initialized empty species_counts for hotspot {hotspot.get('id', 'new')}")
    
    # If species_counts exists but is empty/dict-like, ensure it's a proper dict
    if not isinstance(hotspot["species_counts"], dict):
        print(f"[WARNING] Hotspot {hotspot.get('id', 'new')} has invalid species_counts type, resetting")
        hotspot["species_counts"] = {}
    
    # STEP 4: Update species_counts with CURRENT detection's species
    # This is the KEY fix: we increment the count for THIS detection's species,
    # NOT the hotspot's existing primary species
    current_count = hotspot["species_counts"].get(species, 0)
    hotspot["species_counts"][species] = current_count + 1
    print(f"[DEBUG] Updated species_counts: {species} = {hotspot['species_counts'][species]} (was {current_count})")
    print(f"[DEBUG] Full species_counts after update: {hotspot['species_counts']}")
    
    # STEP 5: Update detection count (should match length of detection_ids)
    hotspot["detection_count"] = len(hotspot["detection_ids"])
    
    # STEP 6: Update danger level (take highest)
    current_level = str(hotspot.get("danger_level", "low")).lower().strip()
    detection_level = str(detection.get("danger_level", "low")).lower().strip()
    
    if detection_level == "extreme" or current_level == "extreme":
        hotspot["danger_level"] = "extreme"
    elif detection_level == "high" or current_level == "high":
        hotspot["danger_level"] = "high"
    else:
        hotspot["danger_level"] = detection_level if detection_level != "low" else current_level
    
    # STEP 7: Update primary species (most frequent species in species_counts)
    # This is just for display - the real data is in species_counts
    if hotspot["species_counts"]:
        # Find species with highest count
        primary_species = max(
            hotspot["species_counts"].items(),
            key=lambda x: x[1]  # Sort by count
        )[0]
        hotspot["species"] = primary_species
        print(f"[DEBUG] Updated primary species to '{primary_species}' (most frequent, count={hotspot['species_counts'][primary_species]})")
    else:
        # Fallback: use detection's species if species_counts is somehow empty
        hotspot["species"] = species
        print(f"[WARNING] species_counts is empty, using detection species '{species}' as primary")
    
    # STEP 8: Update summary string (all species with counts)
    species_summary_parts = []
    for sp, count in sorted(hotspot["species_counts"].items(), key=lambda x: x[1], reverse=True):
        species_summary_parts.append(f"{count} {sp}")
    hotspot["summary"] = ", ".join(species_summary_parts)
    
    print(f"[DEBUG] ✅ Hotspot {hotspot.get('id', 'new')} updated: {hotspot['detection_count']} detections, species='{hotspot['species']}', species_counts={hotspot['species_counts']}, summary='{hotspot['summary']}'")
    return hotspot


def create_new_hotspot_from_detection(detection):
    """
    Creates a new hotspot dict from a single detection.
    """
    species = detection.get("species", "Unknown")
    print(f"[DEBUG] Creating new hotspot from detection {detection['id']}: species='{species}'")
    hotspot = {
        "center_lat": detection["lat"],
        "center_lng": detection["lng"],
        "detection_count": 1,
        "detection_ids": [detection["id"]],
        "species_counts": {species: 1},
        "species": species,
        "danger_level": detection.get("danger_level", "low"),
        "summary": f"1 {species}"
    }
    print(f"[DEBUG] Created new hotspot with species='{hotspot['species']}', species_counts={hotspot['species_counts']}")
    return hotspot


def find_hotspots(detections, radius_km=10):
    """
    Groups detections into hotspots based on proximity.
    A hotspot is formed if there are detections within radius_km.
    Only hotspots that contain at least one HIGH/EXTREME risk detection are returned.
    This function is used for initial clustering when no hotspots exist.
    """
    hotspots = []
    processed_ids = set()

    for i, center_det in enumerate(detections):
        if center_det["id"] in processed_ids:
            continue

        # Start a new cluster with this detection
        cluster = [center_det]
        processed_ids.add(center_det["id"])

        # Find all other detections within radius
        for j, other_det in enumerate(detections):
            if i == j or other_det["id"] in processed_ids:
                continue

            distance = haversine(
                center_det["lat"], center_det["lng"],
                other_det["lat"], other_det["lng"]
            )

            if distance <= radius_km:
                cluster.append(other_det)
                processed_ids.add(other_det["id"])

        # Analyze the cluster
        cluster_danger_levels = [d["danger_level"] for d in cluster]
        has_dangerous = any(d["danger_level"] in DANGEROUS_LEVELS for d in cluster)
        
        print(f"[DEBUG] Cluster {i}: {len(cluster)} detections, danger_levels: {cluster_danger_levels}, has_dangerous: {has_dangerous}")

        if has_dangerous:
            # Aggregate species counts
            species_counts = {}
            detection_ids = []
            max_danger_level = "low"
            
            for d in cluster:
                sp = d["species"]
                species_counts[sp] = species_counts.get(sp, 0) + 1
                detection_ids.append(d["id"])
                # Track highest danger level
                if d["danger_level"] == "extreme":
                    max_danger_level = "extreme"
                elif d["danger_level"] == "high" and max_danger_level != "extreme":
                    max_danger_level = "high"
            
            # Find most frequent dangerous species for display
            dangerous_species = [sp for sp in species_counts.keys() if any(
                d["species"] == sp and d["danger_level"] in DANGEROUS_LEVELS for d in cluster
            )]
            # Use the most frequent species (not just the first dangerous one)
            if species_counts:
                primary_species = max(species_counts.items(), key=lambda x: x[1])[0]
            else:
                primary_species = dangerous_species[0] if dangerous_species else center_det.get("species", "Unknown")
            print(f"[DEBUG] Cluster primary_species='{primary_species}' (from species_counts: {species_counts})")
            
            # center location (average of all in cluster)
            avg_lat = sum(d["lat"] for d in cluster) / len(cluster)
            avg_lng = sum(d["lng"] for d in cluster) / len(cluster)

            formatted_summary = ", ".join([f"{count} {sp}" for sp, count in species_counts.items()])
            
            hotspots.append({
                "center_lat": avg_lat,
                "center_lng": avg_lng,
                "species": primary_species,
                "danger_level": max_danger_level,
                "count": len(cluster),
                "species_counts": species_counts,
                "summary": formatted_summary,
                "detection_ids": detection_ids
            })

    return hotspots


def merge_nearby_hotspots(hotspots, radius_km=10):
    """
    Merges hotspots that are within radius_km of each other.
    Returns a list of merged hotspots.
    """
    if len(hotspots) <= 1:
        return hotspots
    
    merged = []
    processed = set()
    
    for i, hotspot1 in enumerate(hotspots):
        if i in processed:
            continue
        
        cluster = [hotspot1]
        processed.add(i)
        
        # Find all hotspots within radius
        for j, hotspot2 in enumerate(hotspots):
            if i == j or j in processed:
                continue
            
            distance = haversine(
                hotspot1["center_lat"], hotspot1["center_lng"],
                hotspot2["center_lat"], hotspot2["center_lng"]
            )
            
            if distance <= radius_km:
                cluster.append(hotspot2)
                processed.add(j)
        
        # Merge cluster into one hotspot
        if len(cluster) > 1:
            # Combine all detection IDs
            all_detection_ids = []
            all_species_counts = {}
            max_danger_level = "low"
            
            for h in cluster:
                all_detection_ids.extend(h.get("detection_ids", []))
                for sp, count in h.get("species_counts", {}).items():
                    all_species_counts[sp] = all_species_counts.get(sp, 0) + count
                
                h_level = h.get("danger_level", "low").lower()
                if h_level == "extreme":
                    max_danger_level = "extreme"
                elif h_level == "high" and max_danger_level != "extreme":
                    max_danger_level = "high"
            
            # Remove duplicate detection IDs
            all_detection_ids = list(set(all_detection_ids))
            
            # Calculate weighted center
            total_weight = sum(len(h.get("detection_ids", [])) for h in cluster)
            if total_weight > 0:
                avg_lat = sum(
                    h["center_lat"] * len(h.get("detection_ids", [])) 
                    for h in cluster
                ) / total_weight
                avg_lng = sum(
                    h["center_lng"] * len(h.get("detection_ids", [])) 
                    for h in cluster
                ) / total_weight
            else:
                avg_lat = sum(h["center_lat"] for h in cluster) / len(cluster)
                avg_lng = sum(h["center_lng"] for h in cluster) / len(cluster)
            
            # Primary species (most frequent)
            primary_species = max(all_species_counts.items(), key=lambda x: x[1])[0] if all_species_counts else cluster[0]["species"]
            
            merged_hotspot = {
                "id": cluster[0].get("id"),  # Keep first hotspot's ID
                "center_lat": avg_lat,
                "center_lng": avg_lng,
                "detection_count": len(all_detection_ids),
                "detection_ids": all_detection_ids,
                "species_counts": all_species_counts,
                "species": primary_species,
                "danger_level": max_danger_level,
                "summary": ", ".join([f"{count} {sp}" for sp, count in all_species_counts.items()])
            }
            merged.append(merged_hotspot)
            print(f"[DEBUG] Merged {len(cluster)} hotspots into one (ID: {merged_hotspot.get('id')})")
        else:
            merged.append(cluster[0])
    
    return merged
