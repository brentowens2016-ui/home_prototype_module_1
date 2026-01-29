"""
audio_config_api.py: FastAPI endpoints for getting/setting default audio input/output devices (by index or name)
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

# In-memory config (replace with persistent storage as needed)
audio_config = {
    "input_device_index": None,
    "output_device_index": None
}

class AudioConfigModel(BaseModel):
    input_device_index: Optional[int] = None
    output_device_index: Optional[int] = None

@router.get("/audio/config", response_model=AudioConfigModel)
def get_audio_config():
    return audio_config

@router.post("/audio/config", response_model=AudioConfigModel)
def set_audio_config(cfg: AudioConfigModel):
    if cfg.input_device_index is not None:
        audio_config["input_device_index"] = cfg.input_device_index
    if cfg.output_device_index is not None:
        audio_config["output_device_index"] = cfg.output_device_index
    return audio_config
