"""
lib.py for Python smart home wrapper (core module copy)
This module provides the Python-side FFI bindings to Rust device logic via PyO3/maturin.
(Copied for core module reference)
"""
from .device_contracts import DeviceContract, DeviceType, DeviceStatus
try:
	import rust_smart_bulbs
	PySmartBulb = rust_smart_bulbs.PySmartBulb
except ImportError:
	PySmartBulb = None  # Rust extension not built yet
