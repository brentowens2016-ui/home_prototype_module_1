





# Copilot Instructions: Home Prototype Module 1

## Architecture Overview

**Major Components:**
- **Rust device logic** ([rust_smart_bulbs/lib.rs]): Implements core device behavior (e.g., SmartBulb). Exposed to Python via PyO3/maturin FFI as `PySmartBulb` and related classes.
- **Python orchestration/API** ([python_wrapper/api.py]): FastAPI REST API for device controls, automation, and integrations. Integrates Rust FFI, device mapping, and modular routers.
- **React dashboard** ([dashboard/Dashboard.jsx]): User interface, interacts with FastAPI backend via REST for device control, mapping, and monitoring.

**Data Flow:**
1. Rust device logic is exposed to Python via FFI wrappers.
2. Python FastAPI exposes device and automation controls as REST endpoints.
3. React dashboard interacts with these endpoints for all device, mapping, and automation features.

## Developer Workflows

**Rust:**
- Edit device logic in [rust_smart_bulbs/lib.rs] and [rust_smart_bulbs/device_contracts.rs].
- Build with `cargo build` or VS Code task "Cargo Build (Rust)".
- Expose new device logic to Python by updating PyO3 classes.

**Python:**
- Main API: [python_wrapper/api.py].
- Add new endpoints for device types, automations, or integrations here.
- Use [python_wrapper/lib.py] for FFI bindings to Rust.
- Features are modularized as routers (see `include_router` in `api.py`).
- Run API server: `uvicorn python_wrapper.api:app --reload` or VS Code task "Run FastAPI server (AI Voice Build)".

**Dashboard (React):**
- UI code in [dashboard/], entry: [Dashboard.jsx].
- Interacts with REST API for all device and mapping actions.
- Use `npm install` and `npm run dev` for local development.

## Project-Specific Patterns & Conventions

1. **DeviceType contract:** Update both Rust ([device_contracts.rs]) and Python ([device_contracts.py]) contracts when adding new device types or statuses. Keep mapping tables in sync.
2. **Device logic:** Implement in Rust, expose via FFI, add Python API endpoint, then update dashboard UI.
3. **Mapping:** Device/room mapping logic in [python_wrapper/mapping_api.py] and [python_wrapper/mapping_engine.py]. Enforce device/tier limits based on user subscription and square footage.
4. **Modular API:** New features are added as routers (see `include_router` in [api.py]).
5. **Data storage:** Most user/device data is stored in local JSON files in [python_wrapper/]. No direct file browsing; access is via API endpoints only.
6. **Security/Privacy:** API includes IP enforcement, double encryption middleware, and rate limiting (see [api.py]).
7. **Event-driven automation:** Bulb color and automation endpoints are event-driven (see `/bulbs/{name}/event-color` and `/predictive/` endpoints in [api.py]).
8. **Backup/restore:** Only backup/restore endpoints can access user data on server; all other data is local or user-owned cloud storage.

## Integration, Build, & Testing

- **Build Rust:** VS Code task "Cargo Build (Rust)" or `cargo build`.
- **Run API:** VS Code task "Run FastAPI server (AI Voice Build)" or `uvicorn python_wrapper.api:app --reload`.
- **Dashboard:** Standard React workflow (`npm install`, `npm run dev`).
- **Testing:** No formal test suite; test via API endpoints and dashboard UI.

## Key References

- [python_wrapper/api.py]: Main API surface, integration patterns, and security middleware.
- [rust_smart_bulbs/lib.rs]: Device logic and FFI interface.
- [dashboard/Dashboard.jsx]: React UI, API usage patterns.
- [python_wrapper/device_contracts.py] and [rust_smart_bulbs/device_contracts.rs]: Device type/status contracts.
- [python_wrapper/mapping_api.py], [python_wrapper/mapping_engine.py]: Device/room mapping logic and enforcement.

---
**For AI agents:**
- Always update both Rust and Python contracts for new device types/statuses.
- Expose new device logic via FFI, then add/extend Python API, then update dashboard UI.
- Use modular routers for new API features.
- Reference main API file and dashboard entry for integration patterns.
- Enforce mapping/device limits based on user subscription and square footage.
- Document all FFI classes and REST endpoints for Python/JS consumers.

