"""
mapping_engine.py: Core mapping engine for device-to-room and automation mapping
"""
from typing import Dict, Any
import threading

_mapping: Dict[str, Any] = {}
_mapping_lock = threading.Lock()

def get_mapping() -> Dict[str, Any]:
    with _mapping_lock:
        return dict(_mapping)

def set_mapping(mapping: Dict[str, Any]) -> None:
    with _mapping_lock:
        _mapping.clear()
        _mapping.update(mapping)

def validate_mapping(mapping: Dict[str, Any]) -> str:
    # Example: enforce unique device IDs and valid room names
    device_ids = set()
    for dev in mapping.get("devices", []):
        if dev["id"] in device_ids:
            return f"Duplicate device ID: {dev['id']}"
        device_ids.add(dev["id"])
        if not dev.get("room"):
            return f"Device {dev['id']} missing room assignment"
    return ""
