

"""
Mapping API logic for device mapping endpoints

# Learning References
# - Python for Dummies
#   - Chapter 16: Web Programming Basics (see REST API concepts)
#   - Chapter 12: Organizing Code with Modules and Packages (see import structure)
"""

import json
from . import secure_storage
from fastapi import UploadFile, File
from fastapi.responses import JSONResponse
from .mapping_loader import load_and_validate_mapping, validate_mapping_object
import os

MAPPING_PATH = os.path.join(os.path.dirname(__file__), "device_mapping.json.enc")

# In-memory cache for mapping (optional, for performance)
current_mapping = None

def get_mapping():
    """
    Return the current device mapping (loads from disk if not cached).
    """
    global current_mapping
    if current_mapping is None:
        try:
            # Decrypt and load mapping
            mapping = secure_storage.read_and_decrypt_json(MAPPING_PATH)
            current_mapping = load_and_validate_mapping(mapping)
        except Exception:
            current_mapping = []
    return current_mapping

def set_mapping(mapping):
    """
    Save the device mapping to disk and update the in-memory cache.
    Enforces device/tier limits based on user's declared_sqft and subscription_tier.
    """
    global current_mapping
    # Import here to avoid circular import
    from .users_api import load_users
    # Load users and find the primary user (assume first admin or first user)
    users = load_users()
    # Find the user with role 'admin', else first user
    user = next((u for u in users if u.get('role') == 'admin'), users[0] if users else None)
    if not user:
        raise Exception("No user found for enforcement.")
    declared_sqft = user.get('declared_sqft', 0)
    subscription_tier = user.get('subscription_tier', 'free')
    # Define tier limits (can be moved to config)
    TIER_LIMITS = {
        'free':    {'max_devices': 10, 'max_sqft': 800},
        'basic':   {'max_devices': 25, 'max_sqft': 1600},
        'premium': {'max_devices': 50, 'max_sqft': 2400},
    }
    # Commercial enforcement: above 2400 sqft not allowed
    if declared_sqft > 2400:
        raise Exception("Declared square footage exceeds residential maximum. Please contact for commercial plans.")
    tier = TIER_LIMITS.get(subscription_tier, TIER_LIMITS['free'])
    # Enforce square footage
    if declared_sqft > tier['max_sqft']:
        raise Exception(f"Your declared square footage ({declared_sqft}) exceeds the limit for your subscription tier ({subscription_tier}: {tier['max_sqft']} sqft). Please upgrade your plan.")
    # Enforce device count
    if len(mapping) > tier['max_devices']:
        raise Exception(f"Device mapping exceeds allowed devices for your tier ({subscription_tier}: {tier['max_devices']} devices). Please upgrade your plan or remove devices.")
    # Encrypt and save mapping
    secure_storage.encrypt_json_and_write(MAPPING_PATH, mapping)
    current_mapping = mapping

# Helper for API to check mapping limits and return error string (not exception)
def check_mapping_limits(mapping):
    from .users_api import load_users
    users = load_users()
    user = next((u for u in users if u.get('role') == 'admin'), users[0] if users else None)
    if not user:
        return "No user found for enforcement."
    declared_sqft = user.get('declared_sqft', 0)
    subscription_tier = user.get('subscription_tier', 'free')
    TIER_LIMITS = {
        'free':    {'max_devices': 10, 'max_sqft': 800},
        'basic':   {'max_devices': 25, 'max_sqft': 1600},
        'premium': {'max_devices': 50, 'max_sqft': 2400},
    }
    if declared_sqft > 2400:
        return "Declared square footage exceeds residential maximum. Please contact for commercial plans."
    tier = TIER_LIMITS.get(subscription_tier, TIER_LIMITS['free'])
    if declared_sqft > tier['max_sqft']:
        return f"Your declared square footage ({declared_sqft}) exceeds the limit for your subscription tier ({subscription_tier}: {tier['max_sqft']} sqft). Please upgrade your plan."
    if len(mapping) > tier['max_devices']:
        return f"Device mapping exceeds allowed devices for your tier ({subscription_tier}: {tier['max_devices']} devices). Please upgrade your plan or remove devices."
    return None

# FastAPI endpoints (to be included in api.py):
#
# @app.get("/mapping")
# def get_device_mapping():
#     return get_mapping()
#

# @app.post("/mapping")
# def upload_device_mapping(mapping: list):
#     try:
#         validate_mapping_object(mapping)  # Will raise if invalid
#         set_mapping(mapping)
#         return {"status": "ok"}
#     except Exception as e:
#         return JSONResponse(status_code=400, content={"error": str(e)})
