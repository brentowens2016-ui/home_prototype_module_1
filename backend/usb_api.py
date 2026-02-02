from fastapi import APIRouter, Request
from .cache_utils import SimpleCache, cached

router = APIRouter()
usb_modules = {}
cache = SimpleCache()

def discover_usb_devices():
    # Placeholder: Simulate USB device discovery
    return [
        {"id": "usb1", "name": "TP-Link Smart Plug", "vendor": "TP-Link", "status": "connected"},
        {"id": "usb2", "name": "Zigbee Dongle", "vendor": "Zigbee", "status": "connected"}
    ]

def register_usb_module(module_id, info):
    usb_modules[module_id] = info

@router.get("/usb/discover")
async def usb_discover():
    devices = cached(cache, "usb_devices", discover_usb_devices, ttl=30)
    return {"devices": devices}

@router.post("/usb/register")
async def usb_register(request: Request):
    data = await request.json()
    module_id = data.get("module_id", "")
    info = data.get("info", {})
    register_usb_module(module_id, info)
    return {"status": "ok", "module_id": module_id}

@router.get("/usb/modules")
async def usb_modules_list():
    modules = cached(cache, "usb_modules", lambda: usb_modules.copy(), ttl=30)
    return {"modules": modules}
