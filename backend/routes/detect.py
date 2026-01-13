from flask import Blueprint

detect_bp = Blueprint("detect", __name__)

import random
import json
import os
from flask import request, jsonify

import random
import json
import os
import io
import logging
from flask import Blueprint, request, jsonify
from PIL import Image

# Global model variable
model = None

detect_bp = Blueprint("detect", __name__)

def load_model():
    global model
    if model is None:
        try:
            from ultralytics import YOLO
            model_path = os.path.join(os.path.dirname(__file__), '..', 'best.pt')
            if os.path.exists(model_path):
                model = YOLO(model_path)
                print(f"Model loaded from {model_path}")
            else:
                print(f"Model not found at {model_path}")
        except Exception as e:
            print(f"Error loading model: {e}")

# Load model on start (or first request)
load_model()


def get_species_info(class_name):
    # Load species data
    json_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'species.json')
    try:
        with open(json_path, 'r') as f:
            data = json.load(f)
            species_data = data.get("species", {})
        
        # Normalize class name
        class_name_lower = class_name.lower().strip()
        
        # Match class name with keys in species.json (case-insensitive)
        matched_key = None
        for key in species_data.keys():
            if key.lower().strip() == class_name_lower or key.lower() in class_name_lower or class_name_lower in key.lower():
                matched_key = key
                break
        
        if matched_key:
            info = species_data[matched_key]
            # strict requirement: return ONLY minimal fields
            return {
                "common_name": matched_key,
                "species_name": class_name, # The model class
                "danger_level": info.get("danger_level", "Unknown"),
                "confidence_score": 0.0, # Placeholder, will be updated
                # Detailed results as requested
                "risk_info": info.get("risk_info", {}),
                "ai_note": info.get("ai_note", ""),
                "emergency": info.get("emergency", {}),
                "scientific_name": info.get("scientific_name", "")
            }
                
        # Fallback: Return a generic template with the detected name
        return {
            "common_name": class_name,
            "species_name": class_name,
            "danger_level": "Unknown",
            "confidence_score": 0.0,
            "risk_info": {},
            "ai_note": "No specific data found for this species.",
            "emergency": {},
            "scientific_name": "Unknown"
        }
    except Exception as e:
        print(f"Error reading JSON: {e}")
        return None

@detect_bp.route("/detect", methods=["POST"])
def detect():
    global model
    if model is None:
        load_model()
        if model is None:
             return jsonify({"error": "Detection model not available"}), 500

    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No image selected"}), 400

    try:
        # Read and preprocess image
        image_bytes = file.read()
        img = Image.open(io.BytesIO(image_bytes))
        
        # Run inference
        results = model(img)
        
        # Process results
        if not results or len(results) == 0:
             return jsonify({"error": "No objects detected"}), 200
             
        # Get top prediction (highest confidence)
        r = results[0]
        if len(r.boxes) == 0:
             return jsonify({"error": "No species detected"}), 200
             
        # Find box with max confidence
        best_box = max(r.boxes, key=lambda x: x.conf[0])
        
        conf = float(best_box.conf[0])
        cls_id = int(best_box.cls[0])
        class_name = model.names[cls_id]
        
        # Retrieve info
        species_info = get_species_info(class_name)
        
        if species_info:
            # Update confidence with actual detection score
            response_data = species_info.copy()
            response_data['confidence_score'] = round(conf, 2)
            
            return jsonify(response_data)
        else:
             return jsonify({"error": "Species data not found"}), 404

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

