from python_wrapper.device_health import get_unacknowledged_alerts, acknowledge_alert
# Device health/alert endpoints
@app.get("/alerts")
def get_alerts():
    return get_unacknowledged_alerts()

@app.post("/alerts/ack")
def ack_alert(device_id: str):
    acknowledge_alert(device_id)
    return {"status": "ok"}

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
"""





from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict
from python_wrapper.lib import PySmartBulb
from python_wrapper.mapping_api import get_mapping, set_mapping
from python_wrapper.mapping_loader import validate_mapping_object

from python_wrapper.contacts_api import router as contacts_router

from python_wrapper.support_api import router as support_router

from python_wrapper.users_api import router as users_router

from python_wrapper.backup_api import router as backup_router

from python_wrapper.notify_api import router as notify_router

from python_wrapper.diagnostics_api import router as diagnostics_router

from python_wrapper.automation_api import router as automation_router

from python_wrapper.tts_api import router as tts_router
from python_wrapper.ota_api import router as ota_router
from python_wrapper.analytics_api import router as analytics_router




app = FastAPI(
    title="Home Prototype Module 1 API",
    description="Comprehensive API for smart home, security, automation, and support features.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)
app.include_router(contacts_router)
app.include_router(support_router)
app.include_router(users_router)
app.include_router(backup_router)
app.include_router(notify_router)
app.include_router(diagnostics_router)
app.include_router(automation_router)
app.include_router(tts_router)
app.include_router(ota_router)
app.include_router(analytics_router)
@app.get("/mapping")
def get_device_mapping():
    return get_mapping()

@app.post("/mapping")
async def upload_device_mapping(request: Request):
    try:
        mapping = await request.json()
        validate_mapping_object(mapping)  # Will raise if invalid
        set_mapping(mapping)
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

def get_bulb_state(bulb: PySmartBulb) -> BulbState:
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
