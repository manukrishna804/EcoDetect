"""
Chat route for Groq AI integration - Optimized Hybrid Architecture
Handles chatbot messages with multi-layered logic: 
1. Intent Routing (Rule-based)
2. Local Wildlife Knowledge Base
3. Nearest Hospital Filtering (Location-aware)
4. Groq (gpt-oss-20b) Fallback
"""
from flask import Blueprint, request, jsonify
import os
import json
import re
import math
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

chat_bp = Blueprint('chat', __name__)

# --- IN-MEMORY CACHE ---
CHAT_CACHE = {}

# --- HOSPITAL DATA (Simplified for Backend logic) ---
# Extracted from hospitals.js
HOSPITALS = [
    {"name": "Government Medical College, Thiruvananthapuram", "lat": 8.5234, "lon": 76.9284, "district": "Thiruvananthapuram"},
    {"name": "District Hospital, Kollam", "lat": 8.8872, "lon": 76.5891, "district": "Kollam"},
    {"name": "General Hospital, Pathanamthitta", "lat": 9.2648, "lon": 76.7870, "district": "Pathanamthitta"},
    {"name": "Government Medical College, Alappuzha", "lat": 9.4292, "lon": 76.3533, "district": "Alappuzha"},
    {"name": "Government Medical College, Kottayam", "lat": 9.6264, "lon": 76.5244, "district": "Kottayam"},
    {"name": "District Hospital, Painavu", "lat": 9.8492, "lon": 76.9452, "district": "Idukki"},
    {"name": "Government Medical College, Kochi", "lat": 10.0543, "lon": 76.3524, "district": "Ernakulam"},
    {"name": "Government Medical College, Thrissur", "lat": 10.6124, "lon": 76.2081, "district": "Thrissur"},
    {"name": "Government District Hospital, Palakkad", "lat": 10.7781, "lon": 76.6512, "district": "Palakkad"},
    {"name": "Manjeri Medical College", "lat": 11.1214, "lon": 76.1212, "district": "Malappuram"},
    {"name": "District Hospital, Mananthavady", "lat": 11.8012, "lon": 76.0052, "district": "Wayanad"},
    {"name": "Government Medical College, Kozhikode", "lat": 11.2724, "lon": 75.8361, "district": "Kozhikode"},
    {"name": "Government Medical College, Pariyaram", "lat": 12.0652, "lon": 75.2952, "district": "Kannur"},
    {"name": "General Hospital, Kasaragod", "lat": 12.5052, "lon": 74.9912, "district": "Kasaragod"}
]

# --- LOCAL WILDLIFE KNOWLEDGE BASE ---
WILDLIFE_KB = {
    "cobra_hood": "A cobra flares its hood as a defensive warning. It's trying to look larger and more intimidating to scare away threats.",
    "why_bite": "Snakes usually bite only in self-defense when they feel cornered, stepped on, or threatened. They prefer to avoid humans.",
    "venom_purpose": "Snake venom is primarily used for immobilizing and digesting prey, not for attacking humans.",
    "hiss": "Hissing is a warning signal. The snake is telling you it's stressed and you should back away immediately.",
    "defense_behavior": "Most snakes will try to flee first. If they can't escape, they may hiss, coil, raise their heads, or strike as a last resort."
}

# --- LOCAL INTENT RESPONSES ---
LOCAL_RESPONSES = {
    "FIRST_AID": {
        "message": "**SNAKE BITE FIRST AID:**\n\n1. **Stay Calm & Immobilize**: Movement spreads venom. Keep the limb still and below heart level.\n2. **Remove Constrictions**: Take off rings, watches, or tight clothing.\n3. **Do NOT cut or suck**: This is dangerous.\n4. **Get to a Hospital**: Seek medical help immediately.",
        "action": "OPEN_FIRST_AID",
        "suggestedActions": ["First Aid Guide", "Find Nearby Hospitals", "Call SOS"]
    },
    "PRECAUTIONS": {
        "message": "**SNAKE SAFETY PRECAUTIONS:**\n\n• Stay at least 6 feet away from any snake.\n• Wear footwear outdoors, especially at night.\n• Use a flashlight to see where you are stepping.\n• Keep your surroundings clean to avoid attracting rodents.",
        "action": "OPEN_PRECAUTIONS",
        "suggestedActions": ["View Precautions", "Scan with Camera"]
    },
    "HOSPITAL": {
        "message": "I recommend checking our **Nearby Hospitals** map to see the closest facilities with antivenom. I can also help you find specific ones if you share your location.",
        "action": "OPEN_HOSPITAL_MAP",
        "suggestedActions": ["Find Nearby Hospitals", "Call SOS"]
    },
    "SNAKE_IDENTIFICATION": {
        "message": "For safe identification, please use our **AI Camera Detection** feature. It's safer than getting close enough to describe the snake.",
        "action": "OPEN_CAMERA_DETECTION",
        "suggestedActions": ["Scan with Camera"]
    },
    "EMERGENCY": {
        "message": "🚨 **EMERGENCY ASSISTANCE**\n\n1. Move away from the animal immediately.\n2. If bitten, stay still and call help.\n3. Use our **SOS Call** feature to reach emergency services.",
        "action": "CALL_EMERGENCY",
        "suggestedActions": ["Call SOS", "Find Nearby Hospitals", "First Aid Guide"]
    }
}

