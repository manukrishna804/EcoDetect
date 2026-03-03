# EcoDetect - ML & AI-Powered Image Detection System

EcoDetect is a web-based, multi-species image detection system designed to identify harmful insects and venomous animals. It leverages advanced ML and AI models to provide real-time risk prediction, and delivers appropriate safety and precautionary measures to users.

## 🎯 Problem Objectives

1.  **Real-Time Detection & Classification**: Detect and localize species using **YOLOv11** with confidence scoring and venom/hazard classification.
2.  **Risk Prediction**: Provide instant precaution and first-aid guidance to prevent misidentification and panic-killing.
3.  **Hotspot Analysis**: Analyze geo-tagged detection data to identify and visualize high-risk clusters on an interactive map.
4.  **Emergency Support**: Enable one-click emergency contact with ambulance and forest authorities through real-time risk alerts.
5.  **Awareness & Education**: Provide verified species information (habitat, behavior, medical relevance) and promote responsible environmental interaction.

## 🚀 Key Features

-   🔍 **AI Detection**: High-accuracy species identification using YOLOv11.
-   💬 **AI Assistant**: Gemini-powered chatbot for instant species-related queries.
-   📍 **Interactive Mapping**: Leaflet-based map visualizing detection hotspots.
-   🆘 **Emergency Protocols**: Quick access to first-aid and emergency contacts.
-   ⚠️ **Proximity Alerts**: Real-time notifications for nearby hazards.
-   📚 **Species Library**: Comprehensive database of local fauna and safety measures.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React.js](https://reactjs.org/) (Vite)
- **Styling**: Vanilla CSS, Module CSS
- **Maps**: [Leaflet](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/)
- **State Management**: React Hooks
- **Icons**: Lucide-react

### Backend
- **Core**: [Flask](https://flask.palletsprojects.com/) (Python)
- **AI/ML**: [Ultralytics YOLOv11](https://docs.ultralytics.com/), [ONNX Runtime](https://onnxruntime.ai/)
- **LLM**: [Google Gemini Pro](https://ai.google.dev/aistudio) (Generative AI)
- **Database/Auth**: [Firebase](https://firebase.google.com/) (Firestore & Authentication)

## ⚙️ Installation & Setup

### 1. Prerequisites
- Python 3.10+
- Node.js & npm
- Firebase Project
- Google Gemini API Key

### 2. Backend Setup
```powershell
cd backend
# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with following keys:
# GEMINI_API_KEY=your_key
# FIREBASE_PROJECT_ID=your_id
# (Add other firebase config as needed)

python app.py
```
The backend will run at `http://127.0.0.1:5000`.

### 3. Frontend Setup
```powershell
cd frontend
# Install dependencies
npm install

# Create .env file with Firebase configuration
# VITE_FIREBASE_API_KEY=...
# VITE_FIREBASE_AUTH_DOMAIN=...
# (Add all vite-required firebase keys)

npm run dev
```
The application will be accessible at `http://localhost:5173`.

## 📁 Project Structure

```text
EcoDetect/
├── backend/            # Flask API, YOLO models, and AI logic
│   ├── routes/         # API endpoints (detect, chat, hotspot)
│   ├── firebase/       # Shared firebase initialization
│   ├── app.py          # Main server entry
│   └── requirements.txt
├── frontend/           # React application
│   ├── src/
│   │   ├── pages/      # View components (Home, Detect, Hotspot, etc.)
│   │   ├── components/ # Reusable UI elements
│   │   └── data/       # Static assets and protocol data
│   └── package.json
└── README.md
```

## 📜 License
This project is developed for educational and environmental awareness purposes.
