"""
Mapping API logic for device mapping endpoints (core module copy)
"""
import json
from . import secure_storage
from fastapi import UploadFile, File
from fastapi.responses import JSONResponse
from .mapping_loader import load_and_validate_mapping, validate_mapping_object
import os
MAPPING_PATH = os.path.join(os.path.dirname(__file__), "device_mapping.json.enc")
current_mapping = None
def get_mapping():
    global current_mapping
    if current_mapping is None:
        try:
            mapping = secure_storage.read_and_decrypt_json(MAPPING_PATH)
            current_mapping = load_and_validate_mapping(mapping)
        except Exception:
            current_mapping = []
    return current_mapping
def set_mapping(mapping):
    global current_mapping
    from .users_api import load_users
    users = load_users()
    user = next((u for u in users if u.get('role') == 'admin'), users[0] if users else None)
    if not user:
        raise Exception("No user found for enforcement.")
    declared_sqft = user.get('declared_sqft', 0)
    subscription_tier = user.get('subscription_tier', 'free')
    TIER_LIMITS = {
        'free':    {'max_devices': 10, 'max_sqft': 800},
        'basic':   {'max_devices': 25, 'max_sqft': 1600},
        'premium': {'max_devices': 50, 'max_sqft': 2400},
    }
    if declared_sqft > 2400:
        raise Exception("Declared square footage exceeds residential maximum. Please contact for commercial plans.")
    tier = TIER_LIMITS.get(subscription_tier, TIER_LIMITS['free'])
    if declared_sqft > tier['max_sqft']:
        raise Exception(f"Your declared square footage ({declared_sqft}) exceeds the limit for your subscription tier ({subscription_tier}: {tier['max_sqft']} sqft). Please upgrade your plan.")
    if len(mapping) > tier['max_devices']:
        raise Exception(f"Device mapping exceeds allowed devices for your tier ({subscription_tier}: {tier['max_devices']} devices). Please upgrade your plan or remove devices.")
    secure_storage.encrypt_json_and_write(MAPPING_PATH, mapping)
    current_mapping = mapping
def check_mapping_limits(mapping):
    from .users_api import load_users
    users = load_users()
    user = next((u for u in users if u.get('role') == 'admin'), users[0] if users else None)
    if not user:
        return "No user found for enforcement."
