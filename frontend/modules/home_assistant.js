// Home Assistant Integration Module (Frontend)
// UI logic for discovering and controlling Home Assistant-compatible devices


export async function discoverHomeAssistantDevices() {
  const res = await fetch('/home-assistant/devices');
  return await res.json();
}

export async function controlHomeAssistantDevice(deviceId, action) {
  const res = await fetch('/home-assistant/control', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ device_id: deviceId, action })
  });
  return await res.text();
}
