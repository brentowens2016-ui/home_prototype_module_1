# Update for multi-language contracts and integration

## Python (FastAPI backend)
- Uses `fastapi` and `uvicorn` for REST API
- Device contract: `python_wrapper/device_contracts.py` (should define device types, status, and control interfaces)
- API implementation: `python_wrapper/api.py`

## Rust (Device logic)
- Device contract: `rust_smart_bulbs/device_contracts.rs` (mirrors Python contract)
- Device logic: `rust_smart_bulbs/src/main.rs`

## JavaScript (Dashboard)
- Uses React (with Vite) for UI
- Communicates with backend via REST API (see `api_design.md`)
- No direct device contract, but should follow API schema

## Interop/Expansion
- When adding new device types, update both `device_contracts.py` and `device_contracts.rs`.
- Ensure REST API exposes new device controls.
- Dashboard can be expanded by adding new UI components for new device types.

## Libraries/Tools
- Python: fastapi, uvicorn, pydantic
- Rust: std, serde (if serialization needed for FFI or API)
- JS: react, axios, vite

## Remove ambiguities
- All device types and statuses must be mirrored in both Python and Rust contracts.
- API endpoints must be documented in `api_design.md`.
- Dashboard should only use documented API endpoints.

---

# See device_contracts.py and device_contracts.rs for contract details.
