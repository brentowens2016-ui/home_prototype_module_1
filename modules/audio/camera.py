from fastapi import APIRouter, Request

camera_router = APIRouter()

@camera_router.get("/cameras")
def list_cameras():
    # Stub: Replace with actual camera listing logic
    return []

@camera_router.post("/cameras/motion-snapshot")
async def camera_motion_snapshot(request: Request):
    # Stub: Replace with actual snapshot logic
    return {"status": "ok"}

@camera_router.post("/cameras/motion-clip")
async def camera_motion_clip(request: Request):
    # Stub: Replace with actual motion clip logic
    return {"status": "ok"}

@camera_router.get("/cameras/stream/{camera_id}")
def camera_stream(camera_id: str):
    # Stub: Replace with actual streaming logic
    return {"status": "ok", "camera_id": camera_id}
