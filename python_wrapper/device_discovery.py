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

Kasa IP Discovery:
- Scans local subnet for Kasa bulbs/switches using TCP port 9999 and Kasa handshake
"""
import struct
import socket
from Crypto.Cipher import AES
import json as pyjson
def kasa_encrypt(string):
    key = 171
    result = b''
    for c in string.encode():
        a = key ^ c
        key = a
        result += bytes([a])
    return result

def kasa_decrypt(data):
    key = 171
    result = b''
    for b in data:
        a = key ^ b
        key = b
        result += bytes([a])
    return result

def discover_kasa_devices(subnet_prefix="192.168.1.", start=1, end=254, timeout=0.3):
    """
    Scan the local subnet for Kasa bulbs/switches using TCP port 9999 and handshake
    """
    found = []
    cmd = '{"system":{"get_sysinfo":{}}}'
    enc_cmd = kasa_encrypt(cmd)
    for i in range(start, end+1):
        ip = f"{subnet_prefix}{i}"
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(timeout)
            sock.connect((ip, 9999))
            sock.send(enc_cmd)
            data = sock.recv(4096)
            sock.close()
            dec = kasa_decrypt(data)
            try:
                info = pyjson.loads(dec.decode())
                sysinfo = info.get("system", {}).get("get_sysinfo", {})
                if sysinfo:
                    sysinfo["ip"] = ip
                    found.append(sysinfo)
            except Exception:
                continue
        except Exception:
            continue
    return found

import socket
from typing import List, Dict

# Wi-Fi (mDNS/Bonjour) discovery
try:
    try:
        from zeroconf import Zeroconf, ServiceBrowser
        ZEROCONF_AVAILABLE = True
    except ImportError:
        ZEROCONF_AVAILABLE = False
    ZEROCONF_AVAILABLE = True
except ImportError:
    ZEROCONF_AVAILABLE = False


# Bluetooth (BLE) discovery using bleak
try:
    from bleak import BleakScanner
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
            self.devices.append({})

def discover_wifi_devices() -> List[Dict]:
    if not ZEROCONF_AVAILABLE:
        print("zeroconf not installed. Skipping Wi-Fi mDNS discovery.")
        return []
    from zeroconf import Zeroconf, ServiceBrowser
    zeroconf = Zeroconf()
    listener = DeviceListener()
    browser = ServiceBrowser(zeroconf, "_http._tcp.local.", listener)
    import time
    time.sleep(3)  # Wait for responses
    zeroconf.close()
    return listener.devices

import asyncio
def discover_bluetooth_devices() -> List[Dict]:
    if not BLUETOOTH_AVAILABLE:
        print("bleak not installed. Skipping Bluetooth discovery.")
        return []
    print("Scanning for Bluetooth (BLE) devices...")
    async def scan():
        devices = await BleakScanner.discover(timeout=8.0)
        filtered = [
            {"address": d.address, "name": d.name}
            for d in devices
            if any(hn in (d.name or "") for hn in HOME_ASSISTANT_BT_NAMES)
        ]
        return filtered
    return asyncio.run(scan())

def main():
    print("=== Device Discovery ===")
    wifi_devices = discover_wifi_devices()
    print(f"Discovered Wi-Fi devices: {wifi_devices}")
    bt_devices = discover_bluetooth_devices()
    print(f"Discovered Home Assistant-compliant Bluetooth devices: {bt_devices}")

    print("Scanning for Kasa devices via IP...")
    kasa_devices = discover_kasa_devices()
    print(f"Discovered Kasa devices: {kasa_devices}")

if __name__ == "__main__":
    main()
