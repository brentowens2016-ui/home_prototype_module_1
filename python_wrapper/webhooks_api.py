from fastapi import APIRouter, HTTPException, Request
router = APIRouter()
import hmac
import hashlib

# Map PayPal plan IDs to subscription tiers
PAYPAL_PLAN_TO_TIER = {
    'P-16G075277G691193PNF6MQYQ': 'basic',
    'P-2YY22583M9391591SNF6MN5A': 'advanced',
    'P-4LD610876N917872JNF6MUHQ': 'unlimited',
}

@router.post('/webhooks/paypal')
async def paypal_webhook(request: Request):
    # For production, validate PayPal signature and event type
    event = await request.json()
    event_type = event.get('event_type')
    resource = event.get('resource', {})
    # Only handle subscription activation/renewal
    if event_type in ('BILLING.SUBSCRIPTION.ACTIVATED', 'BILLING.SUBSCRIPTION.UPDATED', 'BILLING.SUBSCRIPTION.RENEWED'):
        plan_id = resource.get('plan_id')
        payer = resource.get('subscriber', {}).get('email_address')
        tier = PAYPAL_PLAN_TO_TIER.get(plan_id)
        if not (payer and tier):
            return JSONResponse(status_code=400, content={'error': 'Missing payer or plan_id'})
        # Update user subscription tier
        from .users_api import load_users, save_users
        users = load_users()
        found = False
        for user in users:
            if user.get('username', '').lower() == payer.lower():
                user['subscription_tier'] = tier
                found = True
        if found:
            save_users(users)
            return {'status': 'updated', 'user': payer, 'tier': tier}
        else:
            return JSONResponse(status_code=404, content={'error': 'User not found'})
    return {'status': 'ignored'}
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