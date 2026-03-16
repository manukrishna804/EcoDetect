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

from data.snake_db import SNAKE_DB

# Load environment variables
load_dotenv()

chat_bp = Blueprint('chat', __name__)

# --- IN-MEMORY CACHE ---
CHAT_CACHE = {}

# --- HOSPITAL DATA (Loaded from Frontend) ---
HOSPITALS = []
try:
    hospitals_path = os.path.join(os.path.dirname(__file__), '../../frontend/src/data/hospitals.js')
    with open(hospitals_path, 'r', encoding='utf-8') as f:
        js_content = f.read()
        
    # Extract hospital attributes from JS array
    pattern = r'name:\s*"([^"]+)",\s*district:\s*"([^"]+)",\s*latitude:\s*([\d\.]+),\s*longitude:\s*([\d\.]+)'
    for match in re.finditer(pattern, js_content):
        HOSPITALS.append({
            "name": match.group(1),
            "district": match.group(2),
            "lat": float(match.group(3)),
            "lon": float(match.group(4))
        })
except Exception as e:
    print(f"Warning: Failed to load hospitals from frontend data: {e}")


SNAKE_SESSIONS = {}

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
        "suggestedActions": ["View Precautions"]
    },
    "HOSPITAL": {
        "message": "You can find all nearby medical facilities, including general hospitals and clinics, on our **Nearby Hospitals** map. If you'd like me to point out the closest antivenom centers specifically, just share your location.",
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
SYSTEM_PROMPT = """You are a wildlife safety assistant for the EcoDetect app.

APP FEATURE RULE
If a user's problem can be solved using an app feature, guide them to that feature instead of explaining everything.
Examples:
- Snake identification → suggest the AI camera detection feature
- Snake bite → suggest the First Aid Guide
- Medical help → suggest Hospital Map or SOS call

MEDICAL SAFETY RULE
Only provide basic first aid steps that are widely accepted.
Do not invent medical treatments.
Always recommend professional medical help for bites or severe symptoms.

LOCATION RULE
Location context may be included.
Only reference location or nearby hospitals when the user asks about bites, injuries, treatment, or emergencies.
Do NOT mention hospitals for educational wildlife questions.

COMMUNICATION STYLE
Responses must be calm, educational, and practical.
Avoid fear-based language.

FORMATTING RULE
Make answers scannable:
- You MUST use literal markdown bullet points (`- `, `* `, or `1. `) for lists and steps. Do not just separate sentences with newlines.
- Use **bold text** for key safety warnings
- Keep responses concise

UNCERTAINTY RULE
If you are unsure about a wildlife fact, say so instead of guessing.

EDUCATION RULE
When answering wildlife questions, include a short safety or conservation tip if relevant.

LENGTH RULE
Keep responses under 80 words unless giving first aid instructions.

ACTION SELECTION RULE
Use actions only when they help the user take the next step.
Examples:
Snake bite → OPEN_FIRST_AID
Snake nearby → OPEN_PRECAUTIONS
Medical help → OPEN_HOSPITAL_MAP
Snake identification → OPEN_CAMERA_DETECTION

EMERGENCY ESCALATION RULE
If a user reports a snake bite, dangerous encounter, or severe symptoms:
1. Provide immediate safety instructions
2. Suggest emergency numbers (112 or 1800 425 4733, NEVER 911)
3. Suggest nearby hospitals

You MUST return a VALID JSON object in the format:
{
  "message": "string",
  "action": "ACTION_NAME",
  "suggestedActions": ["Human Readable Label"]
}

Valid ACTIONS: OPEN_FIRST_AID, OPEN_PRECAUTIONS, OPEN_HOSPITAL_MAP, OPEN_CAMERA_DETECTION, CALL_EMERGENCY, NONE.
Valid LABELS for suggestedActions: "First Aid Guide", "Find Hospitals", "Call SOS", "Scan Snake", "View Precautions".
"""

def calculate_distance(lat1, lon1, lat2, lon2):
    """Haversine formula to calculate distance"""
    R = 6371  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def get_snake_id_question(step):
    questions = {
        1: {
            "text": "Let's try to identify it. **Question 1:** What primary color was the snake?",
            "options": ["black", "brown", "green", "yellow", "grey", "blue", "olive", "bronze", "not sure"]
        },
        2: {
            "text": "**Question 2:** Did it have any patterns?",
            "options": ["bands", "spots", "stripes", "plain", "checkered", "zigzag", "spectacle", "monocle", "not sure"]
        },
        3: {
            "text": "**Question 3:** Did the snake spread a hood like a cobra?",
            "options": ["yes", "no", "not sure"]
        },
        4: {
            "text": "**Question 4:** Approximately how long was it?\n- **small** (<1 ft)\n- **medium** (1-3 ft)\n- **large** (>3 ft)\n- **not sure**",
            "options": ["small", "medium", "large", "not sure"]
        },
        5: {
            "text": "**Question 5:** Where did you see it?",
            "options": ["house", "field", "forest", "water", "trees", "garden", "village", "dry", "pond", "not sure"]
        },
        6: {
            "text": "**Question 6:** Was it during the day or night?",
            "options": ["day", "night", "not sure"]
        }
    }
    return questions.get(step)

def handle_snake_id_session(user_id, msg):
    session = SNAKE_SESSIONS.get(user_id)
    if not session:
        return None
        
    step = session["step"]
    
    if any(word in msg for word in ["cancel", "stop", "exit", "quit"]):
        del SNAKE_SESSIONS[user_id]
        return {
            "message": "Snake identification cancelled. How else can I help you?",
            "action": "NONE",
            "suggestedActions": []
        }
        
    q_data = get_snake_id_question(step)
    found_option = next((opt for opt in q_data["options"] if opt in msg), "not sure")
        
    session["answers"][step] = found_option
    session["step"] += 1
    
    next_q = get_snake_id_question(session["step"])
    
    if next_q:
        return {
            "message": next_q["text"],
            "action": "NONE",
            "suggestedActions": next_q["options"]
        }
    else:
        ans = session["answers"]
        
        # 1. Decision Filters (Pre-scoring elimination)
        candidates = []
        for snake in SNAKE_DB:
            # If user affirmatively saw a hood but snake doesn't have one, eliminate
            if ans[3] == "yes" and snake["hood"] == "no":
                continue
            # If user affirmatively saw NO hood but snake has one, eliminate
            if ans[3] == "no" and snake["hood"] == "yes":
                continue
            candidates.append(snake)
            
        # 2. Weighted Scoring (Max 14 points)
        # Hood: +5, Pattern: +3, Color: +2, Habitat: +2, Size: +1, Time: +1
        MAX_SCORE = 14
        matches = []
        
        for snake in candidates:
            score = 0
            if ans[3] != "not sure" and ans[3] == snake["hood"]:
                score += 5
            if ans[2] != "not sure" and ans[2] in snake["pattern"]:
                score += 3
            if ans[1] != "not sure" and ans[1] in snake["colors"]:
                score += 2
            if ans[5] != "not sure" and ans[5] in snake["habitats"]:
                score += 2
            if ans[4] != "not sure" and ans[4] in snake["size"]:
                score += 1
            if ans.get(6, "not sure") != "not sure" and ans.get(6) in snake["active_time"]:
                score += 1
                
            # Scale to a max of 85% rather than 100% since it's just an estimate
            confidence = round((score / MAX_SCORE) * 85)
            
            # Avoid displaying 0% matches for very low scores
            if confidence < 5:
                confidence = 5
                
            matches.append((confidence, snake))
            
        matches.sort(key=lambda x: x[0], reverse=True)
        top_snakes = matches[:3]
        
        del SNAKE_SESSIONS[user_id]
        
        resp_msg = "Based on your description, the snake may be:\n\n"
        has_venomous = False
        
        for conf, snake in top_snakes:
            venom_str = "⚠️ **Venomous**" if snake["venomous"] else "🟢 Non-venomous"
            if snake["venomous"]: has_venomous = True
            resp_msg += f"- **{snake['name']}** — {conf}% match ({venom_str})\n"
            
        resp_msg += "\n*This identification is only an estimate based on your description. Never approach or handle a snake.*\n"
        
        if has_venomous:
            resp_msg += "\n**⚠️ WARNING: One possible match is venomous. Keep a safe distance and seek help if needed.**\n"
            
        resp_msg += "\nUse the AI Camera Detection feature for a safer, more accurate identification."
        
        return {
            "message": resp_msg.strip(),
            "action": "OPEN_CAMERA_DETECTION",
            "suggestedActions": ["Scan Snake"]
        }

def route_intent(message):
    """Refined keyword-based intent router"""
    msg = message.lower()
    
    if re.search(r"\b(identify.*snake|describe.*snake|saw a snake|what snake|what kind of snake|couldnt take a photo|could not take a photo)\b", msg):
        return "SNAKE_DESCRIPTION_ID"
    if re.search(r"\b(help|emergency|urgent|sos|call|ambulance|police|fire)\b", msg):
        return "EMERGENCY"
    if re.search(r"\b(hospital|doctor|clinic|treatment|antivenom|medical|nearest)\b", msg) and not re.search(r"\b(why|how|what|is made|where does|is it)\b", msg):
        return "HOSPITAL"
    if re.search(r"\b(bite|bit|bitten|biting|venom|poison|suck|tourniquet)\b", msg) and not re.search(r"\b(why|how do|what makes|do they|can they)\b", msg):
        return "FIRST_AID"
    if re.search(r"\b(identify|what snake|which snake|kind of snake|detection|camera|scan)\b", msg):
        return "SNAKE_IDENTIFICATION"
    if re.search(r"\b(prevent|avoid|precaution|safety|safe|habit|footwear|flashlight)\b", msg):
        return "PRECAUTIONS"
    
    # Check Wildlife KB keywords
    for key in WILDLIFE_KB:
        keywords = key.split('_')
        if all(kw.lower() in msg for kw in keywords):
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

        # Normalization
        normalized_msg = re.sub(r'[^\w\s\']', '', user_message.lower()).strip()
        user_ip = request.remote_addr or "default_ip"

        # Check Active Snake ID Session BEFORE Intent Routing
        if user_ip in SNAKE_SESSIONS:
            session_resp = handle_snake_id_session(user_ip, normalized_msg)
            if session_resp:
                return jsonify(session_resp), 200

        # 1. CACHE CHECK
        cache_key = f"{normalized_msg}_{user_location}"
        if cache_key in CHAT_CACHE:
            return jsonify(CHAT_CACHE[cache_key]), 200

        # 2. INTENT ROUTING
        intent = route_intent(normalized_msg)
        
        # 2.5 Handle new Identification Intent
        if intent == "SNAKE_DESCRIPTION_ID":
            SNAKE_SESSIONS[user_ip] = {"step": 1, "answers": {}}
            first_q = get_snake_id_question(1)
            return jsonify({
                "message": first_q["text"],
                "action": "NONE",
                "suggestedActions": first_q["options"]
            }), 200
        
        # 3. LOCAL RESPONSES
        if intent in LOCAL_RESPONSES:
            resp = LOCAL_RESPONSES[intent]
            
            # Special logic for HOSPITAL with location
            if intent == "HOSPITAL" and user_location:
                try:
                    lat, lon = map(float, user_location.split(','))
                    nearby = sorted(HOSPITALS, key=lambda h: calculate_distance(lat, lon, h['lat'], h['lon']))[:3]
                    hosp_names = ", ".join([h['name'] for h in nearby])
                    resp["message"] = f"I've updated the map to show all general hospitals and clinics near you. For snake emergencies, the nearest specialized **antivenom centers** are: {hosp_names}."
                except: pass
                
            CHAT_CACHE[cache_key] = resp
            return jsonify(resp), 200

        # 4. WILDLIFE KB CHECK
        if intent == "WILDLIFE_EDUCATION" or intent == "GENERAL_AI":
            for key, val in WILDLIFE_KB.items():
                keywords = key.split('_')
                if all(kw.lower() in normalized_msg for kw in keywords):
                    resp = {
                        "message": val,
                        "action": "NONE",
                        "suggestedActions": []
                    }
                    CHAT_CACHE[cache_key] = resp
                    return jsonify(resp), 200

        # 5. GROQ FALLBACK
        groq_api_key = os.getenv('GROQ_API_KEY')
        if not groq_api_key:
            return jsonify({
                "message": "I can help with wildlife and insect safety. Try asking about first aid or nearby hospitals.",
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
