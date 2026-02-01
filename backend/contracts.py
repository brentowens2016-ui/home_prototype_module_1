# Contract structures for cross-platform dashboard features
# These define the data exchanged between frontend, backend (Python), and agent (Rust FFI)

from typing import List, Dict, Any
from pydantic import BaseModel

class FeatureContract(BaseModel):
    name: str
    tier: str
    enabled: bool
    controls: List[Dict[str, Any]]  # e.g., [{"type": "switch", "label": "Power"}, ...]

class DashboardContract(BaseModel):
    user_tier: str
    features: List[FeatureContract]

# Example usage:
# DashboardContract(user_tier="basic", features=[FeatureContract(name="Home Map", tier="basic", enabled=True, controls=[])])
