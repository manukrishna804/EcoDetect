# Hotspot Species Tracking Bug Fix

## Problem Description

When a **different species** was detected within an existing hotspot radius, the system was incorrectly:
1. **Incrementing the count of the FIRST detected species** instead of the new species
2. **Not adding the new species to `species_counts`**
3. **Causing the frontend to show incorrect species counts**

### Example Bug Scenario:
1. First detection: `pit_viper` → Creates hotspot with `species_counts: {"pit_viper": 1}`
2. Second detection: `King cobra` → Should update to `species_counts: {"pit_viper": 1, "King cobra": 1}`
3. **BUG**: Instead, it became `species_counts: {"pit_viper": 2}` (wrong!)

## Root Cause Analysis

### Primary Bug: Incorrect `species_counts` Initialization

**Location**: `backend/hotspot/logic.py` - `update_hotspot_with_detection()` function

**The Problem**:
```python
# OLD BUGGY CODE:
if "species_counts" not in hotspot or not hotspot["species_counts"]:
    hotspot["species_counts"] = {}
    if hotspot.get("species") and hotspot.get("species") != "Unknown":
        existing_count = hotspot.get("detection_count", 1)
        hotspot["species_counts"][hotspot["species"]] = existing_count  # ❌ WRONG!
```

**Why This Was Wrong**:
- When a hotspot didn't have `species_counts`, we initialized it by assuming **ALL existing detections** were of the `species` field
- If `detection_count = 2`, we set `species_counts[existing_species] = 2`
- This **overwrote** any actual species diversity
- When a new detection came in, we incremented the wrong species

### Secondary Issues:

1. **Species Extraction**: Needed to ensure `detected_class` is always used (the field from Firestore)
2. **Missing Validation**: No check to prevent duplicate detection processing
3. **Insufficient Logging**: Hard to debug when species_counts was incorrect

## The Fix

### 1. Fixed `update_hotspot_with_detection()` Function

**Key Changes**:
- ✅ **Always use the CURRENT detection's species** - never reuse the hotspot's existing species
- ✅ **Increment species_counts for the detection's species** - not the hotspot's primary species
- ✅ **Prevent duplicate processing** - check if detection ID already exists
- ✅ **Safe initialization** - don't assume all detections are the same species
- ✅ **Comprehensive logging** - track every step of the update

**New Logic Flow**:
```python
1. Check if detection ID already processed → Skip if duplicate
2. Extract species from CURRENT detection (detected_class field)
3. Initialize species_counts as empty dict if missing (don't assume)
4. Increment species_counts[detection_species] by 1
5. Update primary species to most frequent in species_counts
6. Update summary string with all species
```

### 2. Improved Species Extraction

**Location**: `get_recent_detections()`

**Changes**:
- ✅ Prioritize `detected_class` field (the actual AI model output)
- ✅ Normalize species names (strip whitespace)
- ✅ Better fallback handling for edge cases

### 3. Safe Hotspot Loading

**Location**: `get_existing_hotspots()`

**Changes**:
- ✅ Don't assume all detections are same species when `species_counts` is missing
- ✅ Leave `species_counts` empty for old hotspots (will rebuild from new detections)
- ✅ Validate `species_counts` is a dict type

## Code Changes Summary

### `update_hotspot_with_detection()` - Complete Refactor

**Before**: ~50 lines with buggy initialization
**After**: ~120 lines with:
- Step-by-step processing with clear comments
- Duplicate detection prevention
- Proper species extraction from current detection
- Safe species_counts initialization
- Comprehensive debug logging

### Key Fix Snippet:
```python
# OLD (BUGGY):
if "species_counts" not in hotspot:
    hotspot["species_counts"] = {hotspot["species"]: hotspot["detection_count"]}  # ❌ Assumes all same species

# NEW (CORRECT):
if "species_counts" not in hotspot:
    hotspot["species_counts"] = {}  # ✅ Start empty, build from actual detections

# Then update with CURRENT detection's species:
species = detection.get("species")  # From detected_class field
hotspot["species_counts"][species] = hotspot["species_counts"].get(species, 0) + 1  # ✅ Correct!
```

## Testing Verification

### Test Case 1: Different Species in Same Hotspot
1. Detect `pit_viper` → Creates hotspot: `{"pit_viper": 1}`
2. Detect `King cobra` at same location → Updates to: `{"pit_viper": 1, "King cobra": 1}` ✅
3. Detect `pit_viper` again → Updates to: `{"pit_viper": 2, "King cobra": 1}` ✅

### Test Case 2: Multiple Different Species
1. Detect `indian_cobra` → `{"indian_cobra": 1}`
2. Detect `rat_snake` → `{"indian_cobra": 1, "rat_snake": 1}` ✅
3. Detect `krait` → `{"indian_cobra": 1, "rat_snake": 1, "krait": 1}` ✅

### Test Case 3: Primary Species Updates
- When `King cobra` count exceeds `pit_viper`, primary `species` field updates to `King cobra`
- `species_counts` always shows all species correctly

## Backward Compatibility

### Old Hotspots Without `species_counts`
- Old hotspots (created before this fix) may have empty `species_counts`
- **Solution**: As new detections are added, `species_counts` will rebuild
- Historical data for old detections is lost, but new detections are tracked correctly
- **Future Enhancement**: Could add migration script to reconstruct from `detection_ids`

## Scalability & Concurrency

### Current Implementation:
- ✅ Uses Firestore `update()` operations (atomic)
- ✅ Prevents duplicate processing via `detection_ids` check
- ✅ Safe for concurrent detections (each detection processed once)

### Potential Improvements:
- Consider Firestore transactions for very high concurrency
- Add migration function to rebuild `species_counts` from historical detections

## Frontend Impact

The frontend already reads from `species_counts`, so:
- ✅ **No frontend changes needed**
- ✅ All species will now display correctly
- ✅ Species counts will be accurate
- ✅ Map popups will show all detected species

## Debugging

### New Log Messages:
```
[DEBUG] Updating hotspot <id> with detection <id>: species='King cobra'
[DEBUG] Updated species_counts: King cobra = 1 (was 0)
[DEBUG] Full species_counts after update: {'pit_viper': 1, 'King cobra': 1}
[DEBUG] Updated primary species to 'pit_viper' (most frequent, count=1)
[DEBUG] ✅ Hotspot <id> updated: 2 detections, species='pit_viper', species_counts={'pit_viper': 1, 'King cobra': 1}
```

## Summary

**Root Cause**: Incorrect initialization of `species_counts` assumed all detections were the same species.

**Fix**: Always use the CURRENT detection's species when updating `species_counts`, never reuse the hotspot's existing primary species.

**Result**: Multiple species can now coexist correctly in the same hotspot, with accurate counts for each species.
