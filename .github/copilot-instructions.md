


# Copilot Instructions: Home Prototype Module 1

## Architecture Overview

- **Three main components:**
  - `rust_smart_bulbs/`: Rust device logic ([src/main.rs](rust_smart_bulbs/src/main.rs)), FFI interface ([lib.rs](rust_smart_bulbs/lib.rs)), device contracts ([device_contracts.rs](rust_smart_bulbs/device_contracts.rs)).
  - `python_wrapper/`: Python orchestration, REST API ([api.py](python_wrapper/api.py)), device contracts ([device_contracts.py](python_wrapper/device_contracts.py)), Rust FFI bindings ([lib.py](python_wrapper/lib.py)).
  - `dashboard/`: React UI ([Dashboard.jsx](dashboard/Dashboard.jsx)) consuming the REST API.

- **Data flow:**
  1. Rust implements device logic, exposed to Python via FFI (PyO3/maturin).
  2. Python FastAPI ([api.py](python_wrapper/api.py)) exposes device controls as REST endpoints.
  3. React dashboard interacts with REST API for UI control and device mapping.

## Developer Workflows

- **Rust:**
  - Build: `cargo build` in `rust_smart_bulbs/`
  - Run: `cargo run` in `rust_smart_bulbs/`
  - Build Python extension: `maturin develop --release` in `rust_smart_bulbs/`
  - Add/modify device logic in [src/main.rs](rust_smart_bulbs/src/main.rs), export via [lib.rs](rust_smart_bulbs/lib.rs) for FFI.

- **Python:**
  - Run API: `uvicorn python_wrapper.api:app --reload` from project root or `python_wrapper/`
  - Extend endpoints in [api.py](python_wrapper/api.py) to match new device logic.
  - Use Rust logic via FFI in [lib.py](python_wrapper/lib.py) if built.
  - Device mapping and health logic in [mapping_api.py](python_wrapper/mapping_api.py), [device_health.py](python_wrapper/device_health.py).

- **Dashboard:**
  - Dev server: `npm run dev` in `dashboard/`
  - Add UI for new device types in [Dashboard.jsx](dashboard/Dashboard.jsx).
  - Device mapping and automation rules in [MappingEditor.jsx](dashboard/MappingEditor.jsx), [AutomationRulesEditor.jsx](dashboard/AutomationRulesEditor.jsx).

## Project-Specific Patterns & Conventions

- **Device contracts:** Always update both [device_contracts.py](python_wrapper/device_contracts.py) and [device_contracts.rs](rust_smart_bulbs/device_contracts.rs) for new device types/statuses. Keep enums and struct fields in sync.
- **Naming:** Use Alexa-style device names (e.g., "Living Room 1") for consistency across all layers.
- **API:** All endpoints return JSON. Document new endpoints in [api_design.md](python_wrapper/api_design.md).
- **Device mapping:** Device mapping is validated for schema and unique IDs ([mapping_loader.py](python_wrapper/mapping_loader.py)).
- **Expansion steps:**
  1. Update `DeviceType` in both contracts.
  2. Implement device logic in Rust ([src/main.rs](rust_smart_bulbs/src/main.rs)).
  3. Expose via FFI in [lib.rs](rust_smart_bulbs/lib.rs) if needed.
  4. Add/extend API endpoint in [api.py](python_wrapper/api.py).
  5. Update dashboard UI as needed.

## Integration, Build, & Testing

- **Docker:** Each major component has a Dockerfile for containerization.
- **FFI:** Rust logic exposed to Python via PyO3 ([lib.rs](rust_smart_bulbs/lib.rs)). Build Rust as a Python extension for integration.
- **Testing:** No formal test suite; run each component standalone to verify integration. Example API tests in [test_mapping_api.py](python_wrapper/test_mapping_api.py).

## Key References

- [README.md](README.md): High-level goals and structure
- [README_integration.md](README_integration.md): Multi-language integration details
- [INTEGRATION_STATUS.md](INTEGRATION_STATUS.md): FFI/API integration status
- [api_design.md](python_wrapper/api_design.md): REST API schema
- [device_contracts.py](python_wrapper/device_contracts.py), [device_contracts.rs](rust_smart_bulbs/device_contracts.rs): Device contracts
- [mapping_loader.py](python_wrapper/mapping_loader.py): Device mapping schema/validation
- [test_mapping_api.py](python_wrapper/test_mapping_api.py): Example API tests
