"""
lib.py for Python smart home wrapper

This module provides the Python-side FFI bindings to Rust device logic via PyO3/maturin.

# Learning References
# - Python for Dummies
#   - Chapter 12: Organizing Code with Modules and Packages (see import structure)
#   - Chapter 18: Extending Python with C (conceptually similar for FFI)
#   - Chapter 10: Creating and Using Classes (see PySmartBulb usage)
#
Purpose:
- Imports and exposes Rust device classes (e.g., PySmartBulb) for use in Python orchestration and API layers.
- Bridges high-level Python logic with high-performance Rust code.

Linked Dependencies:
- Depends on the compiled Rust extension (see rust_smart_bulbs/lib.rs)
- Used by: api.py (API), device_contracts.py (contracts)


"""

from .device_contracts import DeviceContract, DeviceType, DeviceStatus

# Rust FFI bindings using pyo3 (see rust_smart_bulbs/lib.rs)
try:
	import rust_smart_bulbs
	PySmartBulb = rust_smart_bulbs.PySmartBulb
except ImportError:
	PySmartBulb = None  # Rust extension not built yet

# Usage:
# bulb = PySmartBulb("Living Room 1")
# bulb.set_brightness(80)
# bulb.set_color(255,0,0)
# bulb.turn_on()
# bulb.status()
