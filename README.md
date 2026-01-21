# EcoDetect - Insect Detection Project

This project consists of a React frontend and a Flask backend.

## Tech Stack
- Frontend: React (Vite)
- Backend: Flask, Python
- AI Model: YOLOv11 (Ultralytics)

## How to Run

You need to run **both** the frontend and the backend terminal windows simultaneously.

### 1. Start the Backend
Open a terminal and run:
```powershell
cd backend
# Optional: Activate virtual environment if you created one
# .\venv\Scripts\activate
python app.py
```
The server will start at `http://127.0.0.1:5000`.

### 2. Start the Frontend
Open a **new** terminal window and run:
```powershell
cd frontend
npm run dev
```
The application will be accessible at the URL shown in the terminal (usually `http://localhost:5173`).

## Troubleshooting
- **Backend**: Ensure you have installed dependencies: `pip install -r backend/requirements.txt`
- **Frontend**: Ensure you have installed node modules: `cd frontend` then `npm install`
