"""
audio_io.py: Modular audio input/output interface for AI interactions
- MVP: Uses system default audio devices
- Future: Supports multiple devices, discovery, and room mapping
"""

import sounddevice as sd
import numpy as np
from typing import List, Optional

class AudioDeviceInfo:
    def __init__(self, name: str, index: int, max_input_channels: int, max_output_channels: int):
        self.name = name
        self.index = index
        self.max_input_channels = max_input_channels
        self.max_output_channels = max_output_channels

    def __repr__(self):
        return f"<AudioDeviceInfo name={self.name} index={self.index} in={self.max_input_channels} out={self.max_output_channels}>"

class AudioIO:
    def __init__(self, input_device: Optional[int] = None, output_device: Optional[int] = None, samplerate: int = 16000, room: Optional[str] = None, endpoint_id: Optional[str] = None):
        self.input_device = input_device
        self.output_device = output_device
        self.samplerate = samplerate
        self.room = room  # Room name or zone
        self.endpoint_id = endpoint_id  # Device mapping ID (e.g., hdmi_hub_tv_livingroom)

    @staticmethod
    def list_devices() -> List[AudioDeviceInfo]:
        """Discover all available audio devices."""
        devices = sd.query_devices()
        return [
            AudioDeviceInfo(
                name=dev['name'],
                index=i,
                max_input_channels=dev['max_input_channels'],
                max_output_channels=dev['max_output_channels']
            )
            for i, dev in enumerate(devices)
        ]

    @staticmethod
    def map_device_to_room(device_index: int, room: str, endpoint_id: Optional[str] = None):
        """Associate an audio device with a room/zone and optional endpoint ID."""
        # This could be expanded to persist mappings in device_mapping.json
        return AudioIO(input_device=device_index, room=room, endpoint_id=endpoint_id)

    def record(self, duration: float = 3.0, channels: int = 1) -> np.ndarray:
        """Record audio from the selected input device."""
        return sd.rec(int(duration * self.samplerate), samplerate=self.samplerate, channels=channels, dtype='float32', device=self.input_device)

    def play(self, data: np.ndarray, channels: int = 1):
        """Play audio to the selected output device."""
        sd.play(data, samplerate=self.samplerate, device=self.output_device)
        sd.wait()

    def set_input_device(self, device_index: int):
        self.input_device = device_index

    def set_output_device(self, device_index: int):
        self.output_device = device_index

# Example usage (for testing):
if __name__ == "__main__":
    print("Available audio devices:")
    for dev in AudioIO.list_devices():
        print(dev)
    # Example: Map device 0 to Living Room TV HDMI hub
    livingroom_audio = AudioIO.map_device_to_room(0, "Living Room", endpoint_id="hdmi_hub_tv_livingroom")
    print(f"Mapped device to room: {livingroom_audio}")
    audio = AudioIO()
    print("Recording 2 seconds of audio...")
    data = audio.record(duration=2)
    sd.wait()
    print("Playing back...")
    audio.play(data)
