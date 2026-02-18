"""
Chat route for Google Gemini integration
Handles chatbot messages and forwards them to Google Gemini API
"""
from flask import Blueprint, request, jsonify
import os
from google import genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/chat', methods=['POST'])
def chat():
    """
    Handle chat messages from frontend
    Receives user message and returns AI response from Google Gemini
    """
    try:
        # Get user message from request
        data = request.get_json()
        user_message = data.get('message', '')
        
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Get API key from environment
        google_api_key = os.getenv('GOOGLE_API_KEY')
        
        # Check if API key is configured
        if not google_api_key:
            return jsonify({
                'reply': 'Sorry, the chatbot is not configured. Please set a valid GOOGLE_API_KEY in the .env file and restart the server.'
            }), 200
        
        # Initialize Gemini client with the new library
        client = genai.Client(api_key=google_api_key)
        
        # Send message to Gemini using the new API
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=user_message,
            config=genai.types.GenerateContentConfig(
                system_instruction="""You are the EcoDetect AI Assistant. Your purpose is to provide immediate, accurate, and life-saving information about harmful insects and venomous animals (snakes, spiders, etc.).

                STRICT GUIDELINES:
                1.  **Scope**: Answer ONLY questions related to insects, snakes, venomous animals, bites, stings, first aid, and safety precautions.
                2.  **Out of Scope**: If asked about anything else (e.g., cooking, coding, general knowledge), clearly and politely refuse. State that you can only assist with wildlife safety and emergencies.
                3.  **Format**:
                    *   Use **concise bullet points** for readability.
                    *   Keep answers short and direct.
                    *   Use **bold text** for critical warnings or key steps.
                4.  **Tone**: Calm, authoritative, and helpful.
                5.  **Emergency**: If the user indicates a bite or life-threatening situation, prioritize instructing them to seek medical help immediately.

                Example interactions:
                User: "I saw a cobra."
                You:
                *   **Do not approach.**
                *   Keep a safe distance (at least 6 feet).
                *   Slowly back away.
                *   Call animal control if it's in a house."""
            )
        )
        
        # Extract AI response
        ai_reply = response.text
        
        return jsonify({'reply': ai_reply}), 200
        
    except Exception as e:
        error_message = str(e)
        print(f"Error in chat endpoint: {error_message}")
        
        # Provide more specific error messages
        if "API_KEY_INVALID" in error_message or "API Key not found" in error_message:
            return jsonify({
                'reply': 'Invalid API key. Please check your GOOGLE_API_KEY in the .env file and restart the server.'
            }), 200
        elif "quota" in error_message.lower():
            return jsonify({
                'reply': 'API quota exceeded. Please check your Gemini API usage limits.'
            }), 200
        else:
            return jsonify({
                'reply': f'Sorry, I encountered an error: {error_message}'
            }), 200
