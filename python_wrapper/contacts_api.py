import os
import json
from fastapi import APIRouter, HTTPException
from typing import List, Dict

CONTACTS_FILE = os.path.join(os.path.dirname(__file__), "emergency_contacts.json")
router = APIRouter()

def load_contacts():
    try:
        with open(CONTACTS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {"emergency_services": {"name": "911", "phone": "911"}, "contacts": []}

def save_contacts(data):
    with open(CONTACTS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

@router.get("/contacts")
def get_contacts():
    return load_contacts()

@router.post("/contacts")
def update_contacts(payload: Dict):
    if "emergency_services" not in payload or "contacts" not in payload:
        raise HTTPException(status_code=400, detail="Missing required fields.")
    if not isinstance(payload["contacts"], list) or len(payload["contacts"]) > 7:
        raise HTTPException(status_code=400, detail="Contacts must be a list of up to 7 entries.")
    # Validate mobile field
    for contact in payload["contacts"]:
        if "mobile" not in contact:
            contact["mobile"] = ""
    save_contacts(payload)
    return {"status": "ok"}
