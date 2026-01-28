

"""
Mapping API logic for device mapping endpoints

# Learning References
# - Python for Dummies
#   - Chapter 16: Web Programming Basics (see REST API concepts)
#   - Chapter 12: Organizing Code with Modules and Packages (see import structure)
"""

import json
from fastapi import UploadFile, File
from fastapi.responses import JSONResponse
from .mapping_loader import load_and_validate_mapping, validate_mapping_object
import os

MAPPING_PATH = os.path.join(os.path.dirname(__file__), "device_mapping.json")

# In-memory cache for mapping (optional, for performance)
current_mapping = None

def get_mapping():
    """
    Return the current device mapping (loads from disk if not cached).
    """
    global current_mapping
    if current_mapping is None:
        try:
            current_mapping = load_and_validate_mapping(MAPPING_PATH)
        except Exception:
            current_mapping = []
    return current_mapping

def set_mapping(mapping):
    """
    Save the device mapping to disk and update the in-memory cache.
    """
    global current_mapping
    with open(MAPPING_PATH, "w", encoding="utf-8") as f:
        json.dump(mapping, f, indent=2)
    current_mapping = mapping

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
