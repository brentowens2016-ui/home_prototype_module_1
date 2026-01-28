import secrets
# Password reset: request token and reset password
@router.post("/users/request_reset")
def request_password_reset(payload: Dict):
    email = payload.get("email")
    users = load_users()
    for user in users:
        if user["username"].lower() == email.lower():
            token = secrets.token_urlsafe(16)
            user["reset_token"] = token
            save_users(users)
            # In production, send email here. For now, return token for testing.
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
import os
import json
from fastapi import APIRouter, HTTPException, Depends, Request
from typing import Dict, List
from hashlib import sha256
from datetime import datetime

USERS_FILE = os.path.join(os.path.dirname(__file__), "users.json")
router = APIRouter()

# User roles: admin, user, guest
# Access modes: free, paid
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
        "billing_location": ""
    }
]
    {
        "username": "brentowens2016@aol.com",
        "password": "",
        "role": "admin",
        "access_mode": "free",
        "emergency_contact": False,
        "emergency_contacts": [],
        "service_location": "",
        "billing_location": "",
        "reset_token": ""
    }
]

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
    role = request.headers.get("X-Role", "guest")
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin only.")
    users = load_users()
    if any(u["username"] == payload["username"] for u in users):
        raise HTTPException(status_code=400, detail="Username already exists.")
    users.append({
        "username": payload["username"],
        "password": payload["password"],
        "role": payload.get("role", "user"),
        "access_mode": payload.get("access_mode", "free"),
        "emergency_contact": payload.get("emergency_contact", False),
        # Each emergency contact should be a dict with name, email, phone_number
        "emergency_contacts": [
            {"name": ec.get("name", ""), "email": ec.get("email", ""), "phone_number": ec.get("phone_number", "")}
            for ec in payload.get("emergency_contacts", [])
        ],
        "service_location": payload.get("service_location", ""),
        "billing_location": payload.get("billing_location", "")
    })
    save_users(users)
    return {"status": "ok"}

@router.post("/users/{username}/delete")
def delete_user(username: str, request: Request):
    role = request.headers.get("X-Role", "guest")
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin only.")
    users = load_users()
    users = [u for u in users if u["username"] != username]
    save_users(users)
    return {"status": "ok"}
