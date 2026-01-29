"""
ai_voice_api.py: FastAPI endpoints for AI voice interactivity and response
- Handles voice session management, STT, TTS, and AI relay
- Respects room/device mapping for input/output
"""


from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional
import tempfile
import shutil
import os
from python_wrapper.speech_utils import transcribe_audio_file, text_to_speech

router = APIRouter()

# Placeholder for session state (room -> session info)
VOICE_SESSIONS = {}

class StartSessionRequest(BaseModel):
    room: str
    device_id: Optional[str] = None

@router.post("/ai_voice/start_session")
def start_voice_session(req: StartSessionRequest):
    # In a real implementation, allocate resources, mark session active
    VOICE_SESSIONS[req.room] = {"active": True, "device_id": req.device_id}
    return {"status": "ok", "room": req.room}

@router.post("/ai_voice/stop_session")
def stop_voice_session(room: str = Form(...)):
    if room in VOICE_SESSIONS:
        VOICE_SESSIONS.pop(room)
        return {"status": "ok", "room": room}
    raise HTTPException(status_code=404, detail="Session not found")

@router.post("/ai_voice/speech_to_text")
async def speech_to_text(room: str = Form(...), file: UploadFile = File(...)):
    # Save uploaded file to temp location
    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name
    transcript = transcribe_audio_file(tmp_path)
    os.remove(tmp_path)
    return {"room": room, "transcript": transcript}

class AIQueryRequest(BaseModel):
    room: str
    text: str

@router.post("/ai_voice/ai_query")
def ai_query(req: AIQueryRequest):
    # Placeholder: Integrate with AI backend here
    ai_response = f"AI response to: {req.text}"
    return {"room": req.room, "response": ai_response}

class TTSRequest(BaseModel):
    room: str
    text: str

@router.post("/ai_voice/text_to_speech")
def tts_endpoint(req: TTSRequest):
    # Generate TTS audio file and return path
    audio_path = text_to_speech(req.text)
    # Optionally, return audio as bytes or a downloadable file
    with open(audio_path, 'rb') as f:
        audio_bytes = f.read()
    os.remove(audio_path)
    return {"room": req.room, "audio_wav": audio_bytes.hex()}  # Return as hex string for transport
