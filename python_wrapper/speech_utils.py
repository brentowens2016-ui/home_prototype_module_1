"""
speech_utils.py: Utilities for speech-to-text (STT) and text-to-speech (TTS)
- Uses speech_recognition for STT
- Uses pyttsx3 for TTS (offline, cross-platform)
"""

import speech_recognition as sr
import pyttsx3
import tempfile
import os

recognizer = sr.Recognizer()
tts_engine = pyttsx3.init()

def transcribe_audio_file(file_path: str) -> str:
    with sr.AudioFile(file_path) as source:
        audio = recognizer.record(source)
    try:
        return recognizer.recognize_google(audio)
    except Exception as e:
        return f"[STT error: {e}]"

def text_to_speech(text: str) -> str:
    fd, path = tempfile.mkstemp(suffix='.wav')
    os.close(fd)
    tts_engine.save_to_file(text, path)
    tts_engine.runAndWait()
    return path
