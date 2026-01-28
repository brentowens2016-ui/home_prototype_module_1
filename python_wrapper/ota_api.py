import os
from fastapi import APIRouter, HTTPException, Request
from typing import Dict

OTA_DIR = os.path.join(os.path.dirname(__file__), "ota_updates")
if not os.path.exists(OTA_DIR):
    os.makedirs(OTA_DIR)

router = APIRouter()

@router.post("/ota/upload")
def upload_update(payload: Dict, request: Request):
    role = request.headers.get("X-Role", "guest")
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin only.")
    filename = payload.get("filename")
    content = payload.get("content")
    if not filename or not content:
        raise HTTPException(status_code=400, detail="Missing filename or content.")
    file_path = os.path.join(OTA_DIR, filename)
    with open(file_path, "wb") as f:
        f.write(content.encode())
    return {"status": "ok"}

@router.get("/ota/updates")
def list_updates(request: Request):
    role = request.headers.get("X-Role", "guest")
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin only.")
    return sorted([f for f in os.listdir(OTA_DIR) if os.path.isfile(os.path.join(OTA_DIR, f))])

@router.post("/ota/apply")
def apply_update(payload: Dict, request: Request):
    role = request.headers.get("X-Role", "guest")
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin only.")
    filename = payload.get("filename")
    file_path = os.path.join(OTA_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Update not found.")
    # For demo: just print, in production would apply firmware/software update
    print(f"Applying OTA update: {filename}")
    return {"status": "ok"}
