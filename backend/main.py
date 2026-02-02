import re
TEMPLATE_LIBRARY_PATH = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'ai', 'template_library.json')

def load_routines():
    with open(TEMPLATE_LIBRARY_PATH, encoding='utf-8') as f:
        return json.load(f)

@app.post("/api/ai/voice-command")
async def ai_voice_command(request: Request):
    data = await request.json()
    command = data.get("command", "").lower()
    routine_name = data.get("routine")
    result = {"status": "ok", "message": None}
    # Fast path: if routine name is provided, execute it
    if routine_name:
        routines = load_routines()
        routine = next((r for r in routines if r["name"].lower() == routine_name.lower()), None)
        if routine:
            result["message"] = f"Routine '{routine['name']}' executed: {routine['description']}"
            return JSONResponse(result)
    # Otherwise, keyword/intent matching
    if "contrast" in command:
        result["message"] = "High contrast mode toggled."
    elif "focus" in command:
        result["message"] = "Focus outlines toggled."
    elif re.search(r"live region|screen reader", command):
        result["message"] = "ARIA live region toggled."
    elif "skip" in command:
        result["message"] = "Skip to content link toggled."
    elif "visual alert" in command:
        result["message"] = "Visual alerts toggled."
    else:
        # Try to match a routine by keywords
        routines = load_routines()
        for r in routines:
            if r["name"].lower() in command:
                result["message"] = f"Routine '{r['name']}' executed: {r['description']}"
                break
        if not result["message"]:
            result["message"] = f"AI routine executed for: {command}"
    return JSONResponse(result)

user_accessibility_prefs = {
    # Example: user_id: {contrast: True, focus: True, live: True, skip: True, visual: False}
    'default': {
        'contrast': True,
        'focus': True,
        'live': True,
        'skip': True,
        'visual': False
    }
}

def get_current_user_id(request: Request):
    # Placeholder: Replace with real user/session logic
    return 'default'

@app.get("/api/user/accessibility")
async def get_accessibility(request: Request):
    user_id = get_current_user_id(request)
    prefs = user_accessibility_prefs.get(user_id, user_accessibility_prefs['default'])
    return JSONResponse(prefs)

@app.post("/api/user/accessibility")
async def set_accessibility(request: Request):
    user_id = get_current_user_id(request)
    data = await request.json()
    user_accessibility_prefs[user_id] = data
    return JSONResponse({"status": "ok", "prefs": data})
import base64
from cryptography.fernet import Fernet
import logging

# --- Encryption Utilities ---
class KeyManager:
    # In production, use a secure key vault/service
    _master_key = Fernet.generate_key()
    @staticmethod
    def get_key():
        return KeyManager._master_key

def encrypt_field(value: str) -> str:
    if not value:
        return value
    f = Fernet(KeyManager.get_key())
    return f.encrypt(value.encode()).decode()

def decrypt_field(value: str) -> str:
    if not value:
        return value
    f = Fernet(KeyManager.get_key())
    return f.decrypt(value.encode()).decode()

# --- Audit Logging ---
audit_logger = logging.getLogger('audit')
audit_logger.setLevel(logging.INFO)
fh = logging.FileHandler('audit.log')
fh.setFormatter(logging.Formatter('%(asctime)s %(levelname)s %(message)s'))
audit_logger.addHandler(fh)

def log_audit(user_id, action, field=None):
    audit_logger.info(f"user={user_id} action={action} field={field}")
from fastapi import FastAPI, Response, Request, Depends, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from typing import List
import importlib.util
import sys
import os
import json
import gzip
import base64
import shutil
import time
from .contracts import MappingInfo

app = FastAPI()

@app.get("/stream/video")
async def stream_video():
    # Placeholder: Replace with actual agent video stream (e.g., WebRTC/WebSocket proxy)
    def fake_video_stream():
        while True:
            yield b''  # Replace with video frame bytes
    return StreamingResponse(fake_video_stream(), media_type="video/mp4")

@app.get("/stream/audio")
async def stream_audio():
    # Placeholder: Replace with actual agent audio stream
    def fake_audio_stream():
        while True:
            yield b''  # Replace with audio frame bytes
    return StreamingResponse(fake_audio_stream(), media_type="audio/wav")

