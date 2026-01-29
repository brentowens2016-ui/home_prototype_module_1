



# Copilot Instructions: Home Prototype Module 1

## Architecture Overview

**Three main components:**

**Data flow:**
1. Rust implements device logic, exposed to Python via FFI (PyO3/maturin).
2. Python FastAPI ([api.py](../python_wrapper/api.py)) exposes device controls as REST endpoints.
3. React dashboard interacts with REST API for UI control and device mapping.

## Developer Workflows

**Rust:**

**Python:**

**Dashboard:**

## Project-Specific Patterns & Conventions

  1. Update `DeviceType` in both contracts.
  2. Implement device logic in Rust ([src/main.rs](../rust_smart_bulbs/src/main.rs)).
  3. Expose via FFI in [lib.rs](../rust_smart_bulbs/lib.rs) if needed.
  4. Add/extend API endpoint in [api.py](../python_wrapper/api.py).
  5. Update dashboard UI as needed.

## Integration, Build, & Testing


## Key References

