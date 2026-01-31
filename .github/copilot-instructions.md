

# Copilot Instructions: Home Prototype Module 1

## Architecture & Data Flow

- **Rust device logic** ([rust_smart_bulbs/lib.rs], [rust_smart_bulbs/device_contracts.rs]): Implements core device types/logic. Exposed to Python via PyO3/maturin as `PySmartBulb` and related classes.
- **Python orchestration/API** ([python_wrapper/api.py]): FastAPI REST API for device control, automation, and integrations. Integrates Rust FFI, device mapping, modular routers, and predictive AI.
- **React dashboard** ([dashboard/Dashboard.jsx]): UI for device control, mapping, monitoring. Consumes REST API.

**Data flow:**
1. Rust logic is exposed to Python via FFI wrappers ([python_wrapper/lib.py]).
2. Python FastAPI exposes device/automation controls as REST endpoints.
3. React dashboard interacts with these endpoints for all device, mapping, and automation features.

## Developer Workflows

**Rust:**
- Edit device logic in [rust_smart_bulbs/lib.rs] and [rust_smart_bulbs/device_contracts.rs].
- Build with `cargo build` or VS Code task "Cargo Build (Rust)".
- Expose new device logic to Python by updating PyO3 classes and FFI interface.

**Python:**
- Main API: [python_wrapper/api.py].
- Add/extend endpoints for device types, automations, or integrations here.
- Use [python_wrapper/lib.py] for FFI bindings to Rust.
- Features are modularized as routers (see `include_router` in `api.py`).
- Run API server: `uvicorn python_wrapper.api:app --reload` or VS Code task "Run FastAPI server (AI Voice Build)".
- Predictive AI: Use [python_wrapper/predictive_ai.py], [python_wrapper/scenario_input.py], [python_wrapper/event_chain_manager.py] for event-driven automation, diagnostics, and onboarding suggestions.

**Dashboard (React):**
- UI code in [dashboard/], entry: [Dashboard.jsx].
- Interacts with REST API for all device and mapping actions.
- Use `npm install` and `npm run dev` for local development.

## Project-Specific Patterns & Conventions

1. **DeviceType contract:** Update both [rust_smart_bulbs/device_contracts.rs] and [python_wrapper/device_contracts.py] when adding new device types/statuses. Keep mapping tables in sync.
2. **Device logic:** Implement in Rust, expose via FFI, add Python API endpoint, then update dashboard UI.
3. **Mapping:** Device/room mapping logic in [python_wrapper/mapping_api.py] and [python_wrapper/mapping_engine.py]. Enforce device/tier limits based on user subscription and square footage.
4. **Modular API:** New features are added as routers (see `include_router` in [api.py]).
5. **Data storage:** Sensitive user/device data is encrypted at rest using [python_wrapper/secure_storage.py] (AES-256-GCM, key from `SECURE_STORAGE_KEY`). Never commit plaintext sensitive files.
6. **Security/Privacy:** API includes IP enforcement, double encryption middleware, and rate limiting (see [api.py]).
7. **Event-driven automation:** Bulb color and automation endpoints are event-driven (see `/bulbs/{name}/event-color` and `/predictive/` endpoints in [api.py]).
8. **Backup/restore:** Only backup/restore endpoints can access user data on server; all other data is local or user-owned cloud storage.
9. **Predictive AI:** Add new event/scenario types in [python_wrapper/event_template.json]. Use scenario input and chain manager tools for training/testing ([python_wrapper/scenario_input.py], [python_wrapper/event_chain_manager.py]).
10. **Contract enforcement:** All device modules must conform to contracts in both Python and Rust. See [README_integration.md] and [INTEGRATION_STATUS.md].

## Integration, Build, & Testing

- **Build Rust:** VS Code task "Cargo Build (Rust)" or `cargo build`.
- **Run API:** VS Code task "Run FastAPI server (AI Voice Build)" or `uvicorn python_wrapper.api:app --reload`.
- **Dashboard:** Standard React workflow (`npm install`, `npm run dev`).
- **Testing:** No formal test suite; test via API endpoints and dashboard UI.
- **Setup:** Use `setup_all.bat` (Windows) or `setup_all.sh` (Unix) for one-command install. Use `post_install_check.bat`/`.sh` to verify dependencies.

## Key References

- [python_wrapper/api.py]: Main API surface, integration patterns, and security middleware.
- [rust_smart_bulbs/lib.rs]: Device logic and FFI interface.
- [dashboard/Dashboard.jsx]: React UI, API usage patterns.
- [python_wrapper/device_contracts.py], [rust_smart_bulbs/device_contracts.rs]: Device type/status contracts.
- [python_wrapper/mapping_api.py], [python_wrapper/mapping_engine.py]: Device/room mapping logic and enforcement.
- [python_wrapper/secure_storage.py]: Encrypted file storage.
- [python_wrapper/predictive_ai.py], [python_wrapper/scenario_input.py], [python_wrapper/event_chain_manager.py]: Predictive AI and event-driven automation.
- [python_wrapper/event_template.json]: Event/scenario input template for AI.
- [README_integration.md], [INTEGRATION_STATUS.md]: Multi-language contract and integration status.

---
**For AI agents:**
- Always update both Rust and Python contracts for new device types/statuses.
- Expose new device logic via FFI, then add/extend Python API, then update dashboard UI.
- Use modular routers for new API features.
- Reference main API file and dashboard entry for integration patterns.
- Enforce mapping/device limits based on user subscription and square footage.
- Document all FFI classes and REST endpoints for Python/JS consumers.
- Never commit plaintext sensitive files; use [python_wrapper/secure_storage.py] for all encrypted data.

