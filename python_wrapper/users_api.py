# GDPR/CCPA: User data export and deletion endpoints
import io
from fastapi.responses import StreamingResponse

# Export user data (all info for a given username)
@router.get("/users/export/{username}")
def export_user_data(username: str):
    users = load_users()
    user = next((u for u in users if u.get("username") == username), None)
    if not user:
        return JSONResponse(status_code=404, content={"error": "User not found"})
    # Collect all user-related data (expand as needed)
    data = {"user": user}
    # Add notification prefs if available
    try:
        from .notify_api import load_prefs
        prefs = load_prefs()
        data["notification_prefs"] = prefs.get(username, {})
    except Exception:
        pass
    # Add more as needed (logs, mapping, etc.)
    buf = io.BytesIO()
    buf.write(json.dumps(data, indent=2).encode("utf-8"))
    buf.seek(0)
    return StreamingResponse(buf, media_type="application/json", headers={"Content-Disposition": f"attachment; filename={username}_data.json"})

# Delete user data (irreversible)
@router.post("/users/delete/{username}")
def delete_user_data(username: str):
    users = load_users()
    users = [u for u in users if u.get("username") != username]
    save_users(users)
    # Remove notification prefs
    try:
        from .notify_api import load_prefs, save_prefs
        prefs = load_prefs()
        if username in prefs:
            del prefs[username]
            save_prefs(prefs)
    except Exception:
        pass
    # Add more as needed (logs, mapping, etc.)
    return {"status": "deleted"}
# --- Email Notification Stub ---
EMAIL_LOG_FILE = os.path.join(os.path.dirname(__file__), "email_log.json")
def send_email_stub(to, subject, body):
    entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "to": to,
        "subject": subject,
        "body": body
    }
    try:
        if os.path.exists(EMAIL_LOG_FILE):
            with open(EMAIL_LOG_FILE, "r", encoding="utf-8") as f:
                logs = json.load(f)
        else:
            logs = []
    except Exception:
        logs = []
    logs.append(entry)
    with open(EMAIL_LOG_FILE, "w", encoding="utf-8") as f:
        json.dump(logs, f, indent=2)
# Endpoint: update user tier (admin only)
@router.post("/users/update_tier")
def update_user_tier(payload: Dict, request: Request):
    role = request.headers.get("X-Role", "guest")
    admin = request.headers.get("X-Username", "admin")
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin only.")
    username = payload.get("username")
    new_tier = payload.get("subscription_tier")
    if not username or not new_tier:
        raise HTTPException(status_code=400, detail="Username and new tier required.")
    users = load_users()
    found = False
    for user in users:
        if user["username"] == username:
            user["subscription_tier"] = new_tier
            found = True
            log_admin_action(admin, "update_tier", {"username": username, "new_tier": new_tier})
    if not found:
        raise HTTPException(status_code=404, detail="User not found.")
    save_users(users)
    return {"status": "ok"}

# --- Audit Logging ---
AUDIT_LOG_FILE = os.path.join(os.path.dirname(__file__), "admin_audit_log.json")
def log_admin_action(admin, action, details):
    entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "admin": admin,
        "action": action,
        "details": details
    }
    try:
        if os.path.exists(AUDIT_LOG_FILE):
            with open(AUDIT_LOG_FILE, "r", encoding="utf-8") as f:
                logs = json.load(f)
        else:
            logs = []
    except Exception:
        logs = []
    logs.append(entry)
    with open(AUDIT_LOG_FILE, "w", encoding="utf-8") as f:
        json.dump(logs, f, indent=2)

import os
import json
import secrets
from fastapi import APIRouter, HTTPException, Depends, Request
from typing import Dict, List
from hashlib import sha256
from datetime import datetime
import re
import time

USERS_FILE = os.path.join(os.path.dirname(__file__), "users.json")
router = APIRouter()

# User roles: admin, user, guest
# Access modes: free, paid, beta

# Invitation list for beta (in production, use a DB or secure store)
INVITED_EMAILS_FILE = os.path.join(os.path.dirname(__file__), "invited_emails.json")
def load_invited_emails():
    if not os.path.exists(INVITED_EMAILS_FILE):
        with open(INVITED_EMAILS_FILE, "w", encoding="utf-8") as f:
            json.dump([], f)
    with open(INVITED_EMAILS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)
def save_invited_emails(emails):
    with open(INVITED_EMAILS_FILE, "w", encoding="utf-8") as f:
        json.dump(emails, f, indent=2)

# --- Password Policy ---
def is_strong_password(password):
    # At least 8 chars, upper, lower, digit, special
    if len(password) < 8:
        return False
    if not re.search(r"[A-Z]", password):
        return False
    if not re.search(r"[a-z]", password):
        return False
    if not re.search(r"[0-9]", password):
        return False
    if not re.search(r"[^A-Za-z0-9]", password):
        return False
    return True

