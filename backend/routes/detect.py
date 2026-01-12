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

def get_snake_info(class_name):
    # Load snake data
    json_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'snakes.json')
    try:
        with open(json_path, 'r') as f:
            snakes_data = json.load(f)
        
        # Normalize class name
        class_name_lower = class_name.lower().strip()
        
        # 1. Exact match
        for snake in snakes_data:
            if snake['name'].lower() == class_name_lower:
                return snake
                
        # 2. Match if valid class is in database name (e.g. 'cobra' in 'King Cobra')
        # or vice versa
        for snake in snakes_data:
            snake_name = snake['name'].lower()
            if class_name_lower in snake_name or snake_name in class_name_lower:
                return snake
                
        # 3. Fallback: Return a generic template with the detected name
        return {
            "name": class_name,
            "biological_name": "Unknown",
            "risk": "Unknown",
            "description": f"Detected as {class_name}, but specific details are not in our database.",
            "image": "https://via.placeholder.com/300?text=" + class_name.replace(" ", "+"),
            "confidence_score": 0.0
        }
    except Exception as e:
        print(f"Error reading JSON: {e}")
        return None

@detect_bp.route("/detect", methods=["POST"])
def detect():
    global model
    if model is None:
        # Try loading again if it failed initially
        load_model()
        if model is None:
             # Fallback to dummy if model fails strictly? Or return error?
             # User asked to use the .pt, so we should try to use it.
             # If completely fails, maybe return error.
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
             return jsonify({"error": "No snake detected"}), 200
             
        # Find box with max confidence
        # Ultralytics boxes are usually sorted? Let's just take the one with max conf.
        best_box = max(r.boxes, key=lambda x: x.conf[0])
        
        conf = float(best_box.conf[0])
        cls_id = int(best_box.cls[0])
        class_name = model.names[cls_id]
        
        # Retrieve info
        snake_info = get_snake_info(class_name)
        
        if snake_info:
            # Update confidence with actual detection score
            # Create a copy to not mutate the cache/list reference
            response_data = snake_info.copy()
            response_data['confidence_score'] = round(conf, 2)
            
            # If the JSON image is a placeholder, maybe we keep it? 
            # Or we could return the uploaded image as base64? 
            # For now, keep the database image as reference.
            
            return jsonify(response_data)
        else:
             return jsonify({"error": "Species data not found"}), 404

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
