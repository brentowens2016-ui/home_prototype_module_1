"""
voice_text_input.py: Voice and text command input for Predictive AI Module

Features:
- Accepts text commands via console input
- Accepts voice commands via microphone (if available)
- Converts recognized phrases to AI events
- Maps phrases to device actions or scenario triggers
- Provides feedback and diagnostics from AI module

Dependencies:
- SpeechRecognition (for voice input)
- PyAudio (for microphone access)
- predictive_ai.py (AI logic)

Usage:
- Run this script in python_wrapper/: python voice_text_input.py
"""

import os
import sys
import time
from predictive_ai import ai_module

# Try to import voice libraries
try:
    import speech_recognition as sr
    VOICE_AVAILABLE = True
except ImportError:
    VOICE_AVAILABLE = False
    print("SpeechRecognition not installed. Voice input will be disabled.")

# Phrase-to-action mapping (expand as needed)
PHRASE_MAP = {
    "turn on the living room light": {"event_type": "device_control", "device": "Living Room 1", "action": "on"},
    "turn off the living room light": {"event_type": "device_control", "device": "Living Room 1", "action": "off"},
    "set bedroom light to 50 percent": {"event_type": "device_control", "device": "Master Bedroom", "action": "set_brightness", "value": 50},
    # Add more mappings here
}


def handle_phrase(phrase):
    phrase = phrase.lower().strip()
    event = PHRASE_MAP.get(phrase)
    if event:
        ai_module.handle_event({"event_type": "voice_text_command", "phrase": phrase, **event, "timestamp": int(time.time())})
        print(f"Mapped and sent event: {event}")
    else:
        ai_module.handle_event({"event_type": "voice_text_command", "phrase": phrase, "timestamp": int(time.time())})
        print(f"Unmapped phrase sent to AI: '{phrase}'")
    print("AI Diagnostics:")
    for diag in ai_module.get_diagnostics():
        print(f"- {diag}")

def teach_phrase():
    print("=== Teach AI a New Phrase ===")
    phrase = input("Enter the phrase you want to teach: ").strip().lower()
    print("Specify the action type (e.g., device_control): ")
    event_type = input("Event type: ").strip()
    print("Specify the device name (or leave blank): ")
    device = input("Device: ").strip()
    print("Specify the action (e.g., on, off, set_brightness): ")
    action = input("Action: ").strip()
    value = input("Value (optional, e.g., brightness %): ").strip()
    event = {"event_type": event_type}
    if device:
        event["device"] = device
    if action:
        event["action"] = action
    if value:
        try:
            event["value"] = int(value)
        except ValueError:
            event["value"] = value
    PHRASE_MAP[phrase] = event
    print(f"Learned mapping: '{phrase}' -> {event}")

def text_input_loop():
    print("=== Text Command Input ===")
    while True:
        phrase = input("Enter command (or 'exit'): ").strip()
        if phrase.lower() == "exit":
            break
        handle_phrase(phrase)

def voice_input_loop():
    print("=== Voice Command Input ===")
    recognizer = sr.Recognizer()
    mic = None
    # Search for available microphones
    try:
        mics = sr.Microphone.list_microphone_names()
        print("Available microphones:")
        for idx, name in enumerate(mics):
            print(f"  [{idx}] {name}")
        mic_idx = int(input("Select microphone index (or blank for default): ").strip() or "0")
        mic = sr.Microphone(device_index=mic_idx)
    except Exception as e:
        print(f"Microphone search failed: {e}")
        return
    print("Speak your command. Say 'exit' to quit.")
    while True:
        with mic as source:
            print("Listening...")
            audio = recognizer.listen(source)
        try:
            phrase = recognizer.recognize_google(audio)
            print(f"You said: {phrase}")
            if phrase.lower() == "exit":
                break
            handle_phrase(phrase)
        except sr.UnknownValueError:
            print("Could not understand audio.")
        except sr.RequestError as e:
            print(f"Speech recognition error: {e}")


def main():
    print("=== Voice/Text Command Input for AI Module ===")
    print("Options:")
    print("1. Text command input")
    if VOICE_AVAILABLE:
        print("2. Voice command input")
    print("3. Teach AI a new phrase")
    print("0. Exit")
    while True:
        choice = input("Select option: ").strip()
        if choice == "1":
            text_input_loop()
        elif choice == "2" and VOICE_AVAILABLE:
            voice_input_loop()
        elif choice == "3":
            teach_phrase()
        elif choice == "0":
            print("Exiting.")
            break
        else:
            print("Invalid option. Try again.")

if __name__ == "__main__":
    main()
