import os
import json
from fastapi import APIRouter, HTTPException, Request
from typing import Dict, List

templates_file = os.path.join(os.path.dirname(__file__), "automation_templates.json")
router = APIRouter()

@router.get("/automation/templates")
def get_templates():
    if not os.path.exists(templates_file):
        return []
    with open(templates_file, "r", encoding="utf-8") as f:
        return json.load(f)

@router.post("/automation/templates")
def add_template(payload: Dict, request: Request):
    role = request.headers.get("X-Role", "guest")
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin only.")
    if not os.path.exists(templates_file):
        templates = []
    else:
        with open(templates_file, "r", encoding="utf-8") as f:
            templates = json.load(f)
    templates.append(payload)
    with open(templates_file, "w", encoding="utf-8") as f:
        json.dump(templates, f, indent=2)
    return {"status": "ok"}

@router.post("/automation/templates/{idx}/delete")
def delete_template(idx: int, request: Request):
    role = request.headers.get("X-Role", "guest")
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin only.")
    if not os.path.exists(templates_file):
        raise HTTPException(status_code=404, detail="No templates found.")
    with open(templates_file, "r", encoding="utf-8") as f:
        templates = json.load(f)
    if not (0 <= idx < len(templates)):
        raise HTTPException(status_code=404, detail="Template not found.")
    templates.pop(idx)
    with open(templates_file, "w", encoding="utf-8") as f:
        json.dump(templates, f, indent=2)
    return {"status": "ok"}
