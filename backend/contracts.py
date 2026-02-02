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

class MappingInfo(BaseModel):
    square_footage: int = 0
    commercial_square_footage: int = 0
    site_address: str = ""
    site_city: str = ""
    site_state: str = ""
    site_zip: str = ""
    allowed_ips: list[str] = []  # Up to two allowed IPs/ranges (site and remote monitor)
    account_frozen: bool = False  # True if account is frozen due to IP violation

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

# --- Role Definitions and Policies ---
ROLE_POLICIES = {
    "system_admin": [
        "view", "edit", "delete", "manage_users", "access_server", "access_local", "manage_roles", "audit"
    ],
    "local_system_admin": [
        "view", "edit", "delete", "access_local", "install_drivers", "configure_local"
    ],
    "system_user_support": [
        "view", "edit_user_accounts", "edit_user_settings", "remote_edit_with_permission", "verify_accounts", "delete_user_accounts", "freeze_accounts", "unfreeze_accounts", "enforce_account_roles"
    ],
    "admin_support": [
        "view", "admin_support_user_accounts", "admin_support_agent_accounts"
    ],
    "agent_user": [
        "view", "edit_local_settings", "define_local_roles", "manage_local_devices", "assign_local_admin", "manage_local_account"
    ],
    "system_editor": [
        "view", "propose_backend_changes", "submit_edit_for_approval", "edit_frontend", "edit_frontend_within_limits"
    ],
    "system_user": [
        "view", "edit_agent", "suggest_edits", "suggest_to_admin", "suggest_to_editor", "activate_account", "deactivate_account", "follow_admin_policies"
    ]
}

def check_permission(role: str, action: str) -> bool:

# --- Role Expansion ---

# --- Dynamic Role Creation & Delegation ---
USER_ROLES = {}  # Maps user_id to role name(s)

def add_role(role_name: str, actions: list[str]):
    ROLE_POLICIES[role_name] = actions

def delegate_role(user_id: str, role_name: str):
    if role_name in ROLE_POLICIES:
        USER_ROLES[user_id] = role_name
        return True
    return False

def get_user_role(user_id: str) -> str:
    return USER_ROLES.get(user_id, "")

def check_permission(role: str, action: str) -> bool:
    return action in ROLE_POLICIES.get(role, [])
