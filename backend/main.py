
from fastapi import FastAPI, Response, Request
from fastapi.responses import JSONResponse
import importlib.util
import sys
import os
import json
from .modules import home_assistant, bluetooth, text_to_speech
from .contracts import BluetoothDeviceMetadata, DashboardContract, FeatureContract, Control

app = FastAPI()

# Emergency escalation endpoints
@app.post("/emergency/escalate")
async def emergency_escalate(request: Request):
    data = await request.json()
    primary = data.get("primary", "911")
    alt = data.get("alt", None)
    # Integrate with AI, voice recognition, and escalation logic
    print(f"[EMERGENCY] Escalation triggered! Calling {primary}{' and ' + alt if alt else ''}.")
    # TODO: Add real call/SMS integration
    return JSONResponse({"status": "ok", "primary": primary, "alt": alt})
from .contracts import BluetoothDeviceMetadata
# Endpoint: List discovered Bluetooth devices and driver status
@app.get("/bluetooth-devices")
def list_bluetooth_devices():
    # Placeholder: Replace with real discovery logic
    devices = [
        BluetoothDeviceMetadata(name="Bluetooth Speaker", address="00:11:22:33:44:55", device_type="audio", driver_installed=True, driver_version="1.0.0", last_seen="2026-02-01T12:00:00Z"),
        BluetoothDeviceMetadata(name="Health Sensor", address="AA:BB:CC:DD:EE:FF", device_type="sensor", driver_installed=False, driver_version="", last_seen="2026-02-01T12:05:00Z")
    ]
    return JSONResponse([d.dict() for d in devices])
# ...existing code...

# Accessibility: text notifications and speech-to-text input
@app.post("/accessibility/notify")
async def accessibility_notify(request: Request):
    data = await request.json()
    message = data.get("message", "")
    # Here you would trigger frontend visual alert or text notification
    return {"status": "ok", "message": message}

@app.post("/accessibility/speech-to-text")
async def accessibility_speech_to_text(request: Request):
    data = await request.json()
    audio_data = data.get("audio", None)
    # Integrate with voice_recognition module
    from .modules import voice_recognition
    text_result = None
    if audio_data:
        # TODO: Save audio_data to temp file and pass to recognizer
        # For now, just call recognize_voice()
        text_result = voice_recognition.recognize_voice()
    else:
        text_result = voice_recognition.recognize_voice()
    return {"status": "ok", "text": text_result}
    device_info = {'name': device_name, 'id': device_id}
    result = bluetooth.download_and_install_driver(device_info, user_approved)
    return Response(content=result, media_type="text/plain")

from fastapi import FastAPI, Response
from fastapi.responses import JSONResponse
import os
import json
TEMPLATE_LIBRARY_PATH = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'ai', 'template_library.json')

@app.get("/ai-templates")
def get_ai_templates():
    with open(TEMPLATE_LIBRARY_PATH, encoding='utf-8') as f:
        templates = json.load(f)
    return JSONResponse(templates)
from .contracts import DashboardContract, FeatureContract, Control

app = FastAPI()


# Example: role could be determined by session/user context
# Example: role could be determined by session/user context
def get_user_ai_role():
    # Placeholder: in real use, determine from user/session
    return "user_admin"  # or "system_admin", "remote_agent"

# --- AI Health Diagnostic Endpoint ---
@app.get("/ai-health")
def ai_health():
    # Dynamically import Rust agent FFI for AI health
    agent_path = os.path.join(os.path.dirname(__file__), '..', 'rust_agent', 'target', 'release')
    if agent_path not in sys.path:
        sys.path.append(agent_path)
    try:
        import rust_agent
        status_json = rust_agent.get_ai_health_status()
        return JSONResponse(content=status_json)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)



# Simulated user session (replace with real session management)
user_session = {
    "tier": "elite",  # Change to "elite" for testing advanced device control
    "ai_role": "system_admin"
}
available_roles = ["user_admin", "system_admin", "remote_agent"]

# Simulated custom panels storage (replace with DB in production)
custom_panels_db = []
def user_can_use_custom_panels():
    return user_session["tier"] in ["advanced", "pro"]
@app.get("/dashboard/custom-panels")
def get_custom_panels():
    if not user_can_use_custom_panels():
        return JSONResponse({"status": "error", "error": "Insufficient tier"}, status_code=403)
    return JSONResponse({"status": "ok", "panels": custom_panels_db})

@app.post("/dashboard/custom-panels/add")
async def add_custom_panel(request: Request):
    if not user_can_use_custom_panels():
        return JSONResponse({"status": "error", "error": "Insufficient tier"}, status_code=403)
    data = await request.json()
    panel = {
        "title": data.get("title", "Untitled"),
        "content": data.get("content", ""),
        "type": data.get("type", "text"),
        "config": data.get("config", {})
    }
    custom_panels_db.append(panel)
    return JSONResponse({"status": "ok", "panels": custom_panels_db})

@app.post("/dashboard/custom-panels/remove")
async def remove_custom_panel(request: Request):
    if not user_can_use_custom_panels():
        return JSONResponse({"status": "error", "error": "Insufficient tier"}, status_code=403)
    data = await request.json()
    idx = data.get("idx")
    try:
        idx = int(idx)
        custom_panels_db.pop(idx)
        return JSONResponse({"status": "ok", "panels": custom_panels_db})
    except Exception as e:
        return JSONResponse({"status": "error", "error": str(e)}, status_code=400)

@app.get("/dashboard-data")
def dashboard_data():
    user_tier = user_session["tier"]
    ai_role = user_session["ai_role"]
    features = []
    if user_tier.lower() == "elite":
        features.append("Advanced device control")
    contract = DashboardContract(user_tier=user_tier, features=features, ai_role=ai_role)
    result = contract.dict()
    result["available_roles"] = available_roles
    return JSONResponse(result)
