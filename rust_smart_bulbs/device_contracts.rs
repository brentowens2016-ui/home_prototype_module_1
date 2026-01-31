//! # Device Contracts for Rust <-> Python Interop
//!
//! # Learning References
//! - The Rust Programming Language ("The Rust Book")
//!   - Chapter 6: Enums and Pattern Matching (see DeviceType, DeviceStatus)
//!   - Chapter 5: Structs (see DeviceContract)
//!   - Chapter 7: Managing Growing Projects with Packages, Crates, and Modules (see mod usage)
//!
//!
//! This module defines the core device types and status enums for cross-language communication.
//!
//! # Contract Compliance
//! - All device types/statuses must be mirrored in Python and Rust.
//! - Annotate new features and document for FFI/API consumers.
//! - Predictive AI module (python_wrapper/predictive_ai.py) uses these contracts for event/scenario typing and onboarding suggestions.
//!
//! ## Purpose
//! - Provides a canonical set of device types and statuses for all smart home modules.
//! - Ensures type-safe, versioned communication between Rust and Python layers.
//! - Must be kept in sync with `python_wrapper/device_contracts.py`.
//!
//! ## Service Type
//! - Shared contract (not a service)
//! - Used by both device logic (Rust) and orchestration/API (Python)
//!
//! ## Linked Dependencies
//! - Used by: `main.rs` (device logic), `lib.rs` (FFI), Python contracts
//! - No external crates required
//!
//! ## Update Guidance
//! - When adding new device types or statuses, update both Rust and Python contracts.
//! - Document all changes for FFI and API consumers.
//!
//! # Cross-language contract mapping
//! --------------------------------
//! Rust enum variant <-> Python enum value mapping (STRICT, NO AMBIGUOUS TYPES):
//!
//! DeviceType:
//!   Rust: SmartBulb         <-> Python: SMART_BULB ("smart_bulb")
//!   Rust: SmartSwitch       <-> Python: SMART_SWITCH ("smart_switch")
//!   Rust: Sensor            <-> Python: SENSOR ("sensor")
//!   Rust: SecurityHardwired <-> Python: SECURITY_HARDWIRED ("security_hardwired")
//!   Rust: SecurityWiFi      <-> Python: SECURITY_WIFI ("security_wifi")
//!   Rust: Unknown           <-> Python: UNKNOWN ("unknown")
//!
//! DeviceStatus:
//!   Rust: On      <-> Python: ON ("on")
//!   Rust: Off     <-> Python: OFF ("off")
//!   Rust: Unknown <-> Python: UNKNOWN ("unknown")
//!
//! When adding new device types or statuses, update BOTH this file and python_wrapper/device_contracts.py.
//! Do NOT use catch-all or ambiguous types except 'Unknown'.
//! Conversion helpers should be implemented in the Python layer for FFI boundary.
//! ---
/// Enumerates all supported device types.
#[derive(Debug, Clone)] // Ch. 6 Enums
    /// Smart bulb (dimmable, color)
    SmartBulb,
    /// Smart switch (on/off)
    SmartSwitch,
    /// Sensor (e.g., temperature, motion)
    Sensor,
    /// Hardwired security system
    SecurityHardwired,
    /// Wi-Fi based security system
    SecurityWiFi,
    /// Unknown or unsupported device
    Unknown,
}
pub enum DeviceType {
    /// Smart bulb (dimmable, color)
    SmartBulb,
    /// Smart switch (on/off)
    SmartSwitch,
    /// Sensor (e.g., temperature, motion)
    Sensor,
    /// Hardwired security system
    SecurityHardwired,
    /// Wi-Fi based security system
    SecurityWiFi,
    /// Unknown or unsupported device (only allowed catch-all)
    Unknown,
}

/// Enumerates all possible device statuses.
#[derive(Debug, Clone)] // Ch. 6 Enums
    /// Device is on/active
    On,
    /// Device is off/inactive
    Off,
    /// Status unknown
    Unknown,
}
pub enum DeviceStatus {
    /// Device is on/active
    On,
    /// Device is off/inactive
    Off,
    /// Status unknown (only allowed catch-all)
    Unknown,
}

/// Canonical device contract for cross-language communication.
///
/// # Fields
/// - `name`: Device name (string, must match across layers)
/// - `device_type`: DeviceType enum
/// - `status`: DeviceStatus enum
#[derive(Debug, Clone)] // Ch. 5 Structs
    pub name: String,
    pub device_type: DeviceType,
    pub status: DeviceStatus,
}
pub struct DeviceContract {
    pub name: String,
    pub device_type: DeviceType, // Must match Python contract exactly
    pub status: DeviceStatus,    // Must match Python contract exactly
}

impl DeviceContract { // Ch. 5.3 Method Syntax
    /// Create a new device contract instance.
    pub fn new(name: &str, device_type: DeviceType, status: DeviceStatus) -> Self {
        DeviceContract {
            name: name.to_string(),
            device_type,
            status,
        }
    }
}