# --- SYSTEM PROMPT FOR GROQ ---
SYSTEM_PROMPT = """You are a snake safety assistant inside a wildlife emergency app.

Your responsibilities:
- Explain snake behavior and wildlife safety
- Provide snake bite first aid instructions
- Guide users to nearby hospitals only when medical help is required
- Suggest using the snake detection feature when identification is requested

Rules:
- Only mention hospitals if the user asks about a snake bite, injury, or medical help.
- Do not mention hospitals for general educational questions about snakes.
- Keep responses concise and relevant.
- You MUST return a VALID JSON object with:
   {"message": "string", "action": "ACTION_NAME", "suggestedActions": ["list"]}
Actions: OPEN_FIRST_AID, OPEN_PRECAUTIONS, OPEN_HOSPITAL_MAP, OPEN_CAMERA_DETECTION, CALL_EMERGENCY, NONE."""

def calculate_distance(lat1, lon1, lat2, lon2):
    """Haversine formula to calculate distance"""
    R = 6371  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def route_intent(message):
    """Refined keyword-based intent router"""
    msg = message.lower()
    
    if re.search(r"help|emergency|urgent|sos|call|ambulance", msg):
        return "EMERGENCY"
    if re.search(r"bite|bitten|biting|venom|poison|suck|tourniquet", msg):
        return "FIRST_AID"
    if re.search(r"hospital|doctor|clinic|treatment|antivenom|medical", msg):
        return "HOSPITAL"
    if re.search(r"identify|what snake|which snake|kind of snake|detection|camera|scan", msg):
        return "SNAKE_IDENTIFICATION"
    if re.search(r"prevent|avoid|precaution|safety|safe|habit|footwear|flashlight", msg):
        return "PRECAUTIONS"
    
    # Check Wildlife KB keywords
    for key in WILDLIFE_KB:
        pattern = key.replace('_', ' ')
        if re.search(r'\b' + re.escape(pattern) + r'\b', msg):
            return "WILDLIFE_EDUCATION"
            
    return "GENERAL_AI"

@chat_bp.route('/chat', methods=['POST'])
def chat():
    """
    Hybrid Chat Handler with Redesigned Architecture
    """
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip()
        user_location = data.get('location')  # Expected format: "lat, lon"
        
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400

        # 1. CACHE CHECK
        cache_key = f"{user_message.lower()}_{user_location}"
        if cache_key in CHAT_CACHE:
            return jsonify(CHAT_CACHE[cache_key]), 200

        # 2. INTENT ROUTING
        intent = route_intent(user_message)
        
        # 3. LOCAL RESPONSES
        if intent in LOCAL_RESPONSES:
            resp = LOCAL_RESPONSES[intent]
            
            # Special logic for HOSPITAL with location
            if intent == "HOSPITAL" and user_location:
                try:
                    lat, lon = map(float, user_location.split(','))
                    nearby = sorted(HOSPITALS, key=lambda h: calculate_distance(lat, lon, h['lat'], h['lon']))[:3]
                    hosp_names = ", ".join([h['name'] for h in nearby])
                    resp["message"] = f"Based on your location, the nearest antivenom centers are: {hosp_names}. You can see them on our full map."
                except: pass
                
            CHAT_CACHE[cache_key] = resp
            return jsonify(resp), 200

        # 4. WILDLIFE KB CHECK
        if intent == "WILDLIFE_EDUCATION":
            for key, val in WILDLIFE_KB.items():
                if key.replace('_', ' ') in user_message.lower():
                    resp = {
                        "message": val,
                        "action": "NONE",
                        "suggestedActions": ["First Aid Guide", "View Precautions"]
                    }
                    CHAT_CACHE[cache_key] = resp
                    return jsonify(resp), 200

        # 5. GROQ FALLBACK
        groq_api_key = os.getenv('GROQ_API_KEY')
        if not groq_api_key:
            return jsonify({
                "message": "I can help with snake safety. Try asking about first aid or nearby hospitals.",
                "action": "NONE",
                "suggestedActions": ["First Aid Guide"]
            }), 200
        
        try:
            client = Groq(api_key=groq_api_key)
            
            # Location Aware prompting for Fallback
            loc_context = ""
            # Only include hospital context if intent suggests medical need
            if user_location and intent in ["FIRST_AID", "HOSPITAL", "EMERGENCY"]:
                try:
                    lat, lon = map(float, user_location.split(','))
                    nearby = sorted(HOSPITALS, key=lambda h: calculate_distance(lat, lon, h['lat'], h['lon']))[:2]
                    loc_context = f"\n[Context: User is near {nearby[0]['name']}]"
                except: pass

            completion = client.chat.completions.create(
                model="openai/gpt-oss-20b",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"{user_message}{loc_context}"}
                ],
                response_format={"type": "json_object"}
            )
            
            ai_data = json.loads(completion.choices[0].message.content)
            CHAT_CACHE[cache_key] = ai_data
            return jsonify(ai_data), 200
            
        except Exception as e:
            print(f"Groq Fallback Error: {str(e)}")
            return jsonify({
                "message": "I'm having trouble with my AI brain right now, but I can still answer basic safety questions locally.",
                "action": "NONE",
                "suggestedActions": ["First Aid Guide", "Find Nearby Hospitals"]
            }), 200
        
    except Exception as e:
        print(f"Chat Error: {str(e)}")
        return jsonify({
            'message': 'Sorry, I encountered an error. Please try again.',
            'action': "NONE",
            'suggestedActions': []
        }), 200
