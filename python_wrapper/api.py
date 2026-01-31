
from fastapi import FastAPI, Request
import os
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title="Home Prototype Module 1 API",
    description="Comprehensive API for smart home, security, automation, and support features.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# --- CORS Middleware for local frontend development ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", "http://127.0.0.1:5173",
        "http://localhost:5174", "http://127.0.0.1:5174",
        "http://localhost:5175", "http://127.0.0.1:5175"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Privacy Dashboard Data Endpoint
@app.get("/privacy/data-info")
def privacy_data_info():
    # Example stub: expand with real data sources
    return {
        "collected": ["device mapping", "alerts", "logs", "user settings", "event history"],
        "storage": "Local server (encrypted)",
        "retention": "User-managed, auto-wipe after 1 year or on request"
    }
# Data Export/Import Endpoints
@app.get("/export/settings")
def export_settings():
    # Export settings (stub)
    return {"status": "ok", "settings": {}}

@app.post("/import/settings")
async def import_settings(request: Request):
    data = await request.json()
    # Import settings (stub)
    return {"status": "ok", "imported": data}

@app.get("/export/logs")
def export_logs():
    # Export logs (stub)
    return {"status": "ok", "logs": []}

@app.post("/import/logs")
async def import_logs(request: Request):
    data = await request.json()
    # Import logs (stub)
    return {"status": "ok", "imported": data}

@app.get("/export/automations")
def export_automations():
    # Export automations (stub)
    return {"status": "ok", "automations": []}

@app.post("/import/automations")
async def import_automations(request: Request):
    data = await request.json()
    # Import automations (stub)
    return {"status": "ok", "imported": data}

# User Feedback Loop Endpoint
@app.post("/feedback")
async def submit_feedback(request: Request):
    data = await request.json()
    # Store feedback/feature request/bug report (stub)
    return {"status": "ok", "received": data}

# Global Device Health Monitoring Endpoint
@app.get("/device-health/global")
def global_device_health():
    # Predictive failure alerts for all devices (stub)
    return {"devices": [], "alerts": []}
# IP Camera Integration Endpoints
@app.get("/cameras")
def list_cameras():
    # Return list of configured IP cameras (stub)
    return [{"id": "cam1", "name": "Front Door", "url": "rtsp://192.168.1.10/live"}]

@app.post("/cameras/motion-snapshot")
async def camera_motion_snapshot(request: Request):
    data = await request.json()
    # Trigger snapshot on motion (stub)
    # Example: return image bytes or URL
    return {"status": "ok", "image_url": "/static/cam1_snapshot.jpg"}

@app.post("/cameras/motion-clip")
async def camera_motion_clip(request: Request):
    data = await request.json()
    # Trigger short video clip on motion (stub)
    # Example: return video URL (not stored long-term)
    return {"status": "ok", "clip_url": "/static/cam1_clip.mp4"}

@app.get("/cameras/stream/{camera_id}")
def camera_stream(camera_id: str):
    # Return streaming URL for remote viewing (no persistent storage)
    # Example: return RTSP or HTTP stream URL
    return {"status": "ok", "stream_url": f"rtsp://192.168.1.10/live"}
# Emergency Response Audio Push Endpoint
@app.post("/emergency/audio-push")
async def emergency_audio_push(request: Request):
    data = await request.json()
    # Send audio message to household audio system (stub)
    # Example: data = {"message": "Evacuate immediately", "priority": "high"}
    # Integrate with audio_io.py for playback
    from python_wrapper.audio_io import AudioIO
    AudioIO().play_message(data.get("message", ""), priority=data.get("priority", "normal"))
    return {"status": "ok", "played": data.get("message", "")}

# Emergency Response Processing Endpoint
@app.post("/emergency/response")
async def emergency_response(request: Request):
    data = await request.json()
    # Process incoming emergency service instructions (stub)
    # Example: data = {"instructions": "Stay calm, help is on the way."}
    # Optionally push to audio system
    from python_wrapper.audio_io import AudioIO
    AudioIO().play_message(data.get("instructions", ""), priority="emergency")
    return {"status": "ok", "instructions": data.get("instructions", "")}
