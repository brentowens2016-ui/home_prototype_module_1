
"""
Device mapping loader and validator

# Learning References
# - Python for Dummies
#   - Chapter 12: Organizing Code with Modules and Packages (see import structure)
#   - Chapter 18: Extending Python with C (conceptually similar for FFI)
#   - Chapter 13: Using Python’s Built-In Functions (see type hints and validation)
#   - Chapter 10: Creating and Using Classes (see mapping object usage)
"""

import json
from jsonschema import validate, ValidationError
from typing import List, Dict, Any

device_mapping_schema = {
    "type": "array",
    "items": {
        "type": "object",
        "required": ["id", "location", "type"],
        "properties": {
            "id": {"type": "string"},
            "location": {"type": "string"},
            "type": {"type": "string"},
            "function": {"type": "string"},
            "room": {"type": "string"},
            "x": {"type": "number"},
            "y": {"type": "number"}
        },
        "additionalProperties": False
    }
}


def validate_mapping_object(mapping: List[Dict[str, Any]]):
    """
        Validate a device mapping object (list of dicts).
        Raises ValueError if validation fails (schema or duplicate IDs).
        Fields:
            - id (str, required): Unique device identifier
            - location (str, required): Physical/logical location
            - type (str, required): Device type
            - function (str, optional): Logical function/automation
            - room (str, optional): Room or zone name
            - x (number, optional): X coordinate (for placement)
            - y (number, optional): Y coordinate (for placement)
    """
    """
    Validate a device mapping object (list of dicts).
    Raises ValueError if validation fails.
    """
    try:
        validate(instance=mapping, schema=device_mapping_schema)
    except ValidationError as e:
        raise ValueError(f"Mapping validation error: {e.message}")
    ids = [entry['id'] for entry in mapping]
    if len(ids) != len(set(ids)):
        raise ValueError("Duplicate device IDs found in mapping.")

def load_and_validate_mapping(path: str) -> List[Dict[str, Any]]:
    """
    Load and validate a device mapping JSON file from disk.
    Raises ValueError if validation fails.
    """
    """
    Load and validate a device mapping JSON file.
    Raises ValueError if validation fails.
    """
    with open(path, 'r', encoding='utf-8') as f:
        mapping = json.load(f)
    validate_mapping_object(mapping)
    return mapping

# Example usage:
# mapping = load_and_validate_mapping('device_mapping.json')
# print(mapping)
