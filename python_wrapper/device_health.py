# User status: green (ok), yellow (potential issue), red (danger)
def get_user_status(username):
    # For demo: if any unacknowledged alert for user's devices is 'down' or 'removed', red
    # If any device is 'down', yellow
    # Otherwise green
    alerts = load_alerts()
    health = load_health()
    # Assume device_id contains username or is mapped elsewhere; for demo, match by username in device_id
    user_alerts = [a for a in alerts if username in a.get("device_id", "")]
    user_health = {k: v for k, v in health.items() if username in k}
    if any(a["event"] in ("down", "removed") and not a["acknowledged"] for a in user_alerts):
        return "red"
    if any(v["status"] == "down" for v in user_health.values()):
        return "yellow"
    return "green"
import time
import json
import os
from threading import Lock
from . import secure_storage

# Device health and alert state manager
# This is a simple in-memory + file-backed implementation for demo purposes.

ALERTS_PATH = os.path.join(os.path.dirname(__file__), "device_alerts.json.enc")
HEALTH_PATH = os.path.join(os.path.dirname(__file__), "device_health.json.enc")

_alerts_lock = Lock()

# Device health: { device_id: {"last_seen": timestamp, "status": "up"|"down"|"removed"} }
# Alerts: [ {"device_id": ..., "event": "down|removed", "timestamp": ..., "acknowledged": false} ]

def load_health():
    if os.path.exists(HEALTH_PATH):
        return secure_storage.read_and_decrypt_json(HEALTH_PATH)
    return {}

def save_health(health):
    secure_storage.encrypt_json_and_write(HEALTH_PATH, health)

def load_alerts():
    if os.path.exists(ALERTS_PATH):
        return secure_storage.read_and_decrypt_json(ALERTS_PATH)
    return []

def save_alerts(alerts):
    secure_storage.encrypt_json_and_write(ALERTS_PATH, alerts)

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
