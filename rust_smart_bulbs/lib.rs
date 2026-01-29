//! # Rust Smart Bulbs FFI Library
//!
//! # Learning References
//! - The Rust Programming Language ("The Rust Book")
//!   - Chapter 7: Managing Growing Projects with Packages, Crates, and Modules (see pub mod usage)
//!   - Chapter 5: Structs (see PySmartBulb)
//!   - Chapter 5.3: Method Syntax (see impl blocks)
//!   - Chapter 19.1: Unsafe Rust (for FFI basics)
//!   - PyO3 documentation: https://pyo3.rs/
//!
//!
//! This is the main Rust library for the smart home system, exposing device logic to Python via PyO3/maturin.
//!
//! ## Purpose
//! - Exposes Rust device logic (e.g., SmartBulb) as Python classes for orchestration and API layers.
//! - Provides a bridge between high-performance device code and Python orchestration.
//!
//! ## Structure
//! - `device_contracts`: Shared device types and status enums (mirrored in Python)
//! - `main`: Device logic (e.g., SmartBulb)
//! - `PySmartBulb`: PyO3 wrapper for Python FFI
//!
//! ## Linked Dependencies
//! - [pyo3](https://pyo3.rs/) for Python bindings
//! - Used by: Python wrapper (`lib.py`), FastAPI API (`api.py`)
//!
//! ## Update Guidance
//! - When adding new device types, update both Rust and Python contracts.
//! - Document all FFI classes and methods for Python consumers.
//! - Ensure crate-type is set to `cdylib` in Cargo.toml for FFI.
//!
//! ---
pub mod device_contracts;
// ...existing code...

use pyo3::prelude::*;

// SmartBulb struct and implementation
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
pub struct PySmartBulb { // Ch. 5 Structs
	inner: SmartBulb,
}

#[pymethods]
impl PySmartBulb { // Ch. 5.3 Method Syntax
	#[new]
	pub fn new(name: &str) -> Self {
		PySmartBulb { inner: SmartBulb::new(name) }
	}
	pub fn turn_on(&mut self) { self.inner.turn_on(); }
	pub fn turn_off(&mut self) { self.inner.turn_off(); }
	pub fn set_brightness(&mut self, brightness: u8) { self.inner.set_brightness(brightness); }
	pub fn set_color(&mut self, r: u8, g: u8, b: u8) { self.inner.set_color(r, g, b); }
	pub fn status(&self) { self.inner.status(); }
}

#[pymodule]
fn rust_smart_bulbs(_py: Python, m: &PyModule) -> PyResult<()> {
	m.add_class::<PySmartBulb>()?;
	Ok(())
}

// Required for pyo3/maturin to recognize this as a Python extension module
#[cfg(feature = "pyo3/extension-module")]
#[no_mangle]
pub extern "C" fn PyInit_rust_smart_bulbs() -> *mut pyo3::ffi::PyObject {
	pyo3::impl_::trampoline::module_init(rust_smart_bulbs)
}
