"""
Device Health Dashboard API: real-time status, uptime, last seen, error rates, and alerts
"""
import os
import json
import time
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from .device_health import load_health, load_alerts

router = APIRouter()

@router.get("/device-health/summary")
def device_health_summary():
    health = load_health()
    now = int(time.time())
    summary = []
    for device_id, info in health.items():
        last_seen = info.get("last_seen", 0)
        status = info.get("status", "unknown")
        uptime = max(0, now - last_seen) if status == "up" else 0
        summary.append({
            "device_id": device_id,
            "status": status,
            "last_seen": last_seen,
            "uptime_seconds": uptime
        })
    # Error rates and anomalies could be expanded here
    return summary

@router.get("/device-health/alerts")
def device_health_alerts():
    return load_alerts()