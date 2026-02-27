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

# Optional: Register precaution if it exists
try:
    import importlib
    precaution_mod = importlib.import_module("routes.precaution")
    app.register_blueprint(precaution_mod.precaution_bp)
except (ImportError, ModuleNotFoundError):
    pass  # Silently skip if not found to avoid IDE alerts

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


@app.route("/species", methods=["GET"])
def get_species():
    """Get all species from the local species.json file"""
    try:
        import json
        import os
        
        # Get absolute path to species.json
        current_dir = os.path.dirname(os.path.abspath(__file__))
        species_path = os.path.join(current_dir, "data", "species.json")
        
        with open(species_path, "r") as f:
            data = json.load(f)
            
        species_dict = data.get("species", {})
        species_list = []
        
        for slug, info in species_dict.items():
            # Use the slug (class name) as the primary name as requested
            # Format it nicely: ades -> Ades, common-kraits -> Common Kraits
            display_name = slug.replace("_", " ").replace("-", " ").title()
            
            species_item = {
                "id": slug,
                "name": display_name,
                "scientific_name": info.get("scientific_name", ""),
                "category": info.get("category", "Unknown"),
                "danger_level": info.get("danger_level", "low"),
                "description": info.get("ai_note", ""),
                "image_url": info.get("media", {}).get("image", ""),
            }
            species_list.append(species_item)
            
        return species_list
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}, 500


@app.route("/species/<slug>", methods=["GET"])
def get_species_detail(slug):
    """Get full details for a specific species by its slug"""
    try:
        import json
        import os
        
        current_dir = os.path.dirname(os.path.abspath(__file__))
        species_path = os.path.join(current_dir, "data", "species.json")
        
        with open(species_path, "r") as f:
            data = json.load(f)
            
        species_dict = data.get("species", {})
        if slug not in species_dict:
            return {"status": "error", "message": "Species not found"}, 404
            
        info = species_dict[slug]
        # Format the detail object
        detail = {
            "id": slug,
            "name": slug.replace("_", " ").replace("-", " ").title(),
            **info
        }
        return detail
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}, 500


if __name__ == "__main__":
    app.run(debug=True)
