from .main import encrypt_field, decrypt_field, log_audit
from fastapi import APIRouter, Request
from .cache_utils import SimpleCache, cached
from pydantic import BaseModel
import uuid

router = APIRouter()
cache = SimpleCache()

tickets = {}

class Ticket(BaseModel):
    id: str
    user_id: str
    subject: str
    description: str
    status: str = "open"
    priority: str = "normal"
    assigned_to: str = ""
    created_at: str = ""
    updated_at: str = ""
    messages: list = []


# --- Secure Ticket Creation with Field-Level Encryption and Audit Logging ---
@router.post("/tickets/create")
async def create_ticket(request: Request):
    data = await request.json()
    ticket_id = str(uuid.uuid4())
    enc_user_id = encrypt_field(data.get("user_id", ""))
    enc_subject = encrypt_field(data.get("subject", ""))
    enc_description = encrypt_field(data.get("description", ""))
    ticket = Ticket(
        id=ticket_id,
        user_id=enc_user_id,
        subject=enc_subject,
        description=enc_description,
        priority=data.get("priority", "normal"),
        created_at=data.get("created_at", ""),
        updated_at=data.get("created_at", ""),
        messages=[]
    )
    tickets[ticket_id] = ticket
    log_audit(data.get("user_id", ""), "create_ticket", field="user_id,subject,description")
    return {"status": "ok", "ticket": ticket.dict()}


# --- Secure Ticket Listing with Decryption and Audit Logging ---
@router.get("/tickets/list")
async def list_tickets():
    result = []
    for t in tickets.values():
        ticket_dict = t.dict()
        ticket_dict["user_id"] = decrypt_field(ticket_dict["user_id"])
        ticket_dict["subject"] = decrypt_field(ticket_dict["subject"])
        ticket_dict["description"] = decrypt_field(ticket_dict["description"])
        result.append(ticket_dict)
        log_audit(ticket_dict["user_id"], "list_ticket", field="user_id,subject,description")
    return {"tickets": result}


# --- Secure Ticket Retrieval with Decryption and Audit Logging ---
@router.get("/tickets/{ticket_id}")
async def get_ticket(ticket_id: str):
    ticket = tickets.get(ticket_id)
    if not ticket:
        return {"error": "Ticket not found."}
    ticket_dict = ticket.dict()
    ticket_dict["user_id"] = decrypt_field(ticket_dict["user_id"])
    ticket_dict["subject"] = decrypt_field(ticket_dict["subject"])
    ticket_dict["description"] = decrypt_field(ticket_dict["description"])
    log_audit(ticket_dict["user_id"], "get_ticket", field="user_id,subject,description")
    return {"ticket": ticket_dict}


# --- Secure Ticket Update with Field-Level Encryption and Audit Logging ---
@router.post("/tickets/update/{ticket_id}")
async def update_ticket(ticket_id: str, request: Request):
    data = await request.json()
    ticket = tickets.get(ticket_id)
    if not ticket:
        return {"error": "Ticket not found."}
    for field in ["status", "priority", "assigned_to", "description", "updated_at"]:
        if field in data:
            if field == "description":
                setattr(ticket, field, encrypt_field(data[field]))
            else:
                setattr(ticket, field, data[field])
    log_audit(decrypt_field(ticket.user_id), "update_ticket", field="description")
    ticket_dict = ticket.dict()
    ticket_dict["user_id"] = decrypt_field(ticket_dict["user_id"])
    ticket_dict["subject"] = decrypt_field(ticket_dict["subject"])
    ticket_dict["description"] = decrypt_field(ticket_dict["description"])
    return {"status": "ok", "ticket": ticket_dict}

@router.post("/tickets/message/{ticket_id}")
async def add_ticket_message(ticket_id: str, request: Request):
    data = await request.json()
    ticket = tickets.get(ticket_id)
    if not ticket:
        return {"error": "Ticket not found."}
    msg = {
        "author": data.get("author", ""),
        "message": data.get("message", ""),
        "timestamp": data.get("timestamp", "")
    }
    ticket.messages.append(msg)
    ticket.updated_at = data.get("timestamp", ticket.updated_at)
    return {"status": "ok", "ticket": ticket.dict()}
