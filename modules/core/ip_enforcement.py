from fastapi import Request
from fastapi.responses import JSONResponse
import os
import json
import time
from fastapi import APIRouter

REGISTERED_IPS_PATH = os.path.join(os.path.dirname(__file__), "registered_ips.json")
IP_HISTORY_PATH = os.path.join(os.path.dirname(__file__), "ip_history.json")

ip_history_router = APIRouter()

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

@ip_history_router.get("/ip-history/{account_id}")
def get_ip_history(account_id: str, request: Request):
    role = request.headers.get("X-Role", "guest")
    if role != "admin":
        return JSONResponse(status_code=403, content={"error": "Admin only."})
    history = load_ip_history()
    return history.get(account_id, [])
