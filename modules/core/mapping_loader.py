"""
Device mapping loader and validator (core module copy)
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
    try:
        validate(instance=mapping, schema=device_mapping_schema)
    except ValidationError as e:
        raise ValueError(f"Mapping validation error: {e.message}")
    ids = [entry['id'] for entry in mapping]
    if len(ids) != len(set(ids)):
        raise ValueError("Duplicate device IDs found in mapping.")
def load_and_validate_mapping(path: str) -> List[Dict[str, Any]]:
    with open(path, 'r', encoding='utf-8') as f:
        mapping = json.load(f)
    validate_mapping_object(mapping)
    return mapping
