import os
import shutil
import zipfile
from fastapi import APIRouter, HTTPException, Request
from datetime import datetime

BACKUP_DIR = os.path.join(os.path.dirname(__file__), "backups")
DATA_FILES = [
    "users.json",
    "device_mapping.json",
    "emergency_contacts.json",
    "support_tickets.json",
    "scenarios.json",
    "credentials.enc"
]
router = APIRouter()

if not os.path.exists(BACKUP_DIR):
    os.makedirs(BACKUP_DIR)

def get_data_file_paths():
    base = os.path.dirname(__file__)
    return [os.path.join(base, f) for f in DATA_FILES if os.path.exists(os.path.join(base, f))]

@router.post("/backup")
def create_backup(request: Request):
    role = request.headers.get("X-Role", "guest")
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin only.")
    ts = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    backup_name = f"backup_{ts}.zip"
    backup_path = os.path.join(BACKUP_DIR, backup_name)
    with zipfile.ZipFile(backup_path, 'w') as zf:
        for f in get_data_file_paths():
            zf.write(f, os.path.basename(f))
    return {"status": "ok", "backup": backup_name}

@router.get("/backups")
def list_backups(request: Request):
    role = request.headers.get("X-Role", "guest")
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin only.")
    return sorted([f for f in os.listdir(BACKUP_DIR) if f.endswith('.zip')])

@router.post("/restore")
def restore_backup(payload: dict, request: Request):
    role = request.headers.get("X-Role", "guest")
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin only.")
    backup_name = payload.get("backup")
    if not backup_name or not backup_name.endswith('.zip'):
        raise HTTPException(status_code=400, detail="Invalid backup name.")
    backup_path = os.path.join(BACKUP_DIR, backup_name)
    if not os.path.exists(backup_path):
        raise HTTPException(status_code=404, detail="Backup not found.")
    with zipfile.ZipFile(backup_path, 'r') as zf:
        zf.extractall(os.path.dirname(__file__))
    return {"status": "ok"}