# --- Rate Limiting (simple in-memory, per-IP) ---
RATE_LIMITS = {}
RATE_LIMIT_WINDOW = 60  # seconds
RATE_LIMIT_MAX = 10    # max requests per window

def check_rate_limit(ip):
    now = int(time.time())
    window = now // RATE_LIMIT_WINDOW
    key = f"{ip}:{window}"
    count = RATE_LIMITS.get(key, 0)
    if count >= RATE_LIMIT_MAX:
        return False
    RATE_LIMITS[key] = count + 1
    return True

# --- 2FA/MFA Stubs ---
MFA_CODES = {}  # username: code

def send_mfa_code(username, method="email"):
    import random
    code = str(random.randint(100000, 999999))
    MFA_CODES[username] = code
    # For demo: log to email or sms log
    if method == "email":
        try:
            from .notify_api import log_sms, log_push
            log_push(username, f"Your 2FA code is {code}", "2fa")
        except Exception:
            pass
    return code

# --- Audit Log Helper (granular) ---
def log_admin_action_granular(action, actor, details=None):
    log_path = os.path.join(os.path.dirname(__file__), "admin_audit_log.json")
    log = []
    if os.path.exists(log_path):
        with open(log_path, "r", encoding="utf-8") as f:
            log = json.load(f)
    entry = {"timestamp": int(time.time()), "action": action, "actor": actor, "details": details}
    log.append(entry)
    with open(log_path, "w", encoding="utf-8") as f:
        json.dump(log, f, indent=2)

# --- Signup endpoint with password policy, rate limiting, and audit ---
@router.post("/users/signup_strong")
async def signup_strong(request: Request):
    ip = request.client.host if request.client else "unknown"
    if not check_rate_limit(ip):
        return JSONResponse(status_code=429, content={"error": "Rate limit exceeded"})
    data = await request.json()
    password = data.get("password", "")
    if not is_strong_password(password):
        return JSONResponse(status_code=400, content={"error": "Password does not meet policy"})
    # ...existing code for user creation (reuse from /users/signup)...
    # For demo, just log action
    log_admin_action_granular("signup", data.get("username"), {"ip": ip})
    return {"status": "ok"}

# --- Login endpoint with rate limiting and 2FA/MFA stub ---
@router.post("/users/login_strong")
async def login_strong(request: Request):
    ip = request.client.host if request.client else "unknown"
    if not check_rate_limit(ip):
        return JSONResponse(status_code=429, content={"error": "Rate limit exceeded"})
    data = await request.json()
    username = data.get("username")
    password = data.get("password")
    user = authenticate_user(username, password)
    if not user:
        log_admin_action_granular("login_fail", username, {"ip": ip})
        return JSONResponse(status_code=401, content={"error": "Invalid credentials."})
    # For demo, always require 2FA for admin, optional for users
    is_admin = user.get("role") == "admin"
    if is_admin or data.get("require_2fa"):
        code = send_mfa_code(username)
        log_admin_action_granular("2fa_code_sent", username, {"ip": ip})
        return {"status": "2fa_required", "method": "push", "code": code}  # For demo, return code
    log_admin_action_granular("login", username, {"ip": ip})
    return {"status": "ok"}

# --- 2FA verification endpoint ---
@router.post("/users/verify-2fa")
async def verify_2fa(request: Request):
    data = await request.json()
    username = data.get("username")
    code = data.get("code")
    if MFA_CODES.get(username) == code:
        log_admin_action_granular("2fa_success", username)
        return {"status": "ok"}
    else:
        log_admin_action_granular("2fa_fail", username)
        return JSONResponse(status_code=401, content={"error": "Invalid 2FA code"})

# --- Audit log access endpoint (granular) ---
@router.get("/admin/audit-log-granular")
def get_audit_log_granular():
    log_path = os.path.join(os.path.dirname(__file__), "admin_audit_log.json")
    if not os.path.exists(log_path):
        return []
    with open(log_path, "r", encoding="utf-8") as f:
        return json.load(f)

# Endpoint: invite user (admin only)
@router.post("/users/invite")
def invite_user(payload: Dict, request: Request):
    role = request.headers.get("X-Role", "guest")
    admin = request.headers.get("X-Username", "admin")
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin only.")
    email = payload.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email required.")
    emails = load_invited_emails()
    if email.lower() in [e.lower() for e in emails]:
        return {"status": "already_invited"}
    emails.append(email)
    save_invited_emails(emails)
    log_admin_action(admin, "invite_user", {"email": email})
    # Email stub: log invitation
    send_email_stub(email, "You're Invited to Beta", f"You have been invited to join the beta. Please sign up with this email at the dashboard.")
    return {"status": "invited"}

