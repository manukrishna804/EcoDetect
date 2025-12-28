from flask import Blueprint

precaution_bp = Blueprint("precaution", __name__)

@precaution_bp.route("/precaution")
def precaution():
    return {
        "do": ["Stay calm", "Move away slowly"],
        "dont": ["Do not touch", "Do not provoke"]
    }
