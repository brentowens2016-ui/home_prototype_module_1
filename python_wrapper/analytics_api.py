"""
Analytics API for Smart Home Platform
Provides endpoints for device usage statistics, event history, and system health trends.
"""
from fastapi import APIRouter, Query
from typing import List, Dict, Any
import datetime
import json
import os

router = APIRouter()

# Example: Load event history from a JSON file (replace with DB in production)
EVENT_HISTORY_PATH = os.path.join(os.path.dirname(__file__), "event_history.json")
DEVICE_USAGE_PATH = os.path.join(os.path.dirname(__file__), "device_usage.json")
SYSTEM_HEALTH_PATH = os.path.join(os.path.dirname(__file__), "system_health.json")


def load_json(path: str) -> Any:
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)
    return []

@router.get("/analytics/events", summary="Get event history", response_model=List[Dict[str, Any]])
def get_event_history(
    start: datetime.datetime = Query(None),
    end: datetime.datetime = Query(None),
    device: str = Query(None)
):
    events = load_json(EVENT_HISTORY_PATH)
    filtered = []
    for event in events:
        ts = datetime.datetime.fromisoformat(event["timestamp"])
        if start and ts < start:
            continue
        if end and ts > end:
            continue
        if device and event.get("device") != device:
            continue
        filtered.append(event)
    return filtered

@router.get("/analytics/device-usage", summary="Get device usage statistics", response_model=List[Dict[str, Any]])
def get_device_usage():
    return load_json(DEVICE_USAGE_PATH)

@router.get("/analytics/system-health", summary="Get system health trends", response_model=List[Dict[str, Any]])
def get_system_health():
    return load_json(SYSTEM_HEALTH_PATH)
