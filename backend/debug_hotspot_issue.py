"""
Debug script to check why hotspots aren't being created
Run this to see what's happening with your detections
"""
from firebase.firebase_init import init_firebase
from hotspot.logic import get_recent_detections
from hotspot.runner import run_hotspot_analysis

def debug_hotspot_issue():
    """Debug why hotspots aren't being created"""
    db = init_firebase()
    
    print("=" * 60)
    print("Hotspot Creation Debug")
    print("=" * 60)
    
    # Step 1: Check recent detections
    print("\n[1] Checking recent detections...")
    detections = get_recent_detections(db, hours=24)
    print(f"Found {len(detections)} recent detections")
    
    if len(detections) == 0:
        print("\n❌ No detections found! Make some detections first.")
        return
    
    # Analyze detections
    print("\n[2] Analyzing detections...")
    high_risk = [d for d in detections if d["danger_level"] in ["high", "extreme"]]
    low_risk = [d for d in detections if d["danger_level"] not in ["high", "extreme"]]
    insects = [d for d in detections if d.get("category", "").lower() in ["mosquito", "insect"]]
    
    print(f"  - High/Extreme risk: {len(high_risk)}")
    print(f"  - Low risk: {len(low_risk)}")
    print(f"  - Insects: {len(insects)}")
    
    if len(high_risk) == 0:
        print("\n❌ No high/extreme risk detections found!")
        print("   Hotspots are only created for high/extreme risk detections.")
        print("   Your detections have these danger levels:")
        for d in detections[:5]:  # Show first 5
            print(f"     - {d['species']}: {d['danger_level']}")
        return
    
    # Check location availability
    print("\n[3] Checking location data...")
    with_location = [d for d in high_risk if d.get("lat") and d.get("lng")]
    without_location = len(high_risk) - len(with_location)
    
    print(f"  - With valid location: {len(with_location)}")
    print(f"  - Without location: {without_location}")
    
    if len(with_location) == 0:
        print("\n❌ High-risk detections don't have location data!")
        print("   Make sure location is enabled when detecting.")
        return
    
    # Show sample detections
    print("\n[4] Sample high-risk detections:")
    for i, d in enumerate(with_location[:3], 1):
        print(f"  {i}. {d['species']} - {d['danger_level']} risk")
        print(f"     Location: ({d['lat']}, {d['lng']})")
        print(f"     Category: {d.get('category', 'unknown')}")
    
    # Try to run hotspot analysis
    print("\n[5] Running hotspot analysis...")
    try:
        result = run_hotspot_analysis(db)
        print(f"\n✅ Analysis completed:")
        print(f"   - Hotspots created: {result.get('hotspots_created', 0)}")
        print(f"   - Hotspots updated: {result.get('hotspots_updated', 0)}")
        print(f"   - Total processed: {result.get('total_detections_processed', 0)}")
        
        if result.get('hotspots_created', 0) == 0 and result.get('hotspots_updated', 0) == 0:
            print("\n⚠️  No hotspots were created or updated!")
            print("   Check the console output above for details.")
    except Exception as e:
        print(f"\n❌ Error during analysis:")
        import traceback
        traceback.print_exc()
    
    print("\n" + "=" * 60)
    print("Debug Complete!")
    print("=" * 60)

if __name__ == "__main__":
    debug_hotspot_issue()
