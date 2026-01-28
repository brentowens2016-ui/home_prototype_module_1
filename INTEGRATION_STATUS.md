# Update for FFI and API integration

- Rust smart bulbs are now exposed to Python via pyo3 (see rust_smart_bulbs/lib.rs)
- Python can import and use PySmartBulb from the compiled Rust extension
- API backend (FastAPI) can be extended to use real Rust logic via FFI
- Dashboard communicates with API as before

## Next steps for full integration
- Build Rust as a Python extension module (see pyo3/maturin docs)
- Update API endpoints to use PySmartBulb for real device logic
- Expand device_contracts.py and device_contracts.rs as new device types are added

# All contracts and interfaces are now ready for multi-language, multi-device expansion.
