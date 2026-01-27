# Home Prototype Module 1

This project is a modular, Python-wrapped smart home system with Rust-powered device logic. It is designed for extensibility, clear device classification, and robust Python-Rust interop.

## Structure
- `rust_smart_bulbs/`: Rust code for smart bulbs and device logic
- `python_wrapper/`: Python code for orchestration, contracts, and future device modules

## Interop Contracts
- All device modules must conform to the contracts in `python_wrapper/device_contracts.py` for naming, types, and status.
- Device types and statuses are enumerated for clarity and expansion.

## Adding Devices
- Add new device types to the `DeviceType` enum and implement corresponding Rust and Python logic.
- Use Alexa-style naming for consistency.

## Expansion
- Designed for easy addition of new modules and device types as hardware becomes available.
