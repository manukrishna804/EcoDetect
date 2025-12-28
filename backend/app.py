from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

from routes.detect import detect_bp
from routes.precaution import precaution_bp

app.register_blueprint(detect_bp)
app.register_blueprint(precaution_bp)

@app.route("/")
def health():
    return {"status": "backend running"}

if __name__ == "__main__":
    app.run(debug=True)
