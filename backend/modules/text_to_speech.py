# AI-accessible TTS function
def ai_speak(text: str, language: Optional[str] = None, device_id: Optional[str] = None):
    # This function can be called by AI routines or agents
    return speak_from_device(text, device_id)
import pyttsx3
from langdetect import detect
from typing import Optional

# Initialize TTS engine
engine = pyttsx3.init()

# Multi-language support (basic)
def set_language(language_code: str):
    # pyttsx3 voices
    voices = engine.getProperty('voices')
    for voice in voices:
        if language_code in voice.languages or language_code in voice.id:
            engine.setProperty('voice', voice.id)
            return True
    return False

def speak_text(text: str, language: Optional[str] = None):
    # Detect language if not provided
    if not language:
        try:
            language = detect(text)
        except Exception:
            language = 'en'
    set_language(language)
    engine.say(text)
    engine.runAndWait()
    return {'status': 'ok', 'language': language}

# Device input simulation (to be replaced with real device integration)
def speak_from_device(text: str, device_id: Optional[str] = None):
    # In real use, select output device by device_id
    return speak_text(text)
