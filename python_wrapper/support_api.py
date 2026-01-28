import os
import json
from fastapi import APIRouter, HTTPException
from typing import Dict, List
from datetime import datetime

TICKETS_FILE = os.path.join(os.path.dirname(__file__), "support_tickets.json")
router = APIRouter()

def load_tickets():
    if not os.path.exists(TICKETS_FILE):
        return []
    with open(TICKETS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_tickets(tickets):
    with open(TICKETS_FILE, "w", encoding="utf-8") as f:
        json.dump(tickets, f, indent=2)

@router.get("/tickets")
def get_tickets():
    return load_tickets()

@router.post("/tickets")
def submit_ticket(payload: Dict):
    required = ["user", "subject", "description"]
    if not all(k in payload for k in required):
        raise HTTPException(status_code=400, detail="Missing required fields.")
    tickets = load_tickets()
    ticket = {
        "id": len(tickets) + 1,
        "user": payload["user"],
        "subject": payload["subject"],
        "description": payload["description"],
        "status": "open",
        "created_at": datetime.utcnow().isoformat()
    }
    tickets.append(ticket)
    save_tickets(tickets)
    return {"status": "ok", "ticket_id": ticket["id"]}

@router.post("/tickets/{ticket_id}/close")
def close_ticket(ticket_id: int):
    tickets = load_tickets()
    for t in tickets:
        if t["id"] == ticket_id:
            t["status"] = "closed"
            save_tickets(tickets)
            return {"status": "ok"}
    raise HTTPException(status_code=404, detail="Ticket not found.")
