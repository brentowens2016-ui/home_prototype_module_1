
# Home Prototype Module 1

This project is a modular, multi-language smart home system. Python orchestrates, Rust implements device logic, and a React dashboard provides the UI. The architecture is designed for extensibility, clear device classification, and robust Python-Rust interop.

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

- **Rust (`rust_smart_bulbs/`)**: Implements device logic (see [src/main.rs](rust_smart_bulbs/src/main.rs)), device contracts ([src/device_contracts.rs](rust_smart_bulbs/src/device_contracts.rs)), and FFI bindings ([src/lib.rs](rust_smart_bulbs/src/lib.rs)). Exposed to Python via PyO3/maturin.
- **Python (`python_wrapper/`)**: Orchestrates devices, exposes REST API ([api.py](python_wrapper/api.py)), and defines contracts ([device_contracts.py](python_wrapper/device_contracts.py)). Imports Rust logic via FFI ([lib.py](python_wrapper/lib.py)).
- **Dashboard (`dashboard/`)**: React UI ([Dashboard.jsx](dashboard/Dashboard.jsx)) consumes the REST API for device control and monitoring.

---

## 🔗 Interop Contracts

- All device modules must conform to the contracts in both [python_wrapper/device_contracts.py](python_wrapper/device_contracts.py) and [rust_smart_bulbs/device_contracts.rs](rust_smart_bulbs/src/device_contracts.rs).
- Device types and statuses are enumerated for clarity and expansion.
- When adding new device types, update both contracts and implement logic in both Rust and Python.

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

---

## 🗂️ References & Further Reading

- [README_integration.md](README_integration.md): Multi-language integration details
- [INTEGRATION_STATUS.md](INTEGRATION_STATUS.md): FFI/API integration status
- [python_wrapper/api_design.md](python_wrapper/api_design.md): REST API schema
- [python_wrapper/device_contracts.py](python_wrapper/device_contracts.py), [rust_smart_bulbs/device_contracts.rs](rust_smart_bulbs/src/device_contracts.rs): Device contracts

---

## 📝 Notes

- Use Alexa-style device names for consistency (e.g., "Living Room 1").
- All endpoints return JSON. Document new endpoints in [api_design.md](python_wrapper/api_design.md).
- Each major component has a Dockerfile for containerization.
- Rust logic is exposed to Python via PyO3. Build Rust as a Python extension for full integration.
- No formal test suite yet; run each component standalone to verify integration.
