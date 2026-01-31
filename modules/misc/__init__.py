"""
Miscellaneous module package for Home Prototype.
Contains all endpoints and logic not covered by core, AI, or audio/video/language modules.
"""

from fastapi import APIRouter
from .guests import guests_router
from .energy import energy_router
from .automation import automation_router

router = APIRouter()
router.include_router(guests_router)
router.include_router(energy_router)
router.include_router(automation_router)
