// Device contracts and type definitions for Rust <-> Python interop
#[derive(Debug, Clone)]
pub enum DeviceType {
    SmartBulb,
    SmartSwitch,
    Sensor,
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
