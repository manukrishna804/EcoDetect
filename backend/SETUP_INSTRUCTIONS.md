# Firestore Setup Instructions

## Overview
Firestore collections are created **automatically** when you add the first document. You don't need to manually create them.

## Collections Structure

### 1. `detections` Collection
**Created when:** A detection is saved through the frontend

**Structure:**
```javascript
{
  detected_class: "indian_cobra",
  danger_level: "extreme",
  category: "snake",  // or "mosquito", "insect"
  location: {
    lat: 10.897154,
    lng: 76.469677,
    available: true
  },
  timestamp: Firestore.Timestamp,
  confidence: 0.45,
  scientific_name: "Naja naja",
  venomous: false,
  tempUserId: "anon_xxx"
}
```

**How to populate:**
- Use the frontend detection feature
- Detections are saved automatically when you detect a species

### 2. `hotspots` Collection
**Created when:** Hotspot analysis runs and finds high-risk detections

**Structure:**
```javascript
{
  center: {
    lat: 10.897154,
    lng: 76.469677
  },
  radius_km: 10,
  detection_count: 5,
  detection_ids: ["id1", "id2", ...],
  species: "indian_cobra",
  danger_level: "extreme",
  species_counts: {
    "indian_cobra": 4,
    "rat_snake": 1
  },
  species_summary: "4 indian_cobra, 1 rat_snake",
  created_at: Firestore.Timestamp,
  updated_at: Firestore.Timestamp
}
```

**How to populate:**
- Run hotspot analysis: `http://127.0.0.1:5000/run-hotspot`
- Or use the frontend: Call `triggerHotspotAnalysis()` from `hotspotService.js`

### 3. `alerts` Collection
**Created when:** A new hotspot is created (not for insects)

**Structure:**
```javascript
{
  species: "indian_cobra",
  message: "High-risk hotspot detected: 4 indian_cobra, 1 rat_snake",
  hotspot_id: "hotspot-doc-id",
  radius_km: 10,
  created_at: Firestore.Timestamp
}
```

**How to populate:**
- Automatically created when hotspots are generated
- Only for snake/wildlife hotspots (not insects)

## Setup Steps

### Step 1: Verify Collections (Optional)
```bash
cd backend
python verify_firestore_setup.py
```

This will show you which collections exist and their current state.

### Step 2: Make Some Detections
1. Start your frontend
2. Use the detection feature to detect some species
3. Make sure location is enabled
4. Detections will be saved to `detections` collection automatically

### Step 3: Run Hotspot Analysis
```bash
# Backend should be running
# Visit: http://127.0.0.1:5000/run-hotspot
```

Or use the frontend:
```javascript
import { triggerHotspotAnalysis } from './services/hotspotService';
await triggerHotspotAnalysis();
```

### Step 4: Verify Everything Works
```bash
cd backend
python verify_firestore_setup.py
```

You should see:
- ✅ `detections` collection with your detections
- ✅ `hotspots` collection with hotspots (if you have high-risk detections)
- ✅ `alerts` collection with alerts (if hotspots were created)

## Important Notes

1. **Collections are created automatically** - No manual creation needed
2. **Insects don't create hotspots** - Aedes/mosquito detections are stored but don't trigger hotspots/alerts
3. **Hotspots update incrementally** - Running analysis multiple times updates existing hotspots instead of recreating them
4. **Only high/extreme risk detections** create hotspots (low risk detections are stored but don't create hotspots unless near an existing hotspot)

## Troubleshooting

### Collections not appearing?
- Make sure Firebase is initialized correctly
- Check that `firebase/firebase_init.py` has correct credentials
- Verify you have write permissions in Firestore

### Hotspots not being created?
- Check that you have detections with `danger_level: "high"` or `"extreme"`
- Make sure detections have valid location data
- Check backend console for debug messages

### Alerts not being created?
- Alerts are only created for new hotspots (not updates)
- Insects don't create alerts
- Check that hotspot creation is successful first
