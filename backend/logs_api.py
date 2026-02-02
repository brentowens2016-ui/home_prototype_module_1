from fastapi import APIRouter
from .cache_utils import SimpleCache, cached
import glob
import os
import aiofiles
import gzip
import base64
from fastapi import Request
import datetime

router = APIRouter()
cache = SimpleCache()

def get_server_logs():
    async def read_logs():
        log_files = glob.glob("logs/*.log")
        logs = {}
        for lf in log_files:
            async with aiofiles.open(lf, "r", encoding="utf-8") as f:
                content = await f.read()
                compressed = gzip.compress(content.encode("utf-8"))
                # Encode to base64 for safe JSON transport
                logs[os.path.basename(lf)] = base64.b64encode(compressed).decode("utf-8")
        return logs
    return read_logs

# --- Dynamic Event Logging ---
async def log_event(event_type, details):
    ts = datetime.datetime.utcnow().isoformat()
    log_entry = f"[{ts}] EVENT: {event_type} | {details}\n"
    async with aiofiles.open("logs/events.log", "a", encoding="utf-8") as f:
        await f.write(log_entry)

# --- Emergency Protocol Logging ---
async def log_emergency(details):
    ts = datetime.datetime.utcnow().isoformat()
    log_entry = f"[{ts}] EMERGENCY: {details}\n"
    async with aiofiles.open("logs/emergency.log", "a", encoding="utf-8") as f:
        await f.write(log_entry)
# --- API Endpoints ---
@router.post("/logs/event")
async def api_log_event(request: Request):
    data = await request.json()
    event_type = data.get("event_type", "generic")
    details = data.get("details", "")
    await log_event(event_type, details)
    return {"status": "ok"}

@router.post("/logs/emergency")
async def api_log_emergency(request: Request):
    data = await request.json()
    details = data.get("details", "")
    await log_emergency(details)
    return {"status": "ok"}

@router.get("/logs/server")
async def query_server_logs():
    logs = await cached(cache, "server_logs", get_server_logs(), ttl=30)
    return {"logs": logs, "compression": "gzip+base64"}