# Guest Access Endpoints
@app.post("/guests/add")
async def add_guest(request: Request):
    data = await request.json()
    # Add guest logic (stub)
    return {"status": "ok", "guest": data}

@app.post("/guests/remove")
async def remove_guest(request: Request):
    data = await request.json()
    # Remove guest logic (stub)
    return {"status": "ok", "guest": data}

@app.get("/guests/list")
def list_guests():
    # List guests logic (stub)
    return []

# Energy Monitoring Endpoints
@app.get("/energy/usage")
def get_energy_usage():
    # Return energy usage data (stub)
    return {"devices": [], "total_kwh": 0, "suggestions": []}

# Scheduled Automation Endpoints
@app.post("/automation/schedule")
async def schedule_automation(request: Request):
    data = await request.json()
    # Add flexible schedule logic (stub)
    return {"status": "ok", "schedule": data}

@app.get("/automation/schedules")
def list_schedules():
    # List schedules logic (stub)
    return []
# Voice Assistant Integration Endpoints
@app.post("/voice-assistant/alexa")
async def alexa_integration(request: Request):
    data = await request.json()
    # Process Alexa command (stub)
    return {"status": "ok", "received": data}

@app.post("/voice-assistant/google")
async def google_home_integration(request: Request):
    data = await request.json()
    # Process Google Home command (stub)
    return {"status": "ok", "received": data}

@app.post("/voice-assistant/siri")
async def siri_integration(request: Request):
    data = await request.json()
    # Process Siri command (stub)
    return {"status": "ok", "received": data}

# Advanced Notification Endpoints
@app.post("/notify/sms")
async def send_sms(request: Request):
    data = await request.json()
    # Integrate with Twilio or SMS provider (stub)
    return {"status": "ok", "sent": data}

@app.post("/notify/push")
async def send_push(request: Request):
    data = await request.json()
    # Integrate with Firebase or push provider (stub)
    return {"status": "ok", "sent": data}

# --- Simple Login Endpoint for Dashboard Auth ---
@app.post("/login")
async def login(request: Request):
    try:
        data = await request.json()
        print("/login received data:", data, flush=True)
        username = data.get("username")
        password = data.get("password")
        # Replace this with real user lookup/authentication
        # For now, accept a hardcoded user for demo
        if username == "admin" and password == "admin":
            return {"username": username, "role": "admin", "token": "fake-jwt-token"}
        elif username == "user" and password == "user":
            return {"username": username, "role": "user", "token": "fake-jwt-token"}
        else:
            from fastapi import HTTPException
            print("/login invalid credentials:", username, password, flush=True)
            raise HTTPException(status_code=401, detail="Invalid username or password")
    except Exception as e:
        import traceback
        print("/login exception:", str(e), flush=True)
        traceback.print_exc()
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=500, content={"error": str(e)})
# IP monitoring and enforcement for site-specific agent usage
from fastapi import Request

REGISTERED_IPS_PATH = os.path.join(os.path.dirname(__file__), "registered_ips.json")
IP_HISTORY_PATH = os.path.join(os.path.dirname(__file__), "ip_history.json")

