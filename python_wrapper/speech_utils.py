"""
speech_utils.py: Utilities for text-to-speech (TTS)
- Uses pyttsx3 for TTS (offline, cross-platform)
"""

import pyttsx3
import tempfile
import os
 
tts_engine = pyttsx3.init()
# STT functionality disabled: speech_recognition not available
def transcribe_audio_file(file_path: str) -> str:
    return "[STT unavailable: speech_recognition not installed]"

def text_to_speech(text: str) -> str:
    fd, path = tempfile.mkstemp(suffix='.wav')
    os.close(fd)
    tts_engine.save_to_file(text, path)
    tts_engine.runAndWait()
    return path
