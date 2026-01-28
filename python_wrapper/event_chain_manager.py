"""
event_chain_manager.py: Manage serial (chained) event scenarios for Predictive AI Module

Features:
- Create, edit, and delete event chains (sequences of events)
- Store chains as JSON for easy loading and training
- Integrate with predictive_ai.py for scenario learning

Usage:
- Run this script in python_wrapper/ to manage event chains interactively
"""

import json
import os
from predictive_ai import ai_module

def load_chain_from_file():
    path = input("Enter path to event chain JSON file: ").strip()
    if not os.path.exists(path):
        print(f"File not found: {path}")
        return None
    with open(path, 'r', encoding='utf-8') as f:
        try:
            chain = json.load(f)
            print(f"Loaded chain: {chain.get('sequence_id', 'no id')}")
            return chain
        except Exception as e:
            print(f"Error loading JSON: {e}")
            return None

def enter_chain_interactively():
    chain = {}
    chain['sequence_id'] = input("Enter sequence ID (e.g., morning_routine_1): ").strip()
    chain['label'] = input("Enter label/description: ").strip()
    chain['events'] = []
    print("Enter events for this chain (leave event_type blank to finish):")
    while True:
        event_type = input("  event_type: ").strip()
        if not event_type:
            break
        event = {
            'event_type': event_type,
            'sensor_id': input("  sensor_id: ").strip(),
            'value': input("  value: ").strip(),
            'timestamp': input("  timestamp (optional): ").strip()
        }
        # Remove empty fields
        event = {k: v for k, v in event.items() if v}
        chain['events'].append(event)
    print(f"Created chain: {chain}")
    return chain

def main():
    chains = []
    chains_file = "event_chains.json"
    if os.path.exists(chains_file):
        with open(chains_file, 'r', encoding='utf-8') as f:
            chains = json.load(f)
    print("=== Event Chain Manager ===")
    while True:
        print("\nOptions:")
        print("1. Add event chain from file")
        print("2. Enter event chain interactively")
        print("3. List all event chains")
        print("4. Delete event chain by index")
        print("5. Save chains to file")
        print("6. Load chains from file")
        print("7. Add chain to AI module as scenario")
        print("0. Exit")
        choice = input("Select option: ").strip()
        if choice == '1':
            chain = load_chain_from_file()
            if chain:
                chains.append(chain)
                print("Chain added.")
        elif choice == '2':
            chain = enter_chain_interactively()
            chains.append(chain)
            print("Chain added.")
        elif choice == '3':
            if not chains:
                print("No chains found.")
            else:
                for i, c in enumerate(chains):
                    print(f"Index {i}: ID={c.get('sequence_id', 'no id')} | Label={c.get('label', '')} | Events={len(c.get('events', []))}")
        elif choice == '4':
            idx = input("Enter index of chain to delete: ").strip()
            if idx.isdigit():
                idx = int(idx)
                if 0 <= idx < len(chains):
                    del chains[idx]
                    print(f"Chain at index {idx} deleted.")
                else:
                    print("Invalid index.")
            else:
                print("Invalid index.")
        elif choice == '5':
            with open(chains_file, 'w', encoding='utf-8') as f:
                json.dump(chains, f, indent=2)
            print(f"Chains saved to {chains_file}")
        elif choice == '6':
            if os.path.exists(chains_file):
                with open(chains_file, 'r', encoding='utf-8') as f:
                    chains = json.load(f)
                print(f"Chains loaded from {chains_file}")
            else:
                print(f"File not found: {chains_file}")
        elif choice == '7':
            idx = input("Enter index of chain to add to AI module: ").strip()
            if idx.isdigit():
                idx = int(idx)
                if 0 <= idx < len(chains):
                    ai_module.add_scenario(chains[idx])
                    print(f"Chain at index {idx} added to AI module as scenario.")
                else:
                    print("Invalid index.")
            else:
                print("Invalid index.")
        elif choice == '0':
            print("Exiting.")
            break
        else:
            print("Invalid option. Try again.")

if __name__ == "__main__":
    main()
