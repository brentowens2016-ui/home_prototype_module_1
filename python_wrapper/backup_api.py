"""
Backup API: scheduled backups and admin restore endpoints
"""
import os
import json
import time
import shutil
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

BACKUP_DIR = os.path.join(os.path.dirname(__file__), "backups")
CRITICAL_FILES = [
    "users.json", "device_mapping.json", "device_alerts.json", "device_health.json",
    "event_history.json", "admin_audit_log.json", "email_log.json"
]

router = APIRouter()

def ensure_backup_dir():
    if not os.path.exists(BACKUP_DIR):
        os.makedirs(BACKUP_DIR)

def backup_all():
    ensure_backup_dir()
    ts = int(time.time())
    backup_files = []
    for fname in CRITICAL_FILES:
        src = os.path.join(os.path.dirname(__file__), fname)
        if os.path.exists(src):
            dst = os.path.join(BACKUP_DIR, f"{fname}.{ts}.bak")
            shutil.copy2(src, dst)
            backup_files.append(dst)
    return backup_files

def list_backups():
    ensure_backup_dir()
    files = os.listdir(BACKUP_DIR)
    return sorted(files)

def restore_backup(filename):
    ensure_backup_dir()
    src = os.path.join(BACKUP_DIR, filename)
    if not os.path.exists(src):
        return False
    # Determine original file
    orig = filename.split(".")[0] + ".json"
    dst = os.path.join(os.path.dirname(__file__), orig)
    shutil.copy2(src, dst)
    return True

# Endpoint: trigger backup (admin)
@router.post("/backup/run")
def run_backup():
    files = backup_all()
    return {"status": "ok", "files": files}

# Endpoint: list backups
@router.get("/backup/list")
def get_backup_list():
    return list_backups()

# Endpoint: restore backup (admin)
@router.post("/backup/restore")
async def restore(request: Request):
    data = await request.json()
    filename = data.get("filename")
    if not filename:
        return JSONResponse(status_code=400, content={"error": "Missing filename"})
    ok = restore_backup(filename)
    if ok:
        return {"status": "restored", "file": filename}
    else:
        return JSONResponse(status_code=404, content={"error": "Backup not found"})
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
