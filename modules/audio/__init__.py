"""
Audio/Video/Language module package for Home Prototype.
Contains all endpoints and logic for audio, video, camera, HDMI, and language features.
"""

from fastapi import APIRouter
from .audio_endpoints import audio_router
from .camera import camera_router
from .hdmi import hdmi_router
from .voice_assistants import voice_router

router = APIRouter()
router.include_router(audio_router)
router.include_router(camera_router)
router.include_router(hdmi_router)
router.include_router(voice_router)
