from python_wrapper.email_service import send_email
from python_wrapper.device_health import get_unacknowledged_alerts, acknowledge_alert
from python_wrapper.mapping_engine import get_mapping as engine_get_mapping, set_mapping as engine_set_mapping, validate_mapping as engine_validate_mapping
import base64
from starlette.middleware.base import BaseHTTPMiddleware
from cryptography.fernet import Fernet
from Crypto.Cipher import AES
# --- Notification Endpoints ---
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

# --- Email Sending Endpoint ---
@app.post("/send-email")
async def send_email_endpoint(request: Request):
	data = await request.json()
	to = data.get("to")
	subject = data.get("subject")
	body = data.get("body")
	try:
		send_email(to, subject, body)
		return {"status": "sent"}
	except Exception as e:
		return {"status": "error", "detail": str(e)}

# --- Device Health/Alert Endpoints ---
@app.get("/alerts")
def get_alerts():
	return get_unacknowledged_alerts()

@app.post("/alerts/ack")
def ack_alert(device_id: str):
	acknowledge_alert(device_id)
	return {"status": "ok"}

# --- Device Mapping Endpoints ---
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

# --- Wi-Fi Device Discovery Endpoints ---
from python_wrapper.device_discovery import discover_wifi_devices
@app.get("/discover-wifi")
def discover_wifi():
	return discover_wifi_devices()

@app.post("/connect-wifi-devices")
async def connect_wifi_devices(request: Request):
	device_ids = await request.json()
	return {"status": "connected", "devices": device_ids}

# --- Home Assistant/Appliance Integration Endpoint ---
@app.post("/integration")
async def set_integration(request: Request):
	data = await request.json()
	return {"status": "ok", "integration": data}

# --- Email Log Endpoint ---
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
from fastapi.staticfiles import StaticFiles
import pathlib

# Serve static frontend files (e.g., dashboard build)
frontend_path = pathlib.Path(__file__).parent.parent / "dashboard" / "static"
if frontend_path.exists():
	app.mount("/static", StaticFiles(directory=str(frontend_path)), name="static")

# Serve index.html for SPA frontend (React dashboard)
@app.get("/")
def serve_index():
	index_path = pathlib.Path(__file__).parent.parent / "dashboard" / "index.html"
	if index_path.exists():
		with open(index_path, "r", encoding="utf-8") as f:
			return f.read()
	return JSONResponse(status_code=404, content={"error": "index.html not found"})
"""
Module: Core (Module 1)
Purpose: Provides the core static and REST API endpoints required for the base operation of the Home Prototype system. This includes essential backend logic, static file serving, authentication, CORS, and network association required for the dashboard and backend to function independently of other modules.

- Contains: FastAPI app, CORS, login, feedback, privacy/data endpoints, import/export, device health, and any static/network association logic.
- Dependencies: FastAPI, core backend logic, static file serving, network association utilities.
- Integration: Standalone operation, full backend/frontend connectivity, can be run independently.

Instructions:
- Copy all core endpoints and logic from the main API (api.py) and related static/network files into this module.
- Ensure all imports are self-contained or relative to this module.
- Document any required configuration or environment variables.
"""

from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import json
import time

# --- FastAPI app ---
app = FastAPI(
	title="Home Prototype Module 1 API (Core)",
	description="Core API for smart home, security, automation, and support features.",
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

# --- Privacy Dashboard Data Endpoint ---
@app.get("/privacy/data-info")
def privacy_data_info():
	return {
		"collected": ["device mapping", "alerts", "logs", "user settings", "event history"],
		"storage": "Local server (encrypted)",
		"retention": "User-managed, auto-wipe after 1 year or on request"
	}

# --- Data Export/Import Endpoints ---
@app.get("/export/settings")
def export_settings():
	return {"status": "ok", "settings": {}}

@app.post("/import/settings")
async def import_settings(request: Request):
	data = await request.json()
	return {"status": "ok", "imported": data}

@app.get("/export/logs")
def export_logs():
	return {"status": "ok", "logs": []}

@app.post("/import/logs")
async def import_logs(request: Request):
	data = await request.json()
	return {"status": "ok", "imported": data}

@app.get("/export/automations")
def export_automations():
	return {"status": "ok", "automations": []}

@app.post("/import/automations")
async def import_automations(request: Request):
	data = await request.json()
	return {"status": "ok", "imported": data}

# --- User Feedback Loop Endpoint ---
@app.post("/feedback")
async def submit_feedback(request: Request):
	data = await request.json()
	return {"status": "ok", "received": data}

# --- Global Device Health Monitoring Endpoint ---
@app.get("/device-health/global")
def global_device_health():
	return {"devices": [], "alerts": []}

# --- Simple Login Endpoint for Dashboard Auth ---
@app.post("/login")
async def login(request: Request):
	try:
		data = await request.json()
		username = data.get("username")
		password = data.get("password")
		if username == "admin" and password == "admin":
			return {"username": username, "role": "admin", "token": "fake-jwt-token"}
		elif username == "user" and password == "user":
			return {"username": username, "role": "user", "token": "fake-jwt-token"}
		else:
			raise HTTPException(status_code=401, detail="Invalid username or password")
	except Exception as e:
		return JSONResponse(status_code=500, content={"error": str(e)})

# --- IP monitoring and enforcement for site-specific agent usage ---
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

# --- Endpoint: Get IP history for compliance review (admin only) ---
@app.get("/ip-history/{account_id}")
def get_ip_history(account_id: str, request: Request):
	role = request.headers.get("X-Role", "guest")
	if role != "admin":
		return JSONResponse(status_code=403, content={"error": "Admin only."})
	history = load_ip_history()
	return history.get(account_id, [])
