"""
device_discovery.py: Auto-detect Wi-Fi and Bluetooth devices for onboarding

Features:
- Scan local Wi-Fi network for smart devices (mDNS, SSDP, ARP)
- Scan for Bluetooth devices (BLE and classic)
- Filter Bluetooth devices for Home Assistant-compliant types (Kasa, Zigbee, etc.)
- List discovered devices for user approval/onboarding

Dependencies:
- zeroconf (for mDNS/Bonjour)
- pybluez or bleak (for Bluetooth)
- scapy (for ARP scanning, optional)

Usage:
- Run this script to discover devices and print results
"""

import socket
from typing import List, Dict

# Wi-Fi (mDNS/Bonjour) discovery
try:
    from zeroconf import Zeroconf, ServiceBrowser
    ZEROCONF_AVAILABLE = True
except ImportError:
    ZEROCONF_AVAILABLE = False

# Bluetooth discovery
try:
    import bluetooth  # PyBluez
    BLUETOOTH_AVAILABLE = True
except ImportError:
    BLUETOOTH_AVAILABLE = False

# Home Assistant-compliant device filters (expand as needed)
HOME_ASSISTANT_BT_NAMES = [
    "Kasa", "Zigbee", "Philips Hue", "IKEA", "Sonoff", "Shelly", "Tuya"
]

class DeviceListener:
    def __init__(self):
        self.devices = []
    def add_service(self, zeroconf, type, name):
        info = zeroconf.get_service_info(type, name)
        if info:
            self.devices.append({

    if not ZEROCONF_AVAILABLE:
        print("zeroconf not installed. Skipping Wi-Fi mDNS discovery.")
        return []
    zeroconf = Zeroconf()
    listener = DeviceListener()
    browser = ServiceBrowser(zeroconf, "_http._tcp.local.", listener)
    import time
    time.sleep(3)  # Wait for responses
    zeroconf.close()
    return listener.devices

def discover_bluetooth_devices() -> List[Dict]:
    if not BLUETOOTH_AVAILABLE:
        print("PyBluez not installed. Skipping Bluetooth discovery.")
        return []
    print("Scanning for Bluetooth devices...")
    found = bluetooth.discover_devices(duration=8, lookup_names=True)
    filtered = [
        {"address": addr, "name": name}
        for addr, name in found
        if any(hn in (name or "") for hn in HOME_ASSISTANT_BT_NAMES)
    ]
    return filtered

def main():
    print("=== Device Discovery ===")
    wifi_devices = discover_wifi_devices()
    print(f"Discovered Wi-Fi devices: {wifi_devices}")
    bt_devices = discover_bluetooth_devices()
    print(f"Discovered Home Assistant-compliant Bluetooth devices: {bt_devices}")

if __name__ == "__main__":
    main()
