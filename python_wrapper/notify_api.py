import os
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
    if method == "email":
        if not send_email(to, subject, message):
            raise HTTPException(status_code=500, detail="Email failed.")
    elif method == "sms":
        if not send_sms(to, message):
            raise HTTPException(status_code=500, detail="SMS failed.")
    elif method == "push":
        if not send_push_notification(to, message):
            raise HTTPException(status_code=500, detail="Push failed.")
    else:
        raise HTTPException(status_code=400, detail="Unknown notification method.")
    return {"status": "ok"}
