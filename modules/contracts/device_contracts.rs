// Device Contracts for Rust <-> Python Interop
// (Copied for reference from rust_smart_bulbs/device_contracts.rs)

#[derive(Debug, Clone)]
pub enum DeviceType {
    SmartBulb,
    SmartSwitch,
    Sensor,
    SecurityHardwired,
    SecurityWiFi,
    Unknown,
}

#[derive(Debug, Clone)]
pub enum DeviceStatus {
    On,
    Off,
    Unknown,
}

#[derive(Debug, Clone)]
pub struct DeviceContract {
    pub name: String,
    pub device_type: DeviceType,
    pub status: DeviceStatus,
}

impl DeviceContract {
    pub fn new(name: &str, device_type: DeviceType, status: DeviceStatus) -> Self {
        DeviceContract {
            name: name.to_string(),
            device_type,
            status,
        }
    }
}
