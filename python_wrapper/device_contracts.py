#   Sensor        SENSOR            "sensor"
#   Unknown       UNKNOWN           "unknown"
#
# DeviceStatus:
#   Rust:         Python Enum:      Python String:
#   On            ON                "on"
#   Off           OFF               "off"
#   Unknown       UNKNOWN           "unknown"
#
# When adding new device types/statuses, update both Rust and Python contracts and this mapping table.
#
# Conversion helpers:
#   - Use DeviceType.from_rust("SmartBulb") to get Python enum from Rust variant name.
#   - Use DeviceType.to_rust(DeviceType.SMART_BULB) to get Rust variant name from Python enum.
"""
Device contracts and type definitions for Python <-> Rust interop

This module defines the canonical device types and statuses for all smart home modules.

# Cross-language contract mapping
# --------------------------------
# Rust enum variant <-> Python enum value mapping:
#
# DeviceType:
#   Rust:         Python Enum:      Python String:
#   SmartBulb     SMART_BULB        "smart_bulb"
#   SmartSwitch   SMART_SWITCH      "smart_switch"
#   Sensor        SENSOR            "sensor"
#   Unknown       UNKNOWN           "unknown"
#
# DeviceStatus:
#   Rust:         Python Enum:      Python String:
#   On            ON                "on"
#   Off           OFF               "off"
#   Unknown       UNKNOWN           "unknown"
#
# When adding new device types/statuses, update both Rust and Python contracts and this mapping table.
#
# Conversion helpers:
#   - Use DeviceType.from_rust("SmartBulb") to get Python enum from Rust variant name.
#   - Use DeviceType.to_rust(DeviceType.SMART_BULB) to get Rust variant name from Python enum.
"""
from enum import Enum

class DeviceType(Enum):
    # Canonical device types for all smart home modules.
    # (See also: rust_smart_bulbs/device_contracts.rs)
    #
    # Rust <-> Python mapping (STRICT, NO AMBIGUOUS TYPES):
    #   Rust: SmartBulb         <-> Python: SMART_BULB ("smart_bulb")
    #   Rust: SmartSwitch       <-> Python: SMART_SWITCH ("smart_switch")
    #   Rust: Sensor            <-> Python: SENSOR ("sensor")
    #   Rust: SecurityHardwired <-> Python: SECURITY_HARDWIRED ("security_hardwired")
    #   Rust: SecurityWiFi      <-> Python: SECURITY_WIFI ("security_wifi")
    #   Rust: Unknown           <-> Python: UNKNOWN ("unknown")
    #
    # When adding new device types, update BOTH this file and rust_smart_bulbs/device_contracts.rs.
    # Do NOT use catch-all or ambiguous types except 'UNKNOWN'.
    SMART_BULB = "smart_bulb"
    SMART_SWITCH = "smart_switch"
    SENSOR = "sensor"
    SECURITY_HARDWIRED = "security_hardwired"
    SECURITY_WIFI = "security_wifi"
    UNKNOWN = "unknown"

    @staticmethod
    def from_rust(rust_variant: str):
        """Convert Rust variant name (e.g., 'SmartBulb') to Python DeviceType enum."""
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
        """Convert Python DeviceType enum to Rust variant name (e.g., 'SmartBulb')."""
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
    # Canonical device statuses for all smart home modules.
    # (See also: rust_smart_bulbs/device_contracts.rs)
    #
    # Rust <-> Python mapping (STRICT, NO AMBIGUOUS STATUSES):
    #   Rust: On      <-> Python: ON ("on")
    #   Rust: Off     <-> Python: OFF ("off")
    #   Rust: Unknown <-> Python: UNKNOWN ("unknown")
    #
    # When adding new statuses, update BOTH this file and rust_smart_bulbs/device_contracts.rs.
    # Do NOT use catch-all or ambiguous statuses except 'UNKNOWN'.
    ON = "on"
    OFF = "off"
    UNKNOWN = "unknown"

    @staticmethod
    def from_rust(rust_variant: str):
        """Convert Rust variant name (e.g., 'On') to Python DeviceStatus enum."""
        mapping = {
            "On": DeviceStatus.ON,
            "Off": DeviceStatus.OFF,
            "Unknown": DeviceStatus.UNKNOWN,
        }
        return mapping.get(rust_variant, DeviceStatus.UNKNOWN)

    @staticmethod
    def to_rust(py_enum) -> str:
        """Convert Python DeviceStatus enum to Rust variant name (e.g., 'On')."""
        mapping = {
            DeviceStatus.ON: "On",
            DeviceStatus.OFF: "Off",
            DeviceStatus.UNKNOWN: "Unknown",
        }
        return mapping.get(py_enum, "Unknown")

class DeviceContract:
    # Python-side representation of a device contract for FFI/API.
    # All fields must be explicit and match Rust struct exactly.
    def __init__(self, name: str, device_type: DeviceType, status: DeviceStatus):
        self.name = name
        self.device_type = device_type
        self.status = status

    def __repr__(self):
        return f"<DeviceContract name={self.name} type={self.device_type.value} status={self.status.value}>"