# Endpoint: check invitation
@router.get("/users/invited/{email}")
def check_invited(email: str):
    emails = load_invited_emails()
    return {"invited": email.lower() in [e.lower() for e in emails]}
DEFAULT_USERS = [
    {
        "username": "admin",
        "password": "admin",
        "role": "admin",
        "access_mode": "free",
        "emergency_contact": False,
        # Each emergency contact: {"name": str, "email": str, "phone_number": str}
        "emergency_contacts": [],
        "service_location": "",
        "billing_location": "",
        "declared_sqft": 0,
        "subscription_tier": "free"
    },
    {
        "username": "brentowens2016@aol.com",
        "password": "",
        "role": "admin",
        "access_mode": "free",
        "emergency_contact": False,
        "emergency_contacts": [],
        "service_location": "",
        "billing_location": "",
        "reset_token": "",
        "declared_sqft": 0,
        "subscription_tier": "free"
    }
]
@router.post("/users/request_reset")
def request_password_reset(payload: Dict):
    email = payload.get("email")
    users = load_users()
    for user in users:
        if user["username"].lower() == email.lower():
            token = secrets.token_urlsafe(16)
            user["reset_token"] = token
            save_users(users)
            # Email stub: log password reset
            send_email_stub(email, "Password Reset Request", f"Your password reset token is: {token}")
            return {"status": "ok", "reset_token": token}
    raise HTTPException(status_code=404, detail="User not found.")

@router.post("/users/reset_password")
def reset_password(payload: Dict):
    email = payload.get("email")
    token = payload.get("token")
    new_password = payload.get("new_password")
    users = load_users()
    for user in users:
        if user["username"].lower() == email.lower() and user.get("reset_token") == token:
            user["password"] = new_password
            user["reset_token"] = ""
            save_users(users)
            return {"status": "ok"}
    raise HTTPException(status_code=400, detail="Invalid token or user.")

def load_users():
    if not os.path.exists(USERS_FILE):
        with open(USERS_FILE, "w", encoding="utf-8") as f:
            json.dump(DEFAULT_USERS, f, indent=2)
    with open(USERS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_users(users):
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2)

def hash_password(password):
    return sha256(password.encode()).hexdigest()

def authenticate_user(username: str, password: str):
    users = load_users()
    for user in users:
           if user["username"].lower() == username.lower() and user["password"] == password:
            return user
    return None

@router.post("/login")
def login(payload: Dict):
    username = payload.get("username")
    password = payload.get("password")
    user = authenticate_user(username, password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials.")
    return {
        "username": user["username"],
        "role": user["role"],
        "access_mode": user.get("access_mode", "free"),
        "emergency_contact": user.get("emergency_contact", False),
        "emergency_contacts": user.get("emergency_contacts", []),
        "service_location": user.get("service_location", ""),
        "billing_location": user.get("billing_location", "")
    }

@router.get("/users")
def get_users(request: Request):
    # Only admin can list users
    role = request.headers.get("X-Role", "guest")
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin only.")
    return load_users()

@router.post("/users")
def add_user(payload: Dict, request: Request):
    # For beta: only allow signup if invited
    invited_emails = load_invited_emails()
    email = payload.get("username")
    if not email or email.lower() not in [e.lower() for e in invited_emails]:
        raise HTTPException(status_code=403, detail="Invitation required for beta signup.")
    users = load_users()
    if any(u["username"] == email for u in users):
        raise HTTPException(status_code=400, detail="Username already exists.")
    users.append({
        "username": email,
        "password": payload["password"],
        "role": payload.get("role", "user"),
        "access_mode": "beta",  # unlock all features for beta
        "emergency_contact": payload.get("emergency_contact", False),
        # Each emergency contact should be a dict with name, email, phone_number
        "emergency_contacts": [
            {"name": ec.get("name", ""), "email": ec.get("email", ""), "phone_number": ec.get("phone_number", "")}
            for ec in payload.get("emergency_contacts", [])
        ],
        "service_location": payload.get("service_location", ""),
        "billing_location": payload.get("billing_location", ""),
        "declared_sqft": payload.get("declared_sqft", 0),
        "subscription_tier": payload.get("subscription_tier", "premium")  # unlock all for beta
    })
    save_users(users)
    # Email stub: log signup confirmation
    send_email_stub(email, "Welcome to Beta", "Your account has been created. Enjoy full access during the beta period!")
    return {"status": "ok"}

@router.post("/users/{username}/delete")
def delete_user(username: str, request: Request):
    role = request.headers.get("X-Role", "guest")
    admin = request.headers.get("X-Username", "admin")
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin only.")
    users = load_users()
    users = [u for u in users if u["username"] != username]
    save_users(users)
    log_admin_action(admin, "delete_user", {"username": username})
    return {"status": "ok"}