BACKUP_DIR = "backups/"
SERVER_MAX_BACKUPS = 2

def list_server_backups():
    backups = sorted([f for f in os.listdir(BACKUP_DIR) if f.endswith('.bak')])
    return backups

def save_server_backup(data, agent_id):
    ts = int(time.time())
    fname = f"{agent_id}_{ts}.bak"
    path = os.path.join(BACKUP_DIR, fname)
    with open(path, "wb") as f:
        f.write(data)
    # Enforce max backups
    backups = list_server_backups()
    if len(backups) > SERVER_MAX_BACKUPS:
        # Remove oldest
        os.remove(os.path.join(BACKUP_DIR, backups[0]))
    return fname

def get_server_backup(fname):
    path = os.path.join(BACKUP_DIR, fname)
    with open(path, "rb") as f:
        return f.read()

@app.post("/backup/upload")
async def upload_backup(request: Request):
    data = await request.body()
    agent_id = request.headers.get("x-agent-id", "unknown")
    fname = save_server_backup(data, agent_id)
    return {"status": "ok", "backup": fname}

@app.get("/backup/list")
async def list_backups():
    return {"backups": list_server_backups()}

@app.get("/backup/download/{fname}")
async def download_backup(fname: str):
    data = get_server_backup(fname)
    return Response(content=data, media_type="application/octet-stream")

# Weekly server query for agent backups (to be triggered by scheduler)
def weekly_backup_query():
    # This would be called by a cron job or scheduler
    # For each agent, request backup/restore points
    pass

from fastapi import FastAPI, Response, Request, Depends, HTTPException
from fastapi.responses import JSONResponse
from typing import List
import importlib.util
import sys
import os
import json
from .contracts import MappingInfo

app = FastAPI()

mapping_storage = {
    "rooms": [],
    "devices": [],
    "walls": [],
    "annotations": [],
    "floor": 1
}

# Endpoint: Save mapping and annotation data
@app.post("/mapping/save")
async def save_mapping(request: Request):
    data = await request.json()
    mapping_storage["rooms"] = data.get("rooms", [])
    mapping_storage["devices"] = data.get("devices", [])
    mapping_storage["walls"] = data.get("walls", [])
    mapping_storage["annotations"] = data.get("annotations", [])
    mapping_storage["floor"] = data.get("floor", 1)
    return {"status": "ok"}

# Endpoint: Load mapping and annotation data
@app.get("/mapping/load")
async def load_mapping():
    # Serialize and compress mapping data
    raw = json.dumps(mapping_storage)
    compressed = gzip.compress(raw.encode("utf-8"))
    encoded = base64.b64encode(compressed).decode("utf-8")
    return {"mapping": encoded, "compression": "gzip+base64"}

from fastapi import FastAPI, Response, Request, Depends, HTTPException
from fastapi.responses import JSONResponse
from typing import List
import importlib.util
import sys
import os
import json
from .contracts import MappingInfo

app = FastAPI()

# Import routers from modules
from .usb_api import router as usb_router
from .ticket_api import router as ticket_router
from .logs_api import router as logs_router
from .external_api import router as external_router

app.include_router(usb_router)
app.include_router(ticket_router)
app.include_router(logs_router)
app.include_router(external_router)

# --- API Endpoints for External Tools ---
EXTERNAL_API_KEY = "changeme"  # Replace with secure key management

def check_api_key(request: Request):
    key = request.headers.get("x-api-key", "")
    return key == EXTERNAL_API_KEY

@app.post("/api/external/device-control")
async def external_device_control(request: Request):
    if not check_api_key(request):
        return JSONResponse(status_code=403, content={"error": "Invalid API key."})
    data = await request.json()
    device_id = data.get("device_id", "")
    action = data.get("action", "")
    # Simulate device control logic
    return {"status": "ok", "device_id": device_id, "action": action}

@app.get("/api/external/data")
async def external_data_access(request: Request):
    if not check_api_key(request):
        return JSONResponse(status_code=403, content={"error": "Invalid API key."})
    # Simulate returning system data
    return {"data": {"rooms": [], "devices": [], "status": "ok"}}

