"""
Notification API: email, SMS, push notification stubs and user preferences
"""
import os
import json
import time
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

NOTIFY_PREFS_PATH = os.path.join(os.path.dirname(__file__), "notification_prefs.json")
SMS_LOG_PATH = os.path.join(os.path.dirname(__file__), "sms_log.json")
PUSH_LOG_PATH = os.path.join(os.path.dirname(__file__), "push_log.json")

router = APIRouter()

def load_prefs():
    if os.path.exists(NOTIFY_PREFS_PATH):
        with open(NOTIFY_PREFS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def save_prefs(prefs):
    with open(NOTIFY_PREFS_PATH, "w", encoding="utf-8") as f:
        json.dump(prefs, f, indent=2)

def log_sms(to, message, type, details=None):
    log = []
    if os.path.exists(SMS_LOG_PATH):
        with open(SMS_LOG_PATH, "r", encoding="utf-8") as f:
            log = json.load(f)
    log.append({"timestamp": int(time.time()), "to": to, "message": message, "type": type, "details": details})
    with open(SMS_LOG_PATH, "w", encoding="utf-8") as f:
        json.dump(log, f, indent=2)

def log_push(to, message, type, details=None):
    log = []
    if os.path.exists(PUSH_LOG_PATH):
        with open(PUSH_LOG_PATH, "r", encoding="utf-8") as f:
            log = json.load(f)
    log.append({"timestamp": int(time.time()), "to": to, "message": message, "type": type, "details": details})
    with open(PUSH_LOG_PATH, "w", encoding="utf-8") as f:
        json.dump(log, f, indent=2)

# Get notification preferences for a user
@router.get("/notify/prefs/{username}")
def get_notify_prefs(username: str):
    prefs = load_prefs()
    return prefs.get(username, {"email": True, "sms": False, "push": False})

# Set notification preferences for a user
@router.post("/notify/prefs/{username}")
async def set_notify_prefs(username: str, request: Request):
    data = await request.json()
    prefs = load_prefs()
    prefs[username] = {
        "email": bool(data.get("email", True)),
        "sms": bool(data.get("sms", False)),
        "push": bool(data.get("push", False)),
        "sms_number": data.get("sms_number", ""),
        "push_token": data.get("push_token", "")
    }
    save_prefs(prefs)
    return {"status": "ok"}

# For demo: log an SMS notification
@router.post("/notify/sms")
async def send_sms(request: Request):
    data = await request.json()
    log_sms(data.get("to"), data.get("message"), data.get("type", "generic"), data.get("details"))
    return {"status": "sms_logged"}

# For demo: log a push notification
@router.post("/notify/push")
async def send_push(request: Request):
    data = await request.json()
    log_push(data.get("to"), data.get("message"), data.get("type", "generic"), data.get("details"))
    return {"status": "push_logged"}

# Add mobile call-out logic to notify_api.py
# When an anomaly or emergency event occurs, send SMS/push to all contact['mobile'] numbers
# Example function:
def notify_mobile_contacts(event_message):
    from python_wrapper.contacts_api import load_contacts
    contacts_data = load_contacts()
    for contact in contacts_data.get("contacts", []):
        mobile = contact.get("mobile")
        if mobile:
            send_sms(mobile, event_message)
            send_push_notification(mobile, event_message)

import smtplib
from email.mime.text import MIMEText
from fastapi import APIRouter, HTTPException, Request
from typing import Dict
from twilio.rest import Client as TwilioClient

router = APIRouter()

# Email config (set these in environment or config file)
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.example.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_USER = os.getenv("EMAIL_USER", "user@example.com")
EMAIL_PASS = os.getenv("EMAIL_PASS", "password")
EMAIL_FROM = os.getenv("EMAIL_FROM", EMAIL_USER)

# Twilio config for SMS
TWILIO_SID = os.getenv('TWILIO_ACCOUNT_SID')
TWILIO_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
TWILIO_FROM = os.getenv('TWILIO_FROM_NUMBER')

# Push notification placeholder (expand as needed)
def send_push_notification(user, message):
    print(f"Push notification to {user}: {message}")
    return True

def send_email(to, subject, body):
    try:
        msg = MIMEText(body)
        msg['Subject'] = subject
        msg['From'] = EMAIL_FROM
        msg['To'] = to
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASS)
            server.sendmail(EMAIL_FROM, [to], msg.as_string())
        return True
    except Exception as e:
        print(f"Email send failed: {e}")
        return False

def send_sms(to, message):
    if not (TWILIO_SID and TWILIO_TOKEN and TWILIO_FROM):
        print("Twilio not configured.")
        return False
    try:
        client = TwilioClient(TWILIO_SID, TWILIO_TOKEN)
        client.messages.create(to=to, from_=TWILIO_FROM, body=message)
        return True
    except Exception as e:
        print(f"SMS send failed: {e}")
        return False

@router.post("/notify")
def notify(payload: Dict, request: Request):
    role = request.headers.get("X-Role", "guest")
    if role not in ("admin", "user"):
        raise HTTPException(status_code=403, detail="Not authorized.")
    to = payload.get("to")
    method = payload.get("method", "email")
    subject = payload.get("subject", "Smart Home Notification")
    message = payload.get("message", "")
    email_success = True
    if method == "email":
        email_success = send_email(to, subject, message)
        if not email_success:
            # Fallback to SMS if available
            sms_number = payload.get("sms_number", to)
            sms_sent = send_sms(sms_number, message)
            if not sms_sent:
                raise HTTPException(status_code=500, detail="Email and SMS failed.")
            return {"status": "sms_fallback"}
    elif method == "sms":
        if not send_sms(to, message):
            raise HTTPException(status_code=500, detail="SMS failed.")
    elif method == "push":
        if not send_push_notification(to, message):
            raise HTTPException(status_code=500, detail="Push failed.")
    else:
        raise HTTPException(status_code=400, detail="Unknown notification method.")
    return {"status": "ok"}
