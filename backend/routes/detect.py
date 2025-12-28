from flask import Blueprint

detect_bp = Blueprint("detect", __name__)

@detect_bp.route("/detect", methods=["POST"])
def detect():
    return {
        "species": "snake",
        "confidence": 0.92,
        "harm_level": "high"
    }