def load_ip_history():
    if os.path.exists(IP_HISTORY_PATH):
        with open(IP_HISTORY_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def save_ip_history(history):
    with open(IP_HISTORY_PATH, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)

def load_registered_ips():
    if os.path.exists(REGISTERED_IPS_PATH):
        with open(REGISTERED_IPS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def save_registered_ips(ips):
    with open(REGISTERED_IPS_PATH, "w", encoding="utf-8") as f:
        json.dump(ips, f, indent=2)

@app.middleware("http")
async def ip_enforcement_middleware(request: Request, call_next):
    client_ip = request.client.host
    account_id = request.headers.get("X-Account-ID")
    if account_id:
        ips = load_registered_ips()
        history = load_ip_history()
        allowed_ip = ips.get(account_id)
        # Log IP history
        entry = {"ip": client_ip, "timestamp": int(time.time())}
        if account_id not in history:
            history[account_id] = []
        if not history[account_id] or history[account_id][-1]["ip"] != client_ip:
            history[account_id].append(entry)
            save_ip_history(history)
        if allowed_ip and allowed_ip != client_ip:
            return JSONResponse(status_code=403, content={"error": "IP address does not match registered site. Contact admin/tech support to update location."})
        if not allowed_ip:
            ips[account_id] = client_ip
            save_registered_ips(ips)
    response = await call_next(request)
    return response

# Endpoint: Get IP history for compliance review (admin only)
@app.get("/ip-history/{account_id}")
def get_ip_history(account_id: str, request: Request):
    role = request.headers.get("X-Role", "guest")
    if role != "admin":
        return JSONResponse(status_code=403, content={"error": "Admin only."})
    history = load_ip_history()
    return history.get(account_id, [])
# Event-driven bulb color assignment for hazard/event escalation
EVENT_COLOR_MAP = {
    "notification": (255, 255, 0),   # Yellow
    "fall": (255, 0, 0),             # Red
    "callout": (255, 0, 0),          # Red
    "all_clear": (0, 255, 0),        # Green
}

user_bulb_override = {}

@app.post("/bulbs/{name}/event-color")
def set_bulb_event_color(name: str, event: str, override: bool = False):
    if name not in bulbs:
        raise HTTPException(status_code=404, detail="Bulb not found")
    if override:
        user_bulb_override[name] = event
        # Use user override color
        color = EVENT_COLOR_MAP.get(event, (255, 255, 255))
        bulbs[name].set_color(*color)
        return get_bulb_state(bulbs[name])
    # Passive mode: only set color if no override
    if name in user_bulb_override:
        # User has overridden, do not change
        return get_bulb_state(bulbs[name])
    color = EVENT_COLOR_MAP.get(event, (255, 255, 255))
    bulbs[name].set_color(*color)
    return get_bulb_state(bulbs[name])
# Predictive AI: Automated smart bulb control for occupancy simulation
from python_wrapper.predictive_ai import get_occupancy_schedule, run_predictive_lighting

# Endpoint: Get predictive lighting schedule
@app.get("/predictive/lighting-schedule")
def predictive_lighting_schedule():
    return get_occupancy_schedule()

# Endpoint: Run predictive lighting automation (simulate occupancy)
@app.post("/predictive/run-lighting")
def run_predictive_lighting():
    result = run_predictive_lighting()
    return {"status": "ok", "result": result}
from python_wrapper.backup_api import router as backup_router
app.include_router(backup_router)
from python_wrapper.device_health_dashboard_api import router as device_health_dashboard_router
app.include_router(device_health_dashboard_router)


from python_wrapper.device_health import get_unacknowledged_alerts, acknowledge_alert


"""
FastAPI REST API for Smart Home Devices

# Learning References
# - Python for Dummies
#   - Chapter 12: Organizing Code with Modules and Packages (see module structure)
#   - Chapter 16: Web Programming Basics (see REST API concepts)
#   - Chapter 13: Using Python’s Built-In Functions (see type hints basics)
#   - Chapter 10: Creating and Using Classes (see BulbState)
#   - For FastAPI: https://fastapi.tiangolo.com/
#   - For Pydantic: https://docs.pydantic.dev/
#
# Purpose:
# - Exposes device controls (e.g., bulbs) as REST endpoints for the dashboard and other clients.
# - Integrates with Rust device logic via FFI (see lib.py and rust_smart_bulbs).
#
# Service Type:
# - REST API (FastAPI)
# - Consumed by: dashboard (React), other HTTP clients
#
# Linked Dependencies:
# - Depends on: lib.py (FFI), device_contracts.py (contracts), PySmartBulb (Rust)
# - Used by: dashboard/Dashboard.jsx, external clients
#
# Update Guidance:
# - When adding new device types or controls, update both API endpoints and FFI bindings.
# - Document all endpoints and expected request/response formats in api_design.md.
#
# Data Storage Disclaimer:
# - User data stored on the server is only accessible for backup and restore operations. No direct access or browsing of user files on the server is permitted. All other data is stored locally or in user-owned cloud storage. This policy is strictly enforced for privacy and security.
"""





from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
import time
from fastapi.responses import JSONResponse
import os
import json
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict
from python_wrapper.lib import PySmartBulb
from python_wrapper.mapping_api import get_mapping, set_mapping, check_mapping_limits
from python_wrapper.mapping_loader import validate_mapping_object


from python_wrapper.contacts_api import router as contacts_router
from python_wrapper.support_api import router as support_router
from python_wrapper.users_api import router as users_router
from python_wrapper.backup_api import router as backup_router
from python_wrapper.audio_mapping_api import router as audio_mapping_router
from python_wrapper.hdmi_hub_api import router as hdmi_hub_router
from python_wrapper.ai_voice_api import router as ai_voice_router
from python_wrapper.audio_config_api import router as audio_config_router

from python_wrapper.notify_api import router as notify_router
from python_wrapper.webhooks_api import router as webhooks_router

from python_wrapper.diagnostics_api import router as diagnostics_router

from python_wrapper.automation_api import router as automation_router

from python_wrapper.tts_api import router as tts_router
from python_wrapper.ota_api import router as ota_router
from python_wrapper.analytics_api import router as analytics_router





# --- FastAPI app and endpoints ---


from python_wrapper.mapping_engine import get_mapping as engine_get_mapping, set_mapping as engine_set_mapping, validate_mapping as engine_validate_mapping
from python_wrapper.device_discovery import discover_wifi_devices

# --- Wi-Fi Device Discovery Endpoint ---
@app.get("/discover-wifi")
def discover_wifi():
    return discover_wifi_devices()

# --- Wi-Fi Device Connection Endpoint ---
@app.post("/connect-wifi-devices")
async def connect_wifi_devices(request: Request):
    device_ids = await request.json()
    # Here, connect logic would be implemented (stub)
    # For demo, just return success
    return {"status": "connected", "devices": device_ids}

# --- Home Assistant/Appliance Integration Endpoint ---
@app.post("/integration")
async def set_integration(request: Request):
    data = await request.json()
    # Here, update integration settings (stub)
    # For demo, just return success
    return {"status": "ok", "integration": data}

# --- Modular Audio Device Management Endpoints ---
from python_wrapper.audio_mapping_api import router as audio_mapping_router
from python_wrapper.audio_config_api import router as audio_config_router

# List all available audio devices (with room mapping info)
@app.get("/audio/devices")
def api_list_audio_devices():
    from python_wrapper.audio_mapping_api import list_audio_devices
    return list_audio_devices()

# --- Voice Control Endpoints ---
@app.get("/voice/volume/local")
def get_local_volume():
    # Stub: Replace with actual local volume logic
    try:
        from python_wrapper.audio_io import AudioIO
        return {"volume": AudioIO().get_local_volume()}
    except Exception:
        return {"volume": 50}

@app.post("/voice/volume/local")
async def set_local_volume(request: Request):
    data = await request.json()
    vol = int(data.get("volume", 50))
    try:
        from python_wrapper.audio_io import AudioIO
        AudioIO().set_local_volume(vol)
        return {"status": "ok", "volume": vol}
    except Exception:
        return {"status": "error", "volume": vol}

@app.get("/voice/volume/device/{device_index}")
def get_device_volume(device_index: int):
    try:
        from python_wrapper.audio_io import AudioIO
        return {"volume": AudioIO(output_device=device_index).get_device_volume()}
    except Exception:
        return {"volume": 50}

@app.post("/voice/volume/device/{device_index}")
async def set_device_volume(device_index: int, request: Request):
    data = await request.json()
    vol = int(data.get("volume", 50))
    try:
        from python_wrapper.audio_io import AudioIO
        AudioIO(output_device=device_index).set_device_volume(vol)
        return {"status": "ok", "volume": vol}
    except Exception:
        return {"status": "error", "volume": vol}

# Map an audio device to a room
@app.post("/audio/map_room")
async def api_map_audio_device_to_room(request: Request):
    from python_wrapper.audio_mapping_api import map_audio_device_to_room, RoomMappingRequest
    data = await request.json()
    req = RoomMappingRequest(**data)
    return map_audio_device_to_room(req)

# Get current audio device to room mapping
@app.get("/audio/room_map")
def api_get_audio_room_map():
    from python_wrapper.audio_mapping_api import get_audio_room_map
    return get_audio_room_map()

# Get/set default audio input/output device config
@app.get("/audio/config")
def api_get_audio_config():
    from python_wrapper.audio_config_api import get_audio_config
    return get_audio_config()

@app.post("/audio/config")
async def api_set_audio_config(request: Request):
    from python_wrapper.audio_config_api import set_audio_config, AudioConfigModel
    data = await request.json()
    cfg = AudioConfigModel(**data)
    return set_audio_config(cfg)
@app.get("/hdmi-hubs")
def list_hdmi_hubs():
    # Filter device_mapping for hdmi_hub type
    try:
        with open(os.path.join(os.path.dirname(__file__), "device_mapping.json"), "r", encoding="utf-8") as f:
            mapping = json.load(f)
        hubs = [dev for dev in mapping if dev.get("type") == "hdmi_hub"]
        return hubs
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/audio-endpoints")
def list_audio_endpoints():
    # List mapped audio endpoints (room/device association)
    try:
        with open(os.path.join(os.path.dirname(__file__), "device_mapping.json"), "r", encoding="utf-8") as f:
            mapping = json.load(f)
        endpoints = [
            {
                "id": dev.get("id"),
                "location": dev.get("location"),
                "hardware": dev.get("hardware"),
                "features": dev.get("features"),
                "type": dev.get("type"),
                "function": dev.get("function"),
            }
            for dev in mapping if dev.get("type") in ("hdmi_hub", "audio_endpoint")
        ]
        return endpoints
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
from starlette.middleware.base import BaseHTTPMiddleware
from cryptography.fernet import Fernet
from Crypto.Cipher import AES
import base64

# --- Double Encryption Middleware ---
FERNET_KEY = Fernet.generate_key()
fernet = Fernet(FERNET_KEY)
AES_KEY = b'ThisIsASecretKey123'  # 16 bytes for AES-128
AES_IV = b'ThisIsAnIV456789'      # 16 bytes IV

def double_encrypt(data: bytes) -> bytes:
    encrypted1 = fernet.encrypt(data)
    cipher = AES.new(AES_KEY, AES.MODE_CFB, AES_IV)
    encrypted2 = cipher.encrypt(encrypted1)
    return base64.b64encode(encrypted2)

def double_decrypt(data: bytes) -> bytes:
    encrypted2 = base64.b64decode(data)
    cipher = AES.new(AES_KEY, AES.MODE_CFB, AES_IV)
    decrypted1 = cipher.decrypt(encrypted2)
    decrypted2 = fernet.decrypt(decrypted1)
    return decrypted2

class DoubleEncryptionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        if request.method in ("POST", "PUT", "PATCH"):
            body = await request.body()
            if body:
                try:
                    decrypted = double_decrypt(body)
                    request._body = decrypted
                except Exception:
                    pass
        response = await call_next(request)
        if hasattr(response, "body") and response.body:
            try:
                encrypted = double_encrypt(response.body)
                response.body = encrypted
                response.headers["Content-Type"] = "application/octet-stream"
            except Exception:
                pass
        return response

# --- Global API Rate Limiting Middleware ---
RATE_LIMITS = {}
RATE_LIMIT_WINDOW = 60  # seconds
RATE_LIMIT_MAX = 60    # max requests per window per IP
class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        ip = request.client.host if request.client else "unknown"
        now = int(time.time())
        window = now // RATE_LIMIT_WINDOW
        key = f"{ip}:{window}"
        count = RATE_LIMITS.get(key, 0)
        if count >= RATE_LIMIT_MAX:
            return JSONResponse(status_code=429, content={"error": "Global rate limit exceeded"})
        RATE_LIMITS[key] = count + 1
        response = await call_next(request)
        return response

app.add_middleware(DoubleEncryptionMiddleware)
app.add_middleware(RateLimitMiddleware)
@app.get("/email-log")
def get_email_log():
    log_path = os.path.join(os.path.dirname(__file__), "email_log.json")
    if not os.path.exists(log_path):
        return []
    try:
        with open(log_path, "r", encoding="utf-8") as f:
            log = json.load(f)
        return log
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"Failed to read email log: {str(e)}"})
app.include_router(contacts_router)
app.include_router(support_router)
app.include_router(users_router)
app.include_router(backup_router)
app.include_router(notify_router)
app.include_router(webhooks_router)
app.include_router(diagnostics_router)
app.include_router(automation_router)
app.include_router(tts_router)
app.include_router(ota_router)
app.include_router(analytics_router)
app.include_router(audio_mapping_router)
app.include_router(hdmi_hub_router)
app.include_router(ai_voice_router)
app.include_router(audio_config_router)

