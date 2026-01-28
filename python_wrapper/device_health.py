import time
import json
import os
from threading import Lock

# Device health and alert state manager
# This is a simple in-memory + file-backed implementation for demo purposes.

ALERTS_PATH = os.path.join(os.path.dirname(__file__), "device_alerts.json")
HEALTH_PATH = os.path.join(os.path.dirname(__file__), "device_health.json")

_alerts_lock = Lock()

# Device health: { device_id: {"last_seen": timestamp, "status": "up"|"down"|"removed"} }
# Alerts: [ {"device_id": ..., "event": "down|removed", "timestamp": ..., "acknowledged": false} ]

def load_health():
    if os.path.exists(HEALTH_PATH):
        with open(HEALTH_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def save_health(health):
    with open(HEALTH_PATH, "w", encoding="utf-8") as f:
        json.dump(health, f, indent=2)

def load_alerts():
    if os.path.exists(ALERTS_PATH):
        with open(ALERTS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def save_alerts(alerts):
    with open(ALERTS_PATH, "w", encoding="utf-8") as f:
        json.dump(alerts, f, indent=2)

def update_device_health(device_id, status):
    health = load_health()
    now = int(time.time())
    prev_status = health.get(device_id, {}).get("status")
    health[device_id] = {"last_seen": now, "status": status}
    save_health(health)
    if status != prev_status and status in ("down", "removed"):
        add_alert(device_id, status)

def add_alert(device_id, event):
    with _alerts_lock:
        alerts = load_alerts()
        alerts.append({
            "device_id": device_id,
            "event": event,
            "timestamp": int(time.time()),
            "acknowledged": False
        })
        save_alerts(alerts)
        # TODO: send to external/remote monitoring here

def get_unacknowledged_alerts():
    alerts = load_alerts()
    return [a for a in alerts if not a["acknowledged"]]

def acknowledge_alert(device_id):
    with _alerts_lock:
        alerts = load_alerts()
        for a in alerts:
            if a["device_id"] == device_id and not a["acknowledged"]:
                a["acknowledged"] = True
        save_alerts(alerts)

# Example usage:
# update_device_health("zigbee_0x00158d0001a2b3c4", "down")
# print(get_unacknowledged_alerts())
# acknowledge_alert("zigbee_0x00158d0001a2b3c4")