@app.get("/api/external/status")
async def external_status(request: Request):
    if not check_api_key(request):
        return JSONResponse(status_code=403, content={"error": "Invalid API key."})
    # Simulate system status
    return {"status": "online", "uptime": "24h", "devices_connected": 2}

# --- Plug-and-Play USB Module System ---
usb_modules = {}

def discover_usb_devices():
    # Placeholder: Simulate USB device discovery
    return [
        {"id": "usb1", "name": "TP-Link Smart Plug", "vendor": "TP-Link", "status": "connected"},
        {"id": "usb2", "name": "Zigbee Dongle", "vendor": "Zigbee", "status": "connected"}
    ]

def register_usb_module(module_id, info):
    usb_modules[module_id] = info

@app.get("/usb/discover")
async def usb_discover():
    devices = discover_usb_devices()
    return {"devices": devices}

@app.post("/usb/register")
async def usb_register(request: Request):
    data = await request.json()
    module_id = data.get("module_id", "")
    info = data.get("info", {})
    register_usb_module(module_id, info)
    return {"status": "ok", "module_id": module_id}

@app.get("/usb/modules")
async def usb_modules_list():
    return {"modules": usb_modules}

# --- Log Handling & Access ---
import glob
import os

def get_agent_local_logs():
    # Placeholder: simulate reading local agent logs
    # In real deployment, this would query the agent via remote support WebSocket or secure API
    return ["Agent log entry 1", "Agent log entry 2"]

def get_server_logs():
    # Example: read server logs from a logs/ directory
    import gzip
    log_files = glob.glob("logs/*.log.gz")
    logs = {}
    for lf in log_files:
        with gzip.open(lf, "rt", encoding="utf-8") as f:
            content = f.read()
            logs[os.path.basename(lf)] = content
            # Check for critical errors and auto-create tickets
            for line in content.splitlines():
                if "CRITICAL" in line or "ERROR" in line:
                    # Avoid duplicate tickets for same error
                    if not any(line in t.description for t in tickets.values()):
                        ticket_id = str(uuid.uuid4())
                        ticket = Ticket(
                            id=ticket_id,
                            user_id="system_log",
                            subject=f"Log Alert: {os.path.basename(lf)}",
                            description=line,
                            priority="urgent" if "CRITICAL" in line else "normal",
                            created_at="",
                            updated_at="",
                            messages=[]
                        )
                        tickets[ticket_id] = ticket
    return logs

@app.get("/logs/agent")
async def query_agent_logs():
    # Only allow if remote support is enabled
    if not remote_support_permission["enabled"]:
        return JSONResponse(status_code=403, content={"error": "Remote support not enabled."})
    logs = get_agent_local_logs()
    return {"logs": logs}

@app.get("/logs/server")
async def query_server_logs():
    logs = get_server_logs()
    return {"logs": logs}

@app.post("/agent/poll-server-logs")
async def agent_poll_server_logs():
    # When agent polls for updates/status, transfer server logs
    logs = get_server_logs()
    return {"logs": logs}

# --- Support Ticket Model & Endpoints ---

# --- AI Model Support Ticket Suggestion Endpoint ---
import smtplib
from email.message import EmailMessage

ai_ticket_suggestions = []

def send_support_email(subject, body):
    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = 'noreply@mappedhome.com'
    msg['To'] = 'support@mappedhome.com'
    msg.set_content(body)
    try:
        # This is a placeholder. Configure SMTP for real email sending.
        # smtp = smtplib.SMTP('localhost')
        # smtp.send_message(msg)
        print('Email sent:', subject, body)
    except Exception as e:
        print('Email error:', e)

@app.post("/ai/ticket-suggestion")
async def ai_ticket_suggestion(request: Request):
    data = await request.json()
    suggestion = {
        "subject": data.get("subject", "AI Suggestion"),
        "description": data.get("description", ""),
        "timestamp": data.get("timestamp", ""),
        "flagged": True
    }
    ai_ticket_suggestions.append(suggestion)
    send_support_email(suggestion["subject"], suggestion["description"])
    # Optionally, create a ticket in the system
    ticket_id = str(uuid.uuid4())
    ticket = Ticket(
        id=ticket_id,
        user_id="ai_model",
        subject=suggestion["subject"],
        description=suggestion["description"],
        priority="normal",
        created_at=suggestion["timestamp"],
        updated_at=suggestion["timestamp"],
        messages=[]
    )
    tickets[ticket_id] = ticket
    return {"status": "ok", "ticket": ticket.dict(), "flagged": True}
from pydantic import BaseModel
import uuid

class Ticket(BaseModel):
    id: str
    user_id: str
    subject: str
    description: str
    status: str = "open"  # open, assigned, closed
    priority: str = "normal"  # normal, urgent
    assigned_to: str = ""
    created_at: str = ""
    updated_at: str = ""
    messages: list = []

tickets = {}


# --- Secure Ticket Creation with Field-Level Encryption and Audit Logging ---
@app.post("/tickets/create")
async def create_ticket(request: Request):
    data = await request.json()
    ticket_id = str(uuid.uuid4())
    enc_user_id = encrypt_field(data.get("user_id", ""))
    enc_subject = encrypt_field(data.get("subject", ""))
    enc_description = encrypt_field(data.get("description", ""))
    ticket = Ticket(
        id=ticket_id,
        user_id=enc_user_id,
        subject=enc_subject,
        description=enc_description,
        priority=data.get("priority", "normal"),
        created_at=data.get("created_at", ""),
        updated_at=data.get("created_at", ""),
        messages=[]
    )
    tickets[ticket_id] = ticket
    log_audit(data.get("user_id", ""), "create_ticket", field="user_id,subject,description")
    return {"status": "ok", "ticket": ticket.dict()}


# --- Secure Ticket Listing with Decryption and Audit Logging ---
@app.get("/tickets/list")
async def list_tickets():
    result = []
    for t in tickets.values():
        ticket_dict = t.dict()
        ticket_dict["user_id"] = decrypt_field(ticket_dict["user_id"])
        ticket_dict["subject"] = decrypt_field(ticket_dict["subject"])
        ticket_dict["description"] = decrypt_field(ticket_dict["description"])
        result.append(ticket_dict)
        log_audit(ticket_dict["user_id"], "list_ticket", field="user_id,subject,description")
    return {"tickets": result}


# --- Secure Ticket Retrieval with Decryption and Audit Logging ---
@app.get("/tickets/{ticket_id}")
async def get_ticket(ticket_id: str):
    ticket = tickets.get(ticket_id)
    if not ticket:
        return JSONResponse(status_code=404, content={"error": "Ticket not found."})
    ticket_dict = ticket.dict()
    ticket_dict["user_id"] = decrypt_field(ticket_dict["user_id"])
    ticket_dict["subject"] = decrypt_field(ticket_dict["subject"])
    ticket_dict["description"] = decrypt_field(ticket_dict["description"])
    log_audit(ticket_dict["user_id"], "get_ticket", field="user_id,subject,description")
    return {"ticket": ticket_dict}


# --- Secure Ticket Update with Field-Level Encryption and Audit Logging ---
@app.post("/tickets/update/{ticket_id}")
async def update_ticket(ticket_id: str, request: Request):
    data = await request.json()
    ticket = tickets.get(ticket_id)
    if not ticket:
        return JSONResponse(status_code=404, content={"error": "Ticket not found."})
    for field in ["status", "priority", "assigned_to", "description", "updated_at"]:
        if field in data:
            if field == "description":
                setattr(ticket, field, encrypt_field(data[field]))
            else:
                setattr(ticket, field, data[field])
    log_audit(decrypt_field(ticket.user_id), "update_ticket", field="description")
    ticket_dict = ticket.dict()
    ticket_dict["user_id"] = decrypt_field(ticket_dict["user_id"])
    ticket_dict["subject"] = decrypt_field(ticket_dict["subject"])
    ticket_dict["description"] = decrypt_field(ticket_dict["description"])
    return {"status": "ok", "ticket": ticket_dict}

@app.post("/tickets/message/{ticket_id}")
async def add_ticket_message(ticket_id: str, request: Request):
    data = await request.json()
    ticket = tickets.get(ticket_id)
    if not ticket:
        return JSONResponse(status_code=404, content={"error": "Ticket not found."})
    msg = {
        "author": data.get("author", ""),
        "message": data.get("message", ""),
        "timestamp": data.get("timestamp", "")
    }
    ticket.messages.append(msg)
    ticket.updated_at = data.get("timestamp", ticket.updated_at)
    return {"status": "ok", "ticket": ticket.dict()}

