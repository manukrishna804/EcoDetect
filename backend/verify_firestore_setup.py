"""
Verification script to check Firestore collections setup
Run this to verify that collections are created correctly
"""
import sys
import io

# Fix encoding for Windows console
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from firebase.firebase_init import init_firebase

def verify_collections():
    """Check if collections exist and show their structure"""
    db = init_firebase()
    
    print("=" * 60)
    print("Firestore Collections Verification")
    print("=" * 60)
    
    collections_to_check = ["detections", "hotspots", "alerts"]
    
    for collection_name in collections_to_check:
        print(f"\n[{collection_name.upper()}] Collection")
        print("-" * 60)
        
        try:
            docs = db.collection(collection_name).limit(5).stream()
            doc_count = 0
            sample_doc = None
            
            for doc in docs:
                if doc_count == 0:
                    sample_doc = doc.to_dict()
                doc_count += 1
            
            if doc_count > 0:
                print(f"[OK] Collection exists with {doc_count} document(s) (showing first 5)")
                if sample_doc:
                    print(f"\nSample document structure:")
                    for key, value in sample_doc.items():
                        value_str = str(value)
                        if len(value_str) > 50:
                            value_str = value_str[:50] + "..."
                        print(f"  - {key}: {value_str}")
            else:
                print(f"[WARNING] Collection exists but is empty")
                print(f"   (This is normal if you just cleaned up)")
        except Exception as e:
            print(f"[ERROR] Collection does not exist or error: {e}")
            print(f"   (Will be created automatically when first document is added)")
    
    print("\n" + "=" * 60)
    print("Verification Complete!")
    print("=" * 60)
    print("\nNext Steps:")
    print("1. Make a detection through the frontend -> creates 'detections' collection")
    print("2. Run hotspot analysis -> creates 'hotspots' and 'alerts' collections")
    print("3. Run this script again to verify collections are populated")

if __name__ == "__main__":
    try:
        verify_collections()
    except Exception as e:
        import traceback
        print(f"\n[ERROR] Error during verification:")
        traceback.print_exc()
