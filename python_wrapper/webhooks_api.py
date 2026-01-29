"""
Webhooks API for third-party integrations (e.g., Alexa, Google Home)

# Endpoints:
#   - POST /webhooks/register: Register a new webhook (URL, event type)
#   - GET /webhooks: List all registered webhooks
#   - POST /webhooks/trigger: Trigger a webhook event (for testing/demo)
"""
import os
import json
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

WEBHOOKS_PATH = os.path.join(os.path.dirname(__file__), "webhooks.json")

router = APIRouter()

def load_webhooks():
    if os.path.exists(WEBHOOKS_PATH):
        with open(WEBHOOKS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def save_webhooks(webhooks):
    with open(WEBHOOKS_PATH, "w", encoding="utf-8") as f:
        json.dump(webhooks, f, indent=2)

@router.post("/webhooks/register")
async def register_webhook(request: Request):
    data = await request.json()
    url = data.get("url")
    event = data.get("event")
    if not url or not event:
        return JSONResponse(status_code=400, content={"error": "Missing url or event"})
    webhooks = load_webhooks()
    webhooks.append({"url": url, "event": event})
    save_webhooks(webhooks)
    return {"status": "registered"}

@router.get("/webhooks")
def list_webhooks():
    return load_webhooks()

@router.post("/webhooks/trigger")
async def trigger_webhook(request: Request):
    data = await request.json()
    event = data.get("event")
    payload = data.get("payload", {})
    webhooks = [w for w in load_webhooks() if w["event"] == event]
    # For demo: just log the trigger, in real use would POST to each URL
    for wh in webhooks:
        # Here you would: requests.post(wh["url"], json=payload)
        pass
    return {"triggered": len(webhooks), "event": event}

# For future: add signature/secret validation, delivery retries, etc.