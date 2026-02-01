import ctypes

# Load the Rust agent shared library (update path as needed)
librust_agent = ctypes.CDLL('librust_agent.so')

# Example FFI function signatures (to be implemented in Rust):
# extern "C" fn get_home_assistant_devices_py() -> *const HomeAssistantDevice;
# extern "C" fn control_home_assistant_device_py(device_id: *const c_char, action: *const c_char) -> c_int;

def get_home_assistant_devices():
    # Simulate FFI call to Rust agent for testing
    # In real use: return librust_agent.get_home_assistant_devices_py()
    return [
        {"id": "ha-001", "name": "HA Light", "type": "light", "status": "on"},
        {"id": "ha-002", "name": "HA Thermostat", "type": "thermostat", "status": "off"}
    ]

def control_home_assistant_device(device_id, action):
    # Simulate FFI call to Rust agent for testing
    # In real use: return librust_agent.control_home_assistant_device_py(device_id, action)
    print(f"[Simulated] Control {device_id} with action {action}")
    return True
