from fastapi import APIRouter
router = APIRouter()
# Endpoint: Get storage usage for user quota indicator
@router.get("/backup/usage")
def get_backup_usage():
    size = get_backup_dir_size()
    return {"usage": size}
"""
Backup API: scheduled backups and admin restore endpoints
"""
import os
import json
import time
import shutil
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
import importlib


# Local backup directory
BACKUP_DIR = os.path.join(os.path.dirname(__file__), "backups")
CRITICAL_FILES = [
    "users.json", "device_mapping.json", "device_alerts.json", "device_health.json",
    "event_history.json", "admin_audit_log.json", "email_log.json"
]

# Supported cloud providers (expand as needed)
CLOUD_PROVIDERS = ["aws", "gdrive", "azure"]

def get_user_cloud_config(request: Request):
    # Example: expects cloud config in request headers or user profile
    # In production, fetch from user DB/profile
    cloud_type = request.headers.get("X-Cloud-Type")
    cloud_token = request.headers.get("X-Cloud-Token")
    cloud_bucket = request.headers.get("X-Cloud-Bucket")
    if cloud_type and cloud_token and cloud_bucket:
        return {"type": cloud_type, "token": cloud_token, "bucket": cloud_bucket}
    return None

def upload_to_cloud(files, cloud_config):
    # Dynamically import cloud handler (e.g., backup_aws.py, backup_gdrive.py)
    mod_name = f"python_wrapper.backup_{cloud_config['type']}"
    try:
        cloud_mod = importlib.import_module(mod_name)
        return cloud_mod.upload_files(files, cloud_config)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cloud upload failed: {str(e)}")

def list_cloud_backups(cloud_config):
    mod_name = f"python_wrapper.backup_{cloud_config['type']}"
    try:
        cloud_mod = importlib.import_module(mod_name)
        return cloud_mod.list_backups(cloud_config)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cloud list failed: {str(e)}")

def restore_from_cloud(filename, cloud_config):
    mod_name = f"python_wrapper.backup_{cloud_config['type']}"
    try:
        cloud_mod = importlib.import_module(mod_name)
        return cloud_mod.restore_backup(filename, cloud_config)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cloud restore failed: {str(e)}")

router = APIRouter()


MAX_STORAGE_BYTES = 512 * 1024 * 1024  # 0.5 GB

def ensure_backup_dir():
    if not os.path.exists(BACKUP_DIR):
        os.makedirs(BACKUP_DIR)

def get_backup_dir_size():
    total = 0
    for root, dirs, files in os.walk(BACKUP_DIR):
        for f in files:
            fp = os.path.join(root, f)
            total += os.path.getsize(fp)
    return total

def wipe_old_backups():
    files = sorted([os.path.join(BACKUP_DIR, f) for f in os.listdir(BACKUP_DIR)], key=os.path.getmtime)
    while get_backup_dir_size() > MAX_STORAGE_BYTES and files:
        os.remove(files[0])
        files.pop(0)

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
    wipe_old_backups()
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

# Endpoint: trigger backup (admin/user)
@router.post("/backup/run")
async def run_backup(request: Request):
    cloud_config = get_user_cloud_config(request)
    files = backup_all()
    if cloud_config:
        upload_result = upload_to_cloud(files, cloud_config)
        return {"status": "ok", "files": files, "cloud": upload_result}
    else:
        return {"status": "ok", "files": files, "cloud": None}

# Endpoint: list backups

# Endpoint: list backups (local or cloud)
@router.get("/backup/list")
async def get_backup_list(request: Request):
    cloud_config = get_user_cloud_config(request)
    if cloud_config:
        return list_cloud_backups(cloud_config)
    else:
        return list_backups()

# Endpoint: restore backup (admin)

# Endpoint: restore backup (local or cloud)
@router.post("/backup/restore")
async def restore(request: Request):
    data = await request.json()
    filename = data.get("filename")
    if not filename:
        return JSONResponse(status_code=400, content={"error": "Missing filename"})
    cloud_config = get_user_cloud_config(request)
    if cloud_config:
        ok = restore_from_cloud(filename, cloud_config)
    else:
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
