"""
audio_mapping_api.py: FastAPI endpoints for audio device discovery, selection, and room mapping
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from python_wrapper.audio_io import AudioIO, AudioDeviceInfo

router = APIRouter()

audio_io = AudioIO()

class AudioDeviceModel(BaseModel):
    name: str
    index: int
    max_input_channels: int
    max_output_channels: int
    room: Optional[str] = None

# In-memory mapping: device index -> room name
AUDIO_ROOM_MAP: Dict[int, str] = {}

@router.get("/audio/devices", response_model=List[AudioDeviceModel])
def list_audio_devices():
    """List all available audio devices with room mapping info."""
    devices = AudioIO.list_devices()
    return [AudioDeviceModel(
        name=dev.name,
        index=dev.index,
        max_input_channels=dev.max_input_channels,
        max_output_channels=dev.max_output_channels,
        room=AUDIO_ROOM_MAP.get(dev.index)
    ) for dev in devices]

class RoomMappingRequest(BaseModel):
    device_index: int
    room: str

@router.post("/audio/map_room")
def map_audio_device_to_room(req: RoomMappingRequest):
    if req.device_index not in [dev.index for dev in AudioIO.list_devices()]:
        raise HTTPException(status_code=404, detail="Device not found")
    AUDIO_ROOM_MAP[req.device_index] = req.room
    return {"status": "ok", "device_index": req.device_index, "room": req.room}

@router.get("/audio/room_map")
def get_audio_room_map():
    return AUDIO_ROOM_MAP
