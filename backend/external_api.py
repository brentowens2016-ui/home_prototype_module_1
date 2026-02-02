from fastapi import APIRouter, Request
from .cache_utils import SimpleCache, cached

router = APIRouter()
cache = SimpleCache()
EXTERNAL_API_KEY = "changeme"

def check_api_key(request: Request):
    key = request.headers.get("x-api-key", "")
    return key == EXTERNAL_API_KEY

@router.post("/api/external/device-control")
async def external_device_control(request: Request):
    if not check_api_key(request):
        return {"error": "Invalid API key."}
    data = await request.json()
    device_id = data.get("device_id", "")
    action = data.get("action", "")
    return {"status": "ok", "device_id": device_id, "action": action}

@router.get("/api/external/data")
async def external_data_access(request: Request):
    if not check_api_key(request):
        return {"error": "Invalid API key."}
    return {"data": {"rooms": [], "devices": [], "status": "ok"}}

@router.get("/api/external/status")
async def external_status(request: Request):
    if not check_api_key(request):
        return {"error": "Invalid API key."}
    status = cached(cache, "system_status", lambda: {"status": "online", "uptime": "24h", "devices_connected": 2}, ttl=10)
    return status
