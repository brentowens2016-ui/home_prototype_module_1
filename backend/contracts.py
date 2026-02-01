class Control(BaseModel):
    type: str  # 'checkbox', 'slider', 'input', etc.
    label: str
    value: Any = None
    min: int = 0
    max: int = 100
class BluetoothDeviceMetadata(BaseModel):
    name: str
    address: str
    device_type: str
    driver_installed: bool = False
    driver_version: str = ""
    last_seen: str = ""

# Contract structures for cross-platform dashboard features
# These define the data exchanged between frontend, backend (Python), and agent (Rust FFI)

from typing import List, Dict, Any
from pydantic import BaseModel

class FeatureContract(BaseModel):
    name: str
    tier: str
    enabled: bool

    controls: List[Control] = []
    ai_roles: List[str] = []  # e.g., ["system_admin", "remote_agent", "user_admin"]
    bluetooth_devices: List[BluetoothDeviceMetadata] = []  # Devices associated with this feature
    accessibility: Dict[str, Any] = {}  # speech_to_text, text_to_speech, etc.

class DashboardContract(BaseModel):
    user_tier: str
    features: List[FeatureContract]
    ai_role: str = "user_admin"  # or "system_admin", "remote_agent"

# Example usage:
# DashboardContract(user_tier="basic", features=[FeatureContract(name="Home Map", tier="basic", enabled=True, controls=[])])
