"""
predictive_ai.py: Initial AI module skeleton for Home Prototype Module 1

Purpose:
- Collects and logs events from the system (simulated or real)
- Provides hooks for scenario input and instructor feedback
- Designed for incremental learning and diagnostics

Usage:
- Import and call `ai_module.handle_event(event)` to process events
- Use `ai_module.add_scenario(scenario)` to add labeled training scenarios
- Use `ai_module.get_diagnostics()` to retrieve current AI insights

This module will grow as we teach and refine its logic together.
"""


import json
from typing import List, Dict, Any
try:
    from voip_module import VOIP_AVAILABLE, place_call
except ImportError:
    VOIP_AVAILABLE = False

class PredictiveAIModule:
        def suggest_normal_state_and_chain(self, device_info: dict) -> dict:
            """
            Suggest the likely normal state and possible chain placement for a new device.
            device_info: {"sensor_type": ..., "sensor_id": ..., "location": ..., ...}
            Returns: {"suggested_normal_state": ..., "suggested_chains": [chain_ids]}
            """
            # Heuristic: suggest normal state based on sensor type
            sensor_type = device_info.get("sensor_type", "").lower()
            normal_state = None
            if sensor_type in ("contact", "door", "window"):
                normal_state = "closed"
            elif sensor_type in ("motion", "pir"):
                normal_state = "inactive"
            elif sensor_type in ("pressure", "mat", "bed"):
                normal_state = "open"  # Not pressed
            elif sensor_type in ("leak", "water"):
                normal_state = "dry"
            elif sensor_type in ("switch",):
                normal_state = "off"
            # Search for chains where similar devices are present
            suggested_chains = []
            for scenario in self.scenarios:
                chain = scenario.get('events')
                if not chain:
                    continue
                for event in chain:
                    if event.get('sensor_type') == sensor_type:
                        suggested_chains.append(scenario.get('sequence_id', scenario.get('label', 'unknown_chain')))
                        break
            result = {
                "suggested_normal_state": normal_state,
                "suggested_chains": suggested_chains
            }
            self.diagnostics.append(f"Suggest for {device_info.get('sensor_id')}: {result}")
            return result
    def predict_next_event(self, recent_events: list) -> dict:
        """
        Given a list of recent events, try to match against known chains and predict the next likely event.
        Returns the predicted next event dict, or None if no match found.
        """
        # Only consider scenarios that are chains (have 'events' list)
        best_match = None
        best_match_length = 0
        for scenario in self.scenarios:
            chain = scenario.get('events')
            if not chain or len(chain) < 2:
                continue
            # Try to match as much of the chain as possible to the end of recent_events
            for i in range(len(chain) - 1):
                # Compare chain[i:i+N] to recent_events[-N:]
                N = len(recent_events)
                if N == 0 or i + N > len(chain):
                    continue
                match = True
                for j in range(N):
                    # Compare event_type and sensor_id (can expand as needed)
                    if (
                        chain[i + j].get('event_type') != recent_events[j].get('event_type') or
                        chain[i + j].get('sensor_id') != recent_events[j].get('sensor_id') or
                        chain[i + j].get('value') != recent_events[j].get('value')
                    ):
                        match = False
                        break
                if match and N > best_match_length:
                    best_match = chain[i + N] if (i + N) < len(chain) else None
                    best_match_length = N
        if best_match:
            self.diagnostics.append(f"Predicted next event: {best_match}")
        else:
            self.diagnostics.append("No prediction could be made from recent events.")
        return best_match

    def __init__(self):
        self.event_log: List[Dict[str, Any]] = []
        self.scenarios: List[Dict[str, Any]] = []
        self.diagnostics: List[str] = []


    def handle_event(self, event: Dict[str, Any]):
        """Process a new event (device, sensor, user, etc.)"""
        self.event_log.append(event)
        # Emergency call-out logic
        if event.get("event_type") == "call_out" and VOIP_AVAILABLE:
            message = event.get("message") or "Emergency detected. Please respond."
            escalation_level = event.get("escalation_level", 0)
            try:
                from voip_module import escalate_call_out
                result = escalate_call_out(message, escalation_level)
                self.diagnostics.append(f"Call-out escalation level {escalation_level}, success={result}")
            except Exception as e:
                self.diagnostics.append(f"Call-out escalation failed: {e}")
        # ...existing code...
        self.diagnostics.append(f"Event received: {event}")

    def add_scenario(self, scenario: Dict[str, Any]):
        """Add a labeled scenario for training/learning."""
        self.scenarios.append(scenario)
        self.diagnostics.append(f"Scenario added: {scenario.get('label', 'unlabeled')}")

    def get_diagnostics(self) -> List[str]:
        """Return current diagnostics and AI insights."""
        return self.diagnostics[-10:]  # Last 10 diagnostics

    def save_state(self, path: str):
        """Save current AI state to disk."""
        with open(path, 'w', encoding='utf-8') as f:
            json.dump({
                'event_log': self.event_log,
                'scenarios': self.scenarios,
                'diagnostics': self.diagnostics
            }, f, indent=2)

    def load_state(self, path: str):
        """Load AI state from disk."""
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            self.event_log = data.get('event_log', [])
            self.scenarios = data.get('scenarios', [])
            self.diagnostics = data.get('diagnostics', [])

    def list_scenarios(self) -> list:
        """Return a list of all scenarios with their index and label."""
        return [
            {"index": i, "label": s.get("label", f"unlabeled_{i}"), **s}
            for i, s in enumerate(self.scenarios)
        ]

    def delete_scenario(self, index: int) -> bool:
        """Delete a scenario by index. Returns True if deleted, False if not found."""
        if 0 <= index < len(self.scenarios):
            removed = self.scenarios.pop(index)
            self.diagnostics.append(f"Scenario deleted: {removed.get('label', 'unlabeled')}")
            return True
        return False

    def update_scenario(self, index: int, new_scenario: dict) -> bool:
        """Update a scenario by index. Returns True if updated, False if not found."""
        if 0 <= index < len(self.scenarios):
            self.scenarios[index] = new_scenario
            self.diagnostics.append(f"Scenario updated at index {index}: {new_scenario.get('label', 'unlabeled')}")
            return True
        return False

# Singleton instance for use throughout the system
ai_module = PredictiveAIModule()