from fastapi import WebSocket, WebSocketDisconnect
import asyncio

# --- WebSocket Remote Support ---
active_support_connections = set()

@app.websocket("/ws/remote-support")
async def websocket_remote_support(websocket: WebSocket):
    await websocket.accept()
    # Basic authentication: only allow if remote support is enabled
    if not remote_support_permission["enabled"]:
        await websocket.close(code=4001)
        return
    active_support_connections.add(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Broadcast received data to all support connections (mirroring dashboard state/actions)
            for conn in active_support_connections:
                if conn != websocket:
                    await conn.send_text(data)
            # Optionally, process support actions here (e.g., log, apply changes)
    except WebSocketDisconnect:
        active_support_connections.remove(websocket)

# --- Auto-Disconnect Endpoint ---
from fastapi import status
import datetime

disconnect_log = []  # For audit

@app.post("/admin/auto-disconnect")
async def auto_disconnect(request: Request):
    data = await request.json()
    reason = data.get("reason", "Policy violation or threat detected")
    initiator = data.get("initiator", "system")
    timestamp = datetime.datetime.utcnow().isoformat()
    # Disconnect all non-admin agents
    disconnected = []
    for conn in list(active_support_connections):
        # Simulate: Only disconnect if not admin
        user_role = getattr(conn, "user_role", "user_admin")
        if user_role != "system_admin":
            await conn.close(code=status.WS_1008_POLICY_VIOLATION)
            active_support_connections.remove(conn)
            disconnected.append(str(conn))
    disconnect_log.append({"timestamp": timestamp, "initiator": initiator, "reason": reason, "disconnected": disconnected})
    return {"status": "ok", "disconnected": disconnected, "reason": reason}

# --- Admin Override Endpoint ---
@app.post("/admin/terminal-override")
async def admin_terminal_override(request: Request):
    data = await request.json()
    admin_id = data.get("admin_id", "")
    # Validate admin
    if not is_system_admin(admin_id):
        return JSONResponse(status_code=403, content={"error": "Only System Admin can override."})
    # Reconnect admin terminal forcibly, cannot be refused/disconnected
    # Simulate: Add admin connection back if missing
    admin_conn = None
    for conn in list(active_support_connections):
        user_role = getattr(conn, "user_role", "user_admin")
        if user_role == "system_admin":
            admin_conn = conn
            break
    if not admin_conn:
        # Simulate: Create a new admin connection object
        class DummyAdminConn:
            user_role = "system_admin"
        admin_conn = DummyAdminConn()
        active_support_connections.add(admin_conn)
    # Log override
    timestamp = datetime.datetime.utcnow().isoformat()
    disconnect_log.append({"timestamp": timestamp, "initiator": admin_id, "action": "terminal_override"})
    return {"status": "ok", "admin_id": admin_id, "message": "Admin terminal override successful."}

# --- Remote Support Permission Endpoint ---
remote_support_permission = {"enabled": False}

@app.post("/agent/remote-support")
async def set_remote_support_permission(request: Request):
    data = await request.json()
    enabled = bool(data.get("enabled", False))
    remote_support_permission["enabled"] = enabled
    # If enabled, trigger dashboard broadcast on localhost (placeholder)
    # You may want to start a websocket/HTTP server for dashboard mirroring here
    # If disabled, stop broadcast
    return {"status": "ok", "enabled": enabled}

# --- Role Management Endpoints ---
from .contracts import ROLE_POLICIES, USER_ROLES, add_role, delegate_role

role_groups = {}  # group_name -> [role_names]

def is_system_admin(user_id):
    return USER_ROLES.get(user_id, "") == "system_admin"

@app.post("/roles/create")
async def create_role(request: Request):
    data = await request.json()
    user_id = data.get("user_id", "")
    if not is_system_admin(user_id):
        return JSONResponse(status_code=403, content={"error": "Only System Admin can create roles."})
    role_name = data.get("role_name", "")
    actions = data.get("actions", [])
    if not role_name or not actions:
        return JSONResponse(status_code=400, content={"error": "Role name and actions required."})
    add_role(role_name, actions)
    return {"status": "ok", "role": role_name}

@app.post("/roles/assign")
async def assign_role(request: Request):
    data = await request.json()
    user_id = data.get("user_id", "")
    role_name = data.get("role_name", "")
    assigner_id = data.get("assigner_id", "")
    if not is_system_admin(assigner_id):
        return JSONResponse(status_code=403, content={"error": "Only System Admin can assign roles."})
    if not user_id or not role_name:
        return JSONResponse(status_code=400, content={"error": "User ID and role name required."})
    success = delegate_role(user_id, role_name)
    if not success:
        return JSONResponse(status_code=400, content={"error": "Role does not exist."})
    return {"status": "ok", "user": user_id, "role": role_name}

@app.post("/roles/group")
async def create_role_group(request: Request):
    data = await request.json()
    user_id = data.get("user_id", "")
    if not is_system_admin(user_id):
        return JSONResponse(status_code=403, content={"error": "Only System Admin can create groups."})
    group_name = data.get("group_name", "")
    role_name = data.get("role_name", "")
    if not group_name or not role_name:
        return JSONResponse(status_code=400, content={"error": "Group name and role name required."})
    role_groups.setdefault(group_name, []).append(role_name)
    return {"status": "ok", "group": group_name, "role": role_name}

# Endpoint: Admin can create a new monitored site
@app.post("/admin/create-site")
async def admin_create_site(request: Request):
    # TODO: Add real admin authentication
    data = await request.json()
    site_mapping_info.square_footage = data.get("square_footage", 0)
    site_mapping_info.commercial_square_footage = data.get("commercial_square_footage", 0)
    site_mapping_info.site_address = data.get("site_address", "")
    site_mapping_info.site_city = data.get("site_city", "")
    site_mapping_info.site_state = data.get("site_state", "")
    site_mapping_info.site_zip = data.get("site_zip", "")
    site_mapping_info.allowed_ips = data.get("allowed_ips", [])
    site_mapping_info.account_frozen = False
    return {"status": "ok", "message": "Site created/updated."}

# Endpoint: Admin can edit monitored site info
@app.post("/admin/edit-site")
async def admin_edit_site(request: Request):
    # TODO: Add real admin authentication
    data = await request.json()
    for field in ["square_footage", "commercial_square_footage", "site_address", "site_city", "site_state", "site_zip", "allowed_ips"]:
        if field in data:
            setattr(site_mapping_info, field, data[field])
    return {"status": "ok", "message": "Site info updated."}

# Simulated mapping info storage (replace with DB in production)
site_mapping_info = MappingInfo(
    square_footage=1200,
    commercial_square_footage=0,
    site_address="123 Main St",
    site_city="Springfield",
    site_state="IL",
    site_zip="62704",
    allowed_ips=["192.168.1.100", "203.0.113.0/24"],
    account_frozen=False
)

# Helper: Get client IP from request
def get_client_ip(request: Request) -> str:
    x_forwarded_for = request.headers.get('x-forwarded-for')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.client.host
    return ip

# Helper: Check if IP is allowed (site or remote)
def is_ip_allowed(ip: str, allowed_ips: List[str]) -> bool:
    import ipaddress
    for allowed in allowed_ips:
        try:
            if '/' in allowed:
                if ipaddress.ip_address(ip) in ipaddress.ip_network(allowed, strict=False):
                    return True
            else:
                if ip == allowed:
                    return True
        except Exception:
            continue
    return False

# Dependency: Enforce IP and freeze logic
async def enforce_ip_and_freeze(request: Request):
    ip = get_client_ip(request)
    if site_mapping_info.account_frozen:
        raise HTTPException(status_code=403, detail="Account is frozen. Contact admin.")
    if not is_ip_allowed(ip, site_mapping_info.allowed_ips):
        site_mapping_info.account_frozen = True
        raise HTTPException(status_code=403, detail="Account frozen due to unauthorized location. Contact admin.")
    return True

# Endpoint: Get mapping info (site location, allowed IPs, frozen state)
@app.get("/mapping-info")
async def get_mapping_info(request: Request, ok: bool = Depends(enforce_ip_and_freeze)):
    return JSONResponse(site_mapping_info.dict())

# Endpoint: Admin can release frozen account
@app.post("/admin/release-account")
async def admin_release_account(request: Request):
    # TODO: Add real admin authentication
    site_mapping_info.account_frozen = False
    return {"status": "ok", "message": "Account released by admin."}

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
import random
import string

# --- Two-Factor Temp Password Workflow ---
temp_password_requests = {}

def generate_six_digit_code():
    return ''.join(random.choices(string.digits, k=6))

def generate_temp_password(length=16):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

# Endpoint: Automated temp password issuance if support unavailable
@app.post("/auth/auto-issue-temp-password")
async def auto_issue_temp_password(request: Request):
    data = await request.json()
    user_id = data.get("user_id")
    email = data.get("email")
    # TODO: Check if support is unavailable (e.g., service load, holiday)
    # For now, always allow for demonstration
    if not user_id or not email:
        return JSONResponse(status_code=400, content={"error": "Missing user_id or email."})
    temp_pw = generate_temp_password(16)
    # TODO: Store temp password in user account (force reset on login)
    # TODO: Integrate with real email provider
    print(f"[DEBUG] Auto-issued temp password for {user_id}: {temp_pw} (sent to {email})")
    # Simulate sending email
    send_support_email("Your Temporary Password", f"Your temporary password is: {temp_pw}\nPlease reset it after login.")
    return {"status": "ok", "message": "Temporary password sent to your registered email.", "temp_password": temp_pw}

# Endpoint: Request temp password (initiates 2FA)
@app.post("/auth/request-temp-password")
async def request_temp_password(request: Request):
    data = await request.json()
    user_id = data.get("user_id")
    email = data.get("email")
    phone = data.get("phone")
    # TODO: Verify user/account exists and is eligible
    if not user_id or not email or not phone:
        return JSONResponse(status_code=400, content={"error": "Missing user_id, email, or phone."})
    sms_code = generate_six_digit_code()
    temp_password_requests[user_id] = {
        "email": email,
        "phone": phone,
        "sms_code": sms_code,
        "sms_verified": False,
        "email_verified": False,
        "temp_password": None
    }
    # TODO: Send SMS code to phone (integrate with SMS provider)
    print(f"[DEBUG] SMS code for {user_id}: {sms_code}")
    # TODO: Send email with verification link (integrate with email provider)
    print(f"[DEBUG] Email verification link for {user_id}: /auth/verify-email/{user_id}")
    return {"status": "pending", "message": "Verification codes sent."}

# Endpoint: Verify SMS code
@app.post("/auth/verify-sms")
async def verify_sms(request: Request):
    data = await request.json()
    user_id = data.get("user_id")
    code = data.get("code")
    req = temp_password_requests.get(user_id)
    if not req or req["sms_code"] != code:
        return JSONResponse(status_code=400, content={"error": "Invalid code or request."})
    req["sms_verified"] = True
    return {"status": "ok", "message": "SMS verified."}

# Endpoint: Verify email (simulated by GET for link click)
@app.get("/auth/verify-email/{user_id}")
async def verify_email(user_id: str):
    req = temp_password_requests.get(user_id)
    if not req:
        return JSONResponse(status_code=400, content={"error": "Invalid request."})
    req["email_verified"] = True
    return {"status": "ok", "message": "Email verified. You may now complete temp password request."}

# Endpoint: Issue temp password if both verifications complete
@app.post("/auth/issue-temp-password")
async def issue_temp_password(request: Request):
    data = await request.json()
    user_id = data.get("user_id")
    req = temp_password_requests.get(user_id)
    if not req or not req["sms_verified"] or not req["email_verified"]:
        return JSONResponse(status_code=400, content={"error": "Both verifications required."})
    temp_pw = generate_temp_password()
    req["temp_password"] = temp_pw
    # TODO: Store temp password in user account (force reset on login)
    print(f"[DEBUG] Issued temp password for {user_id}: {temp_pw}")
    return {"status": "ok", "temp_password": temp_pw}

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
    import gzip
    with gzip.open(TEMPLATE_LIBRARY_PATH + '.gz', encoding='utf-8') as f:
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
