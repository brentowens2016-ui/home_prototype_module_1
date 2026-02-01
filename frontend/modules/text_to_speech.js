// Text-to-Speech: Multi-language, device-aware
export async function speakText(text, language = null, deviceId = null) {
    const res = await fetch('/accessibility/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language, device_id: deviceId })
    });
    const result = await res.json();
    return result;
}

// Example: Use discovered devices for output (to be expanded)
export function speakFromDevice(text, deviceId) {
    return speakText(text, null, deviceId);
}
