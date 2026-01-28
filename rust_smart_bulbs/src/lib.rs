// lib.rs for Rust smart home modules
pub mod device_contracts;

mod main;
pub use main::SmartBulb;

use pyo3::prelude::*;

#[pyclass]
pub struct PySmartBulb {
    inner: SmartBulb,
}

#[pymethods]
impl PySmartBulb {
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