# Device health/alert endpoints
@app.get("/alerts")
def get_alerts():
    return get_unacknowledged_alerts()

@app.post("/alerts/ack")
def ack_alert(device_id: str):
    acknowledge_alert(device_id)
    return {"status": "ok"}

@app.get("/mapping")
def get_device_mapping():
    return engine_get_mapping()


@app.post("/mapping")
async def upload_device_mapping(request: Request):
    try:
        mapping = await request.json()
        err = engine_validate_mapping(mapping)
        if err:
            return JSONResponse(status_code=400, content={"error": err})
        engine_set_mapping(mapping)
        return {"status": "ok"}
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})

# Store PySmartBulb objects by name
bulbs: Dict[str, PySmartBulb] = {
    "Living Room 1": PySmartBulb("Living Room 1"),
    "Living Room 2": PySmartBulb("Living Room 2"),
    "Master Bedroom": PySmartBulb("Master Bedroom"),
}

class BulbState(BaseModel):
    is_on: bool
    brightness: int
    color: tuple

def get_bulb_state(bulb: "PySmartBulb") -> "BulbState":
    # This assumes PySmartBulb exposes .is_on, .brightness, .color
    # If not, you may need to add @property methods in Rust
    return BulbState(
        is_on=bulb.inner.is_on,
        brightness=bulb.inner.brightness,
        color=tuple(bulb.inner.color),
    )

