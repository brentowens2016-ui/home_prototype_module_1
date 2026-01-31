from fastapi import APIRouter

device_health_router = APIRouter()

@device_health_router.get("/device-health/global")
def global_device_health():
    return {"devices": [], "alerts": []}
