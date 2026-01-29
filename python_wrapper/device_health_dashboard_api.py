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


# Expanded health summary with proactive checks
@router.get("/device-health/summary")
def device_health_summary():
    health = load_health()
    now = int(time.time())
    summary = []
    for device_id, info in health.items():
        last_seen = info.get("last_seen", 0)
        status = info.get("status", "unknown")
        uptime = max(0, now - last_seen) if status == "up" else 0
        error_rate = info.get("error_rate", 0)
        proactive_alert = None
        if status != "up" or error_rate > 0.1:
            proactive_alert = f"Device {device_id} may need attention: status={status}, error_rate={error_rate}"
        summary.append({
            "device_id": device_id,
            "status": status,
            "last_seen": last_seen,
            "uptime_seconds": uptime,
            "error_rate": error_rate,
            "proactive_alert": proactive_alert
        })
    return summary

@router.get("/device-health/alerts")
def device_health_alerts():
    return load_alerts()