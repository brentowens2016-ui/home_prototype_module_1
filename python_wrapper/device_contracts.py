"""
Device contracts and type definitions for Python <-> Rust interop

This module defines the canonical device types and statuses for all smart home modules.

# Learning References
# - Python for Dummies
#   - Chapter 10: Creating and Using Classes (see DeviceContract)
#   - Chapter 11: Working with Classes and Objects (see DeviceContract usage)
#   - Chapter 12: Organizing Code with Modules and Packages (see module structure)
#   - Enum usage: see also Python docs (https://docs.python.org/3/library/enum.html)
#
Purpose:
- Ensures type-safe, versioned communication between Python and Rust layers.
- Must be kept in sync with `rust_smart_bulbs/device_contracts.rs`.

Service Type:
- Shared contract (not a service)
- Used by both device logic (Rust) and orchestration/API (Python)

Linked Dependencies:
- Used by: api.py (API), lib.py (FFI), Rust contracts
- No external dependencies

Update Guidance:
- When adding new device types or statuses, update both Python and Rust contracts.
- Document all changes for FFI and API consumers.

---
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
