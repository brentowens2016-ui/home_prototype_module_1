import os
from fastapi import APIRouter, HTTPException, Request
from typing import Dict

try:
    import pyttsx3
    TTS_AVAILABLE = True
except ImportError:
    TTS_AVAILABLE = False

router = APIRouter()

@router.post("/speak")
def speak(payload: Dict, request: Request):
    role = request.headers.get("X-Role", "guest")
    if role not in ("admin", "user"):
        raise HTTPException(status_code=403, detail="Not authorized.")
    message = payload.get("message", "")
    if not message:
        raise HTTPException(status_code=400, detail="No message provided.")
    if not TTS_AVAILABLE:
        raise HTTPException(status_code=500, detail="pyttsx3 not installed on server.")
    try:
        engine = pyttsx3.init()
        engine.say(message)
        engine.runAndWait()
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS failed: {e}")
