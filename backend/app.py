from flask import Flask
from flask_cors import CORS
from firebase.firebase_init import init_firebase

db = init_firebase()


app = Flask(__name__)
CORS(app)

from routes.detect import detect_bp
from routes.precaution import precaution_bp
from hotspot.runner import run_hotspot_analysis

app.register_blueprint(detect_bp)
app.register_blueprint(precaution_bp)

@app.route("/")
def health():
    return {"status": "backend running"}
@app.route("/test-firestore")
def test_firestore():
    docs = db.collection("detections").limit(1).stream()
    for doc in docs:
        return doc.to_dict()
    return {"message": "No detections found"}
@app.route("/run-hotspot")
def run_hotspot():
    result = run_hotspot_analysis(db)
    return {"status": result}


if __name__ == "__main__":
    app.run(debug=True)
