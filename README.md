

# Home Prototype Module 1

This project is a modular, multi-language smart home system. Python orchestrates, Rust implements device logic, and a React dashboard provides the UI. The architecture is designed for extensibility, clear device classification, robust Python-Rust interop, and now includes a predictive AI module for automation, diagnostics, and onboarding suggestions.

---

## 📚 Learning References

**Rust:**
- The Rust Programming Language ("The Rust Book")
	- Chapter 5: Structs (see device logic, SmartBulb)
	- Chapter 6: Enums and Pattern Matching (see device_contracts.rs)
	- Chapter 7: Managing Growing Projects with Packages, Crates, and Modules (see mod usage)
	- Chapter 5.3: Method Syntax (see impl blocks)
	- Chapter 19.1: Unsafe Rust (for FFI basics)
	- Chapter 9: Error Handling (for Result/Option usage)
	- Chapter 11: Writing Automated Tests (for future test expansion)
- PyO3 documentation: https://pyo3.rs/

**Python:**
- Python for Dummies
	- Chapter 10: Creating and Using Classes (see device_contracts.py, BulbState)
	- Chapter 11: Working with Classes and Objects (see device_contracts.py usage)
	- Chapter 12: Organizing Code with Modules and Packages (see python_wrapper/ structure)
	- Chapter 16: Web Programming Basics (see FastAPI usage)
	- Chapter 13: Using Python’s Built-In Functions (see type hints)
	- Chapter 18: Extending Python with C (conceptually similar for FFI)
- FastAPI documentation: https://fastapi.tiangolo.com/
- Pydantic documentation: https://docs.pydantic.dev/

**JavaScript/React:**
- React documentation: https://react.dev/
- Vite documentation: https://vitejs.dev/

---

## 🏗️ Architecture Overview


- **Rust (`rust_smart_bulbs/`)**: Implements device logic ([src/main.rs](rust_smart_bulbs/src/main.rs)), device contracts ([src/device_contracts.rs](rust_smart_bulbs/src/device_contracts.rs)), and FFI bindings ([src/lib.rs](rust_smart_bulbs/src/lib.rs)). Exposed to Python via PyO3/maturin.
- **Python (`python_wrapper/`)**: Orchestrates devices, exposes REST API ([api.py](python_wrapper/api.py)), defines contracts ([device_contracts.py](python_wrapper/device_contracts.py)), and now includes:
	- Predictive AI module ([predictive_ai.py](python_wrapper/predictive_ai.py)): Event collection, diagnostics, scenario management, prediction, onboarding suggestions.
	- Scenario/event input tool ([scenario_input.py](python_wrapper/scenario_input.py)): Interactive scenario/event entry, diagnostics, prediction.
	- Event chain manager ([event_chain_manager.py](python_wrapper/event_chain_manager.py)): Serial event chain creation and management for AI training.
- **Dashboard (`dashboard/`)**: React UI ([Dashboard.jsx](dashboard/Dashboard.jsx)) consumes the REST API for device control and monitoring.

---

## 🔗 Interop Contracts


- All device modules must conform to the contracts in both [python_wrapper/device_contracts.py](python_wrapper/device_contracts.py) and [rust_smart_bulbs/device_contracts.rs](rust_smart_bulbs/src/device_contracts.rs).
- Device types and statuses are enumerated for clarity and expansion. **Contracts must be kept in sync across Python and Rust.**
- When adding new device types, update both contracts and implement logic in both Rust and Python.
- **Contract compliance:** All new features (AI, scenario tools, onboarding suggestions) are documented and annotated for FFI/API consumers. See [README_integration.md](README_integration.md) and [INTEGRATION_STATUS.md](INTEGRATION_STATUS.md).

---

## 🚦 Developer Workflows

**Rust:**
- Build: `cargo build` in `rust_smart_bulbs/`
- Run: `cargo run` in `rust_smart_bulbs/`
- Build Python extension: `maturin develop --release` in `rust_smart_bulbs/`
- Add/modify device logic in [src/main.rs](rust_smart_bulbs/src/main.rs), export via [src/lib.rs](rust_smart_bulbs/src/lib.rs) for FFI.