@app.get("/bulbs")
def list_bulbs():
    return {name: get_bulb_state(bulb) for name, bulb in bulbs.items()}

@app.post("/bulbs/{name}/on")
def turn_on(name: str):
    if name not in bulbs:
        raise HTTPException(status_code=404, detail="Bulb not found")
    bulbs[name].turn_on()
    return get_bulb_state(bulbs[name])

@app.post("/bulbs/{name}/off")
def turn_off(name: str):
    if name not in bulbs:
        raise HTTPException(status_code=404, detail="Bulb not found")
    bulbs[name].turn_off()
    return get_bulb_state(bulbs[name])

@app.post("/bulbs/{name}/brightness")
def set_brightness(name: str, brightness: int):
    if name not in bulbs:
        raise HTTPException(status_code=404, detail="Bulb not found")
    bulbs[name].set_brightness(max(0, min(100, brightness)))
    return get_bulb_state(bulbs[name])

@app.post("/bulbs/{name}/color")
def set_color(name: str, r: int, g: int, b: int):
    if name not in bulbs:
        raise HTTPException(status_code=404, detail="Bulb not found")
    bulbs[name].set_color(max(0,min(255,r)), max(0,min(255,g)), max(0,min(255,b)))
    return get_bulb_state(bulbs[name])
