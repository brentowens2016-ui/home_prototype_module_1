"""
hdmi_hub_api.py: FastAPI endpoints for managing HDMI hub/TV endpoints as discreet audio/video AI interfaces.
- MVP: Register, list, and map HDMI hubs to rooms.
- Future: Relay voice/audio streams, manage casting, and secure comms.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional

router = APIRouter()

class HDMIHubModel(BaseModel):
    id: str  # Unique identifier for the hub (e.g., MAC, serial, or user-defined)
    room: Optional[str] = None
    tv_name: Optional[str] = None
    ip: Optional[str] = None
    status: Optional[str] = "offline"  # online/offline

# In-memory registry of hubs (id -> HDMIHubModel)
HDMI_HUBS: Dict[str, HDMIHubModel] = {}

class RegisterHubRequest(BaseModel):
    id: str
    room: Optional[str] = None
    tv_name: Optional[str] = None
    ip: Optional[str] = None

@router.post("/hdmi_hub/register")
def register_hdmi_hub(req: RegisterHubRequest):
    if req.id in HDMI_HUBS:
        raise HTTPException(status_code=409, detail="Hub already registered")
    hub = HDMIHubModel(**req.dict())
    HDMI_HUBS[req.id] = hub
    return {"status": "ok", "hub": hub}

@router.get("/hdmi_hub/list", response_model=List[HDMIHubModel])
def list_hdmi_hubs():
    return list(HDMI_HUBS.values())

class MapRoomRequest(BaseModel):
    id: str
    room: str

@router.post("/hdmi_hub/map_room")
def map_hub_to_room(req: MapRoomRequest):
    if req.id not in HDMI_HUBS:
        raise HTTPException(status_code=404, detail="Hub not found")
    HDMI_HUBS[req.id].room = req.room
    return {"status": "ok", "hub": HDMI_HUBS[req.id]}

@router.get("/hdmi_hub/room_map")
def get_hub_room_map():
    return {hub.id: hub.room for hub in HDMI_HUBS.values()}
