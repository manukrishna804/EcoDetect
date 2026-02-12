from flask import Flask
from flask_cors import CORS
from firebase.firebase_init import init_firebase
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

db = init_firebase()


app = Flask(__name__)
CORS(app)

from routes.detect import detect_bp
from hotspot.runner import run_hotspot_analysis
from routes.chat import chat_bp

app.register_blueprint(detect_bp)
app.register_blueprint(chat_bp)

# Optional: Only register precaution if it exists
try:
    from routes.precaution import precaution_bp
    app.register_blueprint(precaution_bp)
except ImportError:
    print("[WARNING] routes.precaution not found, skipping registration")

@app.route("/")
def health():
    return {"status": "backend running"}
@app.route("/test-firestore")
def test_firestore():
    docs = db.collection("detections").limit(1).stream()
    for doc in docs:
        return doc.to_dict()
    return {"message": "No detections found"}
@app.route("/run-hotspot", methods=["GET", "POST"])
def run_hotspot():
    """Run hotspot analysis and create hotspots in Firestore"""
    try:
        result = run_hotspot_analysis(db)
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}, 500

@app.route("/hotspots", methods=["GET"])
def get_hotspots():
    """Get all hotspots from Firestore"""
    try:
        hotspots = []
        docs = db.collection("hotspots").stream()
        for doc in docs:
            hotspot_data = doc.to_dict()
            hotspot_data["id"] = doc.id
            # Convert Firestore timestamps to ISO format strings for JSON serialization
            if hotspot_data.get("created_at"):
                if hasattr(hotspot_data["created_at"], "isoformat"):
                    hotspot_data["created_at"] = hotspot_data["created_at"].isoformat()
            if hotspot_data.get("updated_at"):
                if hasattr(hotspot_data["updated_at"], "isoformat"):
                    hotspot_data["updated_at"] = hotspot_data["updated_at"].isoformat()
            hotspots.append(hotspot_data)
        return {"status": "success", "hotspots": hotspots, "count": len(hotspots)}
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}, 500


if __name__ == "__main__":
    app.run(debug=True)
