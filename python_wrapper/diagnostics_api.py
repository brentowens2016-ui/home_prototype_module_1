import os
import glob
from fastapi import APIRouter, HTTPException, Request
from typing import List

LOG_DIR = os.path.join(os.path.dirname(__file__), "logs")
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)

router = APIRouter()

@router.get("/diagnostics/logs")
def list_logs(request: Request):
    role = request.headers.get("X-Role", "guest")
    if role not in ("admin", "support"):
        raise HTTPException(status_code=403, detail="Admin/support only.")
    return sorted([os.path.basename(f) for f in glob.glob(os.path.join(LOG_DIR, "*.log"))])

@router.get("/diagnostics/logs/{log_name}")
def get_log(log_name: str, request: Request):
    role = request.headers.get("X-Role", "guest")
    if role not in ("admin", "support"):
        raise HTTPException(status_code=403, detail="Admin/support only.")
    log_path = os.path.join(LOG_DIR, log_name)
    if not os.path.exists(log_path):
        raise HTTPException(status_code=404, detail="Log not found.")
    with open(log_path, "r", encoding="utf-8") as f:
        return {"log": f.read()}

@router.get("/diagnostics/health")
def get_health(request: Request):
    role = request.headers.get("X-Role", "guest")
    if role not in ("admin", "support"):
        raise HTTPException(status_code=403, detail="Admin/support only.")
    # Example health info (expand as needed)
    import psutil
    return {
        "cpu_percent": psutil.cpu_percent(),
        "memory": psutil.virtual_memory()._asdict(),
        "disk": psutil.disk_usage("/")._asdict()
    }
