"""
AI module package for Home Prototype.
Contains all endpoints and logic for predictive AI, scenario/event training, and diagnostics.
"""

from fastapi import APIRouter
from .predictive import predictive_router

router = APIRouter()
router.include_router(predictive_router)
