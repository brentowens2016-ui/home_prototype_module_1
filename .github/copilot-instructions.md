

# Copilot Instructions: Home Prototype Module 1

## Architecture & Data Flow

- **Three main components:**
  - `rust_smart_bulbs/`: Rust device logic (core: [src/main.rs](rust_smart_bulbs/src/main.rs)), FFI interface ([lib.rs](rust_smart_bulbs/lib.rs)), and device contracts ([device_contracts.rs](rust_smart_bulbs/device_contracts.rs)).
  - `python_wrapper/`: Python orchestration, REST API ([api.py](python_wrapper/api.py)), device contracts ([device_contracts.py](python_wrapper/device_contracts.py)), and Rust FFI bindings ([lib.py](python_wrapper/lib.py)).
  - `dashboard/`: React UI ([Dashboard.jsx](dashboard/Dashboard.jsx)) consuming the REST API.

- **Interop:** Device contracts are mirrored in Python and Rust for type-safe communication and FFI. When adding device types/statuses, update both [device_contracts.py](python_wrapper/device_contracts.py) and [device_contracts.rs](rust_smart_bulbs/device_contracts.rs).

- **Data flow:**
  1. Rust implements device logic, exposed to Python via FFI (pyo3).
  2. Python FastAPI ([api.py](python_wrapper/api.py)) exposes device controls as REST endpoints.
  3. React dashboard interacts with REST API for UI control.

## Developer Workflows

- **Rust:**
  - Build: `cargo build` in `rust_smart_bulbs/`
  - Run: `cargo run` in `rust_smart_bulbs/`
  - Device logic: Add/modify in [src/main.rs](rust_smart_bulbs/src/main.rs), export via [lib.rs](rust_smart_bulbs/lib.rs) for FFI.

- **Python:**
  - Run API: `uvicorn python_wrapper.api:app --reload` from project root or `python_wrapper/`
  - Extend endpoints in [api.py](python_wrapper/api.py) to match new device logic.
  - Use Rust logic via FFI in [lib.py](python_wrapper/lib.py) if built.

- **Dashboard:**
  - Dev server: `npm run dev` in `dashboard/`
  - Add UI for new device types in [Dashboard.jsx](dashboard/Dashboard.jsx).

## Project-Specific Patterns & Conventions

- **Device contracts:** Always update both [device_contracts.py](python_wrapper/device_contracts.py) and [device_contracts.rs](rust_smart_bulbs/device_contracts.rs) for new device types/statuses.
- **Naming:** Use Alexa-style device names (e.g., "Living Room 1") for consistency.
- **API:** All endpoints return JSON. Document new endpoints in [api_design.md](python_wrapper/api_design.md).
- **Expansion steps:**
  1. Update `DeviceType` in both contracts.
  2. Implement device logic in Rust ([src/main.rs](rust_smart_bulbs/src/main.rs)).
  3. Expose via FFI in [lib.rs](rust_smart_bulbs/lib.rs) if needed.
  4. Add/extend API endpoint in [api.py](python_wrapper/api.py).
  5. Update dashboard UI as needed.

## Integration, Build, & Testing

- **Docker:** Each major component has a Dockerfile for containerization.
- **FFI:** Rust logic exposed to Python via pyo3 ([lib.rs](rust_smart_bulbs/lib.rs)). Build Rust as a Python extension for integration.
- **Testing:** No formal test suite; run each component standalone to verify integration.

## Key References

- [README.md](README.md): High-level goals and structure
- [README_integration.md](README_integration.md): Multi-language integration details
- [INTEGRATION_STATUS.md](INTEGRATION_STATUS.md): FFI/API integration status
- [api_design.md](python_wrapper/api_design.md): REST API schema
- [device_contracts.py](python_wrapper/device_contracts.py), [device_contracts.rs](rust_smart_bulbs/device_contracts.rs): Device contracts
