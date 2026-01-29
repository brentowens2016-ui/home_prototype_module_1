//! # Smart Bulb Module for Home Automation
use aes::Aes128;
use block_modes::{BlockMode, Cfb};
use block_modes::block_padding::Pkcs7;
use base64::{encode, decode};
type AesCfb = Cfb<Aes128>;

const AES_KEY: &[u8; 16] = b"ThisIsASecretKey123";
const AES_IV: &[u8; 16] = b"ThisIsAnIV456789";

pub fn double_encrypt(data: &[u8]) -> String {
    // First layer: AES
    let cipher = AesCfb::new_from_slices(AES_KEY, AES_IV).unwrap();
    let encrypted1 = cipher.encrypt_vec(data);
    // Second layer: base64
    encode(&encrypted1)
}

pub fn double_decrypt(data: &str) -> Vec<u8> {
    // Second layer: base64
    let encrypted1 = decode(data).unwrap();
    // First layer: AES
    let cipher = AesCfb::new_from_slices(AES_KEY, AES_IV).unwrap();
    cipher.decrypt_vec(&encrypted1).unwrap()
}
//!
//! This module implements the core logic for smart bulbs in the modular smart home system.
//!
//! ## Purpose
//! - Provides the Rust-side implementation of smart bulb device logic.
//! - Designed to be called from Python via FFI (see `lib.rs` and Python wrapper).
//! - Matches Alexa-style naming conventions for device consistency.
//!
//! ## Service Type
//! - Device logic (not a standalone service)
//! - Exposed to Python via PyO3/maturin as a native extension
//!
//! ## Linked Dependencies
//! - [pyo3](https://pyo3.rs/) for Python bindings (see `Cargo.toml`)
//! - Used by: `lib.rs` (FFI), Python API (`python_wrapper/api.py`), and dashboard via REST
//! - Device contracts: `device_contracts.rs` (mirrored in Python)
//!
//! ## Update Guidance
//! - To add new device types, update both Rust and Python contracts.
//! - All state changes should be reflected in both Rust and Python layers for consistency.
//! - Document new methods and device logic clearly for FFI consumers.
//!
//! ## Example Usage
//! ```rust
//! let mut bulb = SmartBulb::new("Living Room 1");
//! bulb.turn_on();
//! bulb.set_brightness(80);
//! bulb.set_color(255, 0, 0);
//! bulb.status();
//! ```
//!
//! ---
//!
//! # Learning References
//! - The Rust Programming Language ("The Rust Book")
//!   - Chapter 5: Structs (see SmartBulb struct)
//!   - Chapter 6: Enums and Pattern Matching (see device_contracts.rs)
//!   - Chapter 7: Managing Growing Projects with Packages, Crates, and Modules (see mod usage)
//!   - Chapter 5.3: Method Syntax (see impl blocks)
//!   - Chapter 19.1: Unsafe Rust (for FFI basics)
//!   - Chapter 9: Error Handling (for Result/Option usage)
//!   - Chapter 11: Writing Automated Tests (for future test expansion)

/// Represents a smart bulb device and its state.
///
/// # Fields
/// - `name`: Device name (matches Alexa-style naming)
/// - `is_on`: Power state
/// - `brightness`: Brightness (0-100)
/// - `color`: RGB tuple (0-255, 0-255, 0-255)
#[derive(Debug)] // Rust Book Ch. 5
pub struct SmartBulb {
    pub name: String,      // Ch. 5.1 Structs
    pub is_on: bool,      // Ch. 5.1 Structs
    pub brightness: u8,   // Ch. 5.1 Structs
    pub color: (u8, u8, u8), // Ch. 5.1 Structs, tuple types
}

impl SmartBulb { // Ch. 5.3 Method Syntax
    /// Create a new smart bulb with default state (off, 100% brightness, white color)
    /// Create a new smart bulb with default state (off, 100% brightness, white color)
    ///
    /// Rust Book: Ch. 5.1 Structs, Ch. 5.3 Method Syntax
    pub fn new(name: &str) -> Self {
        SmartBulb {
            name: name.to_string(),
            is_on: false,
            brightness: 100,
            color: (255, 255, 255), // default to white
        }
    }

    /// Set the brightness (0-100)
    /// Set the brightness (0-100)
    ///
    /// Rust Book: Ch. 5.3 Method Syntax
    pub fn set_brightness(&mut self, brightness: u8) {
        self.brightness = brightness.min(100);
        println!("{} brightness set to {}%", self.name, self.brightness);
    }

    /// Set the color (RGB 0-255)
    /// Set the color (RGB 0-255)
    ///
    /// Rust Book: Ch. 5.3 Method Syntax
    pub fn set_color(&mut self, r: u8, g: u8, b: u8) {
        self.color = (r, g, b);
        println!("{} color set to RGB({}, {}, {})", self.name, r, g, b);
    }

    /// Turn the bulb on
    /// Turn the bulb on
    ///
    /// Rust Book: Ch. 5.3 Method Syntax
    pub fn turn_on(&mut self) {
        self.is_on = true;
        println!("{} is now ON", self.name);
    }

    /// Turn the bulb off
    /// Turn the bulb off
    ///
    /// Rust Book: Ch. 5.3 Method Syntax
    pub fn turn_off(&mut self) {
        self.is_on = false;
        println!("{} is now OFF", self.name);
    }

    /// Print the current status of the bulb
    /// Print the current status of the bulb
    ///
    /// Rust Book: Ch. 5.3 Method Syntax, Ch. 6 (pattern matching for state)
    pub fn status(&self) {
        let state = if self.is_on { "ON" } else { "OFF" };
        println!(
            "{} is currently {} | Brightness: {}% | Color: RGB({}, {}, {})",
            self.name, state, self.brightness, self.color.0, self.color.1, self.color.2
        );
    }
}

/// Example main for local testing and demonstration.
/// Not used in FFI or production, but useful for verifying device logic.
/// Example main for local testing and demonstration.
/// Not used in FFI or production, but useful for verifying device logic.
///
/// Rust Book: Ch. 7 (project structure), Ch. 11 (testing, for future expansion)
fn main() {
    // Create bulbs with Alexa-style names
    let mut living_room_1 = SmartBulb::new("Living Room 1");
    let mut living_room_2 = SmartBulb::new("Living Room 2");
    let mut master_bedroom = SmartBulb::new("Master Bedroom");

    // Initial status
    living_room_1.status();
    living_room_2.status();
    master_bedroom.status();

    // Adjust color and brightness
    living_room_1.set_color(255, 0, 0); // Red
    living_room_1.set_brightness(80);
    living_room_2.set_color(0, 255, 0); // Green
    living_room_2.set_brightness(60);
    master_bedroom.set_color(0, 0, 255); // Blue
    master_bedroom.set_brightness(40);

    // Turn on/off
    living_room_1.turn_on();
    living_room_2.turn_off();
    master_bedroom.turn_on();

    // Final status
    living_room_1.status();
    living_room_2.status();
    master_bedroom.status();
}