**Python:**
- Run API: `uvicorn python_wrapper.api:app --reload` from project root or `python_wrapper/`
- Extend API endpoints in [api.py](python_wrapper/api.py) to match new device logic.
- Use `PySmartBulb` from Rust if built (see [lib.py](python_wrapper/lib.py)).
- **Predictive AI workflows:**
	- Run scenario/event input: `python python_wrapper/scenario_input.py` (interactive event/scenario entry, diagnostics, prediction)
	- Run event chain manager: `python python_wrapper/event_chain_manager.py` (create/manage event chains for AI training)
	- Use [predictive_ai.py](python_wrapper/predictive_ai.py) for event handling, scenario management, prediction, onboarding suggestions.

**Python:**
- Run API: `uvicorn python_wrapper.api:app --reload` from project root or `python_wrapper/`
- Extend API endpoints in [api.py](python_wrapper/api.py) to match new device logic.
- Use `PySmartBulb` from Rust if built (see [lib.py](python_wrapper/lib.py)).

**Dashboard:**
- Dev server: `npm run dev` in `dashboard/`
- Add UI for new device types in [Dashboard.jsx](dashboard/Dashboard.jsx).

---

## 🧩 Adding Devices & Expansion

1. Update `DeviceType` in both [device_contracts.py](python_wrapper/device_contracts.py) and [device_contracts.rs](rust_smart_bulbs/src/device_contracts.rs).
2. Implement device logic in Rust ([src/main.rs](rust_smart_bulbs/src/main.rs)).
3. Expose via FFI in [src/lib.rs](rust_smart_bulbs/src/lib.rs) if needed.
4. Add/extend API endpoint in [api.py](python_wrapper/api.py).
5. Update dashboard UI as needed.

6. For predictive AI features:
	- Add new event/scenario types in [event_template.json](python_wrapper/event_template.json).
	- Use scenario/event input and chain manager tools for training/testing.
	- Document onboarding suggestions and prediction logic in [predictive_ai.py](python_wrapper/predictive_ai.py).

**Data Storage Policy:**
User data is stored locally or in user-owned cloud storage. Server-side data is only accessible for backup/restore operations, not for direct access or browsing. This is enforced to maintain security and privacy.

**Contract Enforcement:**
All device modules must conform to contracts in both Python and Rust. Contracts are kept in sync and enforced for all device logic and API endpoints.

----

## 🗂️ References & Further Reading

- [README_integration.md](README_integration.md): Multi-language integration details
- [INTEGRATION_STATUS.md](INTEGRATION_STATUS.md): FFI/API integration status
- [python_wrapper/api_design.md](python_wrapper/api_design.md): REST API schema
- [python_wrapper/device_contracts.py](python_wrapper/device_contracts.py), [rust_smart_bulbs/device_contracts.rs](rust_smart_bulbs/src/device_contracts.rs): Device contracts

- [python_wrapper/predictive_ai.py](python_wrapper/predictive_ai.py): Predictive AI module (event handling, diagnostics, scenario management, prediction, onboarding suggestions)
- [python_wrapper/scenario_input.py](python_wrapper/scenario_input.py): Interactive scenario/event input tool
- [python_wrapper/event_chain_manager.py](python_wrapper/event_chain_manager.py): Event chain manager for AI training
- [python_wrapper/event_template.json](python_wrapper/event_template.json): Context-rich event/scenario template

---

## 📝 Notes

- Use Alexa-style device names for consistency (e.g., "Living Room 1").
- All endpoints return JSON. Document new endpoints in [api_design.md](python_wrapper/api_design.md).
- Each major component has a Dockerfile for containerization.
- Rust logic is exposed to Python via PyO3. Build Rust as a Python extension for full integration.
- No formal test suite yet; run each component standalone to verify integration.

- **Predictive AI module:**
	- Collects and logs events (simulated or real)
	- Provides diagnostics and instructor feedback
	- Supports scenario/event input and chain management
	- Predicts next likely event and suggests onboarding (normal state, chain placement)
	- All features are annotated and contract-compliant

- **Contract compliance:**
	- Device contracts ([device_contracts.py](python_wrapper/device_contracts.py), [device_contracts.rs](rust_smart_bulbs/src/device_contracts.rs)) are always kept in sync
	- All new device types/statuses and AI features are documented for FFI/API consumers
	- See [README_integration.md](README_integration.md) and [INTEGRATION_STATUS.md](INTEGRATION_STATUS.md) for compliance steps
