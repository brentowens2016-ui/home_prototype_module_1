use serde::{Serialize, Deserialize};
use serde_json;
#[derive(Serialize, Deserialize, Debug)]
pub struct Control {
    pub control_type: String,
    pub label: String,
    pub value: Option<serde_json::Value>,
    pub min: Option<i32>,
    pub max: Option<i32>,
}
#[derive(Serialize, Deserialize, Debug)]
pub struct BluetoothDeviceMetadata {
    pub name: String,
    pub address: String,
    pub device_type: String,
    pub driver_installed: bool,
    pub driver_version: Option<String>,
    pub last_seen: Option<String>,
}
// Rust struct for dashboard contract (agent FFI)
#[derive(Serialize, Deserialize, Debug)]
pub struct FeatureContract {
    pub name: String,
    pub tier: String,
    pub enabled: bool,
    pub controls: Option<Vec<Control>>,
    pub ai_roles: Option<Vec<String>>,
    pub bluetooth_devices: Option<Vec<BluetoothDeviceMetadata>>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct DashboardContract {
    pub user_tier: String,
    pub features: Vec<FeatureContract>,
    pub ai_role: String,
}

