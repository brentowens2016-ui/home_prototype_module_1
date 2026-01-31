"""
Device contracts and type definitions for Python <-> Rust interop
(Copied for reference from python_wrapper/device_contracts.py)
"""

from enum import Enum

class DeviceType(Enum):
    SMART_BULB = "smart_bulb"
    SMART_SWITCH = "smart_switch"
    SENSOR = "sensor"
    SECURITY_HARDWIRED = "security_hardwired"
    SECURITY_WIFI = "security_wifi"
    UNKNOWN = "unknown"

    @staticmethod
    def from_rust(rust_variant: str):
        mapping = {
            "SmartBulb": DeviceType.SMART_BULB,
            "SmartSwitch": DeviceType.SMART_SWITCH,
            "Sensor": DeviceType.SENSOR,
            "SecurityHardwired": DeviceType.SECURITY_HARDWIRED,
            "SecurityWiFi": DeviceType.SECURITY_WIFI,
            "Unknown": DeviceType.UNKNOWN,
        }
        return mapping.get(rust_variant, DeviceType.UNKNOWN)

    @staticmethod
    def to_rust(py_enum) -> str:
        mapping = {
            DeviceType.SMART_BULB: "SmartBulb",
            DeviceType.SMART_SWITCH: "SmartSwitch",
            DeviceType.SENSOR: "Sensor",
            DeviceType.SECURITY_HARDWIRED: "SecurityHardwired",
            DeviceType.SECURITY_WIFI: "SecurityWiFi",
            DeviceType.UNKNOWN: "Unknown",
        }
        return mapping.get(py_enum, "Unknown")

class DeviceStatus(Enum):
    ON = "on"
    OFF = "off"
    UNKNOWN = "unknown"

    @staticmethod
    def from_rust(rust_variant: str):
        mapping = {
            "On": DeviceStatus.ON,
            "Off": DeviceStatus.OFF,
            "Unknown": DeviceStatus.UNKNOWN,
        }
        return mapping.get(rust_variant, DeviceStatus.UNKNOWN)

    @staticmethod
    def to_rust(py_enum) -> str:
        mapping = {
            DeviceStatus.ON: "On",
            DeviceStatus.OFF: "Off",
            DeviceStatus.UNKNOWN: "Unknown",
        }
        return mapping.get(py_enum, "Unknown")

class DeviceContract:
    def __init__(self, name: str, device_type: DeviceType, status: DeviceStatus):
        self.name = name
        self.device_type = device_type
        self.status = status

    def __repr__(self):
        return f"<DeviceContract name={self.name} type={self.device_type.value} status={self.status.value}>"
