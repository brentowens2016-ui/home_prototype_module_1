"""
Device contracts and type definitions for Python <-> Rust interop
"""
from enum import Enum

class DeviceType(Enum):
    SMART_BULB = "smart_bulb"
    SMART_SWITCH = "smart_switch"
    SENSOR = "sensor"
    UNKNOWN = "unknown"

class DeviceStatus(Enum):
    ON = "on"
    OFF = "off"
    UNKNOWN = "unknown"

class DeviceContract:
    def __init__(self, name: str, device_type: DeviceType, status: DeviceStatus):
        self.name = name
        self.device_type = device_type
        self.status = status

    def __repr__(self):
        return f"<DeviceContract name={self.name} type={self.device_type.value} status={self.status.value}>"
