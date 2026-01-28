"""
scenario_input.py: Interactive scenario/event input for Predictive AI Module

Usage:
- Run this script in the python_wrapper/ directory:
    python scenario_input.py
- Choose to add an event/scenario from a file or enter one interactively.
- View AI diagnostics and feedback after each input.
"""

import json
import os
from predictive_ai import ai_module

def load_event_from_file():
    path = input("Enter path to event/scenario JSON file (default: event_template.json): ").strip() or "event_template.json"
    if not os.path.exists(path):
        print(f"File not found: {path}")
        return None
    with open(path, 'r', encoding='utf-8') as f:
        try:
            event = json.load(f)
            print(f"Loaded event: {event}")
            return event
        except Exception as e:
            print(f"Error loading JSON: {e}")
            return None

def enter_event_interactively():
    print("Enter event fields (leave blank to skip):")
    event = {}
    event['event_type'] = input("event_type (e.g., sensor_trigger, user_action): ").strip()
    event['label'] = input("label (e.g., Open_Front_Door): ").strip()
    event['sensor_type'] = input("sensor_type (e.g., contact, motion): ").strip()
    event['sensor_id'] = input("sensor_id (e.g., front_door_contact): ").strip()
    event['location'] = input("location (e.g., Front Door): ").strip()
    event['value'] = input("value (e.g., open, closed, on, off): ").strip()
    event['timestamp'] = input("timestamp (leave blank for now): ").strip()
    if not event['timestamp']:
        import time
        event['timestamp'] = int(time.time())
    else:
        event['timestamp'] = int(event['timestamp'])
    print(f"Created event: {event}")
    return event

def main():
    print("=== Predictive AI Module: Scenario/Event Input ===")
    while True:
        print("\nOptions:")
        print("1. Add event/scenario from file")
        print("2. Enter event/scenario interactively")
        print("3. View AI diagnostics")
        print("4. Save AI state to file")
        print("5. Load AI state from file")
        print("6. List all scenarios/events")
        print("7. Delete a scenario/event by index")
        print("8. Update a scenario/event by index")
        print("0. Exit")
        choice = input("Select option: ").strip()
        if choice == '1':
            event = load_event_from_file()
            if event:
                ai_module.add_scenario(event)
                print("Event/scenario added to AI module.")
        elif choice == '2':
            event = enter_event_interactively()
            ai_module.add_scenario(event)
            print("Event/scenario added to AI module.")
        elif choice == '3':
            print("\nAI Diagnostics (last 10):")
            for diag in ai_module.get_diagnostics():
                print(f"- {diag}")
        elif choice == '4':
            path = input("Enter path to save AI state (default: ai_state.json): ").strip() or "ai_state.json"
            ai_module.save_state(path)
            print(f"AI state saved to {path}")
        elif choice == '5':
            path = input("Enter path to load AI state (default: ai_state.json): ").strip() or "ai_state.json"
            if os.path.exists(path):
                ai_module.load_state(path)
                print(f"AI state loaded from {path}")
            else:
                print(f"File not found: {path}")
        elif choice == '6':
            scenarios = ai_module.list_scenarios()
            if not scenarios:
                print("No scenarios/events found.")
            else:
                print("\nCurrent scenarios/events:")
                for s in scenarios:
                    print(f"Index {s['index']}: Label={s.get('label', 'unlabeled')} | Data={s}")
        elif choice == '7':
            idx = input("Enter index of scenario/event to delete: ").strip()
            if idx.isdigit():
                idx = int(idx)
                if ai_module.delete_scenario(idx):
                    print(f"Scenario/event at index {idx} deleted.")
                else:
                    print(f"No scenario/event at index {idx}.")
            else:
                print("Invalid index.")
        elif choice == '8':
            idx = input("Enter index of scenario/event to update: ").strip()
            if idx.isdigit():
                idx = int(idx)
                print("Enter new data for the scenario/event:")
                new_event = enter_event_interactively()
                if ai_module.update_scenario(idx, new_event):
                    print(f"Scenario/event at index {idx} updated.")
                else:
                    print(f"No scenario/event at index {idx}.")
            else:
                print("Invalid index.")
        elif choice == '0':
            print("Exiting.")
            break
        else:
            print("Invalid option. Try again.")

if __name__ == "__main__":
    main()
