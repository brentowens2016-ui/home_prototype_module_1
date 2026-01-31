"""
Automation API: scheduling and conditional automations
"""
import os
import json
from . import secure_storage
import time
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

AUTOMATIONS_PATH = os.path.join(os.path.dirname(__file__), "automations.json.enc")

router = APIRouter()

def load_automations():
    if os.path.exists(AUTOMATIONS_PATH):
        return secure_storage.read_and_decrypt_json(AUTOMATIONS_PATH)
    return []

def save_automations(automations):
    secure_storage.encrypt_json_and_write(AUTOMATIONS_PATH, automations)

# List all automations
@router.get("/automations")
def list_automations():
    return load_automations()

# Add or update an automation (with schedule/condition)
@router.post("/automations")
async def add_automation(request: Request):
    data = await request.json()
    automations = load_automations()
    # If id exists, update; else add new
    idx = next((i for i, a in enumerate(automations) if a.get("id") == data.get("id")), None)
    if idx is not None:
        automations[idx] = data
    else:
        automations.append(data)
    save_automations(automations)
    return {"status": "ok"}

# Remove an automation
@router.post("/automations/delete")
async def delete_automation(request: Request):
    data = await request.json()
    automations = load_automations()
    automations = [a for a in automations if a.get("id") != data.get("id")]
    save_automations(automations)
    return {"status": "deleted"}

# For demo: endpoint to trigger automations (simulate schedule/condition)
@router.post("/automations/trigger")
async def trigger_automations(request: Request):
    data = await request.json()
    now = int(time.time())
    automations = load_automations()
    triggered = []
    for a in automations:
        # Check schedule (if present)
        schedule = a.get("schedule")
        if schedule:
            # Example: schedule = {"type": "cron", "cron": "0 7 * * *"} or {"type": "interval", "seconds": 3600}
            # For demo, just check if "force" in data or always trigger
            if not data.get("force"):
                continue
        # Check condition (if present)
        condition = a.get("condition")
        if condition:
            # Example: condition = {"type": "state", "device": "Living Room 1", "state": "on"}
            # For demo, just check if "force" in data or always trigger
            if not data.get("force"):
                continue
        triggered.append(a.get("id"))
    return {"triggered": triggered}
import os
import json
from fastapi import APIRouter, HTTPException, Request
from typing import Dict, List

templates_file = os.path.join(os.path.dirname(__file__), "automation_templates.json.enc")
router = APIRouter()

@router.get("/automation/templates")
def get_templates():
    if not os.path.exists(templates_file):
        return []
    return secure_storage.read_and_decrypt_json(templates_file)

@router.post("/automation/templates")
def add_template(payload: Dict, request: Request):
    role = request.headers.get("X-Role", "guest")
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin only.")
    if not os.path.exists(templates_file):
        templates = []
    else:
        templates = secure_storage.read_and_decrypt_json(templates_file)
    templates.append(payload)
    secure_storage.encrypt_json_and_write(templates_file, templates)
    return {"status": "ok"}

@router.post("/automation/templates/{idx}/delete")
def delete_template(idx: int, request: Request):
    role = request.headers.get("X-Role", "guest")
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin only.")
    if not os.path.exists(templates_file):
        raise HTTPException(status_code=404, detail="No templates found.")
    templates = secure_storage.read_and_decrypt_json(templates_file)
    if not (0 <= idx < len(templates)):
        raise HTTPException(status_code=404, detail="Template not found.")
    templates.pop(idx)
    secure_storage.encrypt_json_and_write(templates_file, templates)
    return {"status": "ok"}
