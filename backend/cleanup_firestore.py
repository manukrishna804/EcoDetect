"""
Script to clean up Firestore collections (hotspots and alerts)
Run this to remove all hotspots and alerts from Firestore
"""
from firebase.firebase_init import init_firebase

def cleanup_hotspots_and_alerts():
    """Delete all documents from hotspots and alerts collections"""
    db = init_firebase()
    
    print("=" * 60)
    print("Firestore Cleanup Script")
    print("=" * 60)
    
    # Clean up hotspots
    print("\n[1] Cleaning up 'hotspots' collection...")
    hotspots_ref = db.collection("hotspots")
    hotspot_count = 0
    try:
        docs = hotspots_ref.stream()
        for doc in docs:
            doc.reference.delete()
            hotspot_count += 1
        print(f"✅ Deleted {hotspot_count} hotspot document(s)")
    except Exception as e:
        print(f"❌ Error deleting hotspots: {e}")
    
    # Clean up alerts
    print("\n[2] Cleaning up 'alerts' collection...")
    alerts_ref = db.collection("alerts")
    alert_count = 0
    try:
        docs = alerts_ref.stream()
        for doc in docs:
            doc.reference.delete()
            alert_count += 1
        print(f"✅ Deleted {alert_count} alert document(s)")
    except Exception as e:
        print(f"❌ Error deleting alerts: {e}")
    
    print("\n" + "=" * 60)
    print("Cleanup Complete!")
    print("=" * 60)
    print(f"\nSummary:")
    print(f"  - Hotspots deleted: {hotspot_count}")
    print(f"  - Alerts deleted: {alert_count}")
    print(f"\nNote: 'detections' collection was NOT modified.")
    print("      You can run hotspot analysis again to recreate hotspots.")

if __name__ == "__main__":
    try:
        cleanup_hotspots_and_alerts()
    except Exception as e:
        import traceback
        print(f"\n❌ Error during cleanup:")
        traceback.print_exc()
