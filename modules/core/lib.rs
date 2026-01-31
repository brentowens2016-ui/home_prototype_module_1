// Rust Smart Bulbs FFI Library (core module copy)
// This is the main Rust library for the smart home system, exposing device logic to Python via PyO3/maturin.
// (Copied for core module reference)
pub mod device_contracts;
use pyo3::prelude::*;
pub struct SmartBulb {
    pub name: String,
    pub is_on: bool,
    pub brightness: u8,
    pub color: (u8, u8, u8),
}
impl SmartBulb {
    pub fn new(name: &str) -> Self {
        SmartBulb {
            name: name.to_string(),
            is_on: false,
            brightness: 100,
            color: (255, 255, 255),
        }
    }
    pub fn turn_on(&mut self) {
        self.is_on = true;
    }
    pub fn turn_off(&mut self) {
        self.is_on = false;
    }
    pub fn set_brightness(&mut self, brightness: u8) {
        self.brightness = brightness;
    }
    pub fn set_color(&mut self, r: u8, g: u8, b: u8) {
        self.color = (r, g, b);
    }
    pub fn status(&self) {
        println!("{}: {} | Brightness: {} | Color: {:?}",
            self.name,
            if self.is_on { "On" } else { "Off" },
            self.brightness,
            self.color
        );
    }
}
#[pyclass]
pub struct PySmartBulb {
	inner: SmartBulb,
}
