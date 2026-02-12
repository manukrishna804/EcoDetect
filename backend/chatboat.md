# Chatbot Setup Guide

This guide explains how to set up and run the AI Chatbot backend for the EcoDetect project.

## 1. Prerequisites

- Python 3.10+
- A Google Cloud Project with the Gemini API enabled.
- An API Key from [Google AI Studio](https://aistudio.google.com/app/apikey).

## 2. Environment Configuration

1.  Navigate to the `backend` directory.
2.  Create a `.env` file (if it doesn't exist). You can copy the template from `.env.example`:
    ```bash
    cp .env.example .env
    ```
3.  Open the `.env` file and add your Google API Key:
    ```ini
    GOOGLE_API_KEY=your_actual_api_key_here
    ```
    > **Note:** Do not commit your `.env` file to version control.

## 3. Install Dependencies

Ensure you have the required Python packages installed. Run the following command in the `backend` directory:

```bash
pip install flask python-dotenv google-genai
```

## 4. Run the Backend

Start the Flask server:

```bash
python app.py
```

The server will start on `http://127.0.0.1:5000`.

## 5. Verify the Chatbot

You can test if the chatbot is working by sending a POST request to the `/chat` endpoint.

**Using curl:**
```bash
curl -X POST http://127.0.0.1:5000/chat \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello, are there mosquitoes nearby?"}'
```

**Using Python:**
Run the provided test script:
```bash
python test_chatbot.py
```

If successful, you should receive a JSON response with the AI's reply.
