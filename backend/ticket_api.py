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

@router.post("/tickets/create")
async def create_ticket(request: Request):
    data = await request.json()
    ticket_id = str(uuid.uuid4())
    ticket = Ticket(
        id=ticket_id,
        user_id=data.get("user_id", ""),
        subject=data.get("subject", ""),
        description=data.get("description", ""),
        priority=data.get("priority", "normal"),
        created_at=data.get("created_at", ""),
        updated_at=data.get("created_at", ""),
        messages=[]
    )
    tickets[ticket_id] = ticket
    return {"status": "ok", "ticket": ticket.dict()}

@router.get("/tickets/list")
async def list_tickets():
    tickets_list = cached(cache, "tickets_list", lambda: [t.dict() for t in tickets.values()], ttl=15)
    return {"tickets": tickets_list}

@router.get("/tickets/{ticket_id}")
async def get_ticket(ticket_id: str):
    ticket = tickets.get(ticket_id)
    if not ticket:
        return {"error": "Ticket not found."}
    return {"ticket": ticket.dict()}

@router.post("/tickets/update/{ticket_id}")
async def update_ticket(ticket_id: str, request: Request):
    data = await request.json()
    ticket = tickets.get(ticket_id)
    if not ticket:
        return {"error": "Ticket not found."}
    for field in ["status", "priority", "assigned_to", "description", "updated_at"]:
        if field in data:
            setattr(ticket, field, data[field])
    return {"status": "ok", "ticket": ticket.dict()}

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
