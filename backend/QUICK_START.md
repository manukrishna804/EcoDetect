# Quick Start Guide - Recreate Firestore Collections

## ✅ Good News!
**Firestore collections are created automatically** when you add the first document. You don't need to manually create them!

## 🚀 Quick Setup (3 Steps)

### Step 1: Verify Current State
```bash
cd backend
python verify_firestore_setup.py
```

This shows which collections exist. If you deleted everything, they'll all be empty/missing (which is fine).

### Step 2: Make a Detection
1. **Start your frontend** (if not already running)
2. **Use the detection feature** to detect a species (snake, insect, etc.)
3. **Enable location** when prompted
4. The detection will be saved to `detections` collection automatically

### Step 3: Run Hotspot Analysis
**Option A: Via Browser**
```
http://127.0.0.1:5000/run-hotspot
```

**Option B: Via Frontend**
```javascript
import { triggerHotspotAnalysis } from './services/hotspotService';
await triggerHotspotAnalysis();
```

This will:
- Read detections from `detections` collection
- Create/update hotspots in `hotspots` collection
- Create alerts in `alerts` collection (for snake hotspots only)

## 📊 What Gets Created

### After Step 2 (Detection):
- ✅ `detections` collection created with your detection

### After Step 3 (Hotspot Analysis):
- ✅ `hotspots` collection created (if you have high/extreme risk detections)
- ✅ `alerts` collection created (if hotspots were created)

## 🔍 Verify Everything Works

```bash
cd backend
python verify_firestore_setup.py
```

You should see all three collections with data!

## 📝 Data Flow Summary

```
1. User detects species
   ↓
2. Frontend saves to "detections" collection
   ↓
3. Backend runs hotspot analysis
   ↓
4. Backend reads "detections" collection
   ↓
5. Backend creates/updates "hotspots" collection
   ↓
6. Backend creates "alerts" collection (for new snake hotspots)
   ↓
7. Frontend reads "hotspots" and "alerts" to display
```

## ⚠️ Important Notes

1. **Insects (Aedes, mosquitoes)** are saved to `detections` but:
   - ❌ Do NOT create hotspots
   - ❌ Do NOT create alerts
   - ✅ Are shown separately on the hotspot page

2. **Only high/extreme risk detections** create hotspots:
   - ✅ `danger_level: "high"` → Creates hotspot
   - ✅ `danger_level: "extreme"` → Creates hotspot
   - ❌ `danger_level: "low"` → No hotspot (unless near existing hotspot)

3. **Hotspots update incrementally**:
   - First run: Creates hotspot
   - Second run: Updates same hotspot (increments count)
   - No duplicates created!

## 🐛 Troubleshooting

### Collections not appearing?
- Check Firebase connection: `python -c "from firebase.firebase_init import init_firebase; db = init_firebase(); print('✅ Connected')"`
- Verify service account key exists: `backend/firebase/serviceAccountKey.json`

### Hotspots not created?
- Make sure you have detections with `danger_level: "high"` or `"extreme"`
- Check that detections have `location.available: true`
- Look at backend console for debug messages

### Need to start fresh?
```bash
cd backend
python cleanup_firestore.py  # Removes hotspots and alerts only
# Then follow steps above
```
