"""
voip_module.py: VOIP integration for emergency call-out events

Features:
- Detects if VOIP (Twilio) credentials/config are available
- Provides function to place a call to a specified number
- Can be triggered by AI module events (e.g., 'call_out' for emergency services)

Dependencies:
- twilio (install with: pip install twilio)

Usage:
- Import and call voip_module.place_call(phone_number, message)
- AI module can trigger this for emergency events
"""


import os
import json
from twilio.rest import Client

# Read Twilio credentials from environment variables or config
TWILIO_SID = os.getenv('TWILIO_ACCOUNT_SID')
TWILIO_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
TWILIO_FROM = os.getenv('TWILIO_FROM_NUMBER')


# Load emergency contacts
CONTACTS_FILE = os.path.join(os.path.dirname(__file__), "emergency_contacts.json")
def load_contacts():
    try:
        with open(CONTACTS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data
    except Exception:
        return {"emergency_services": {"name": "911", "phone": "911"}, "contacts": []}

contacts_data = load_contacts()

VOIP_AVAILABLE = all([TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM])

client = None
if VOIP_AVAILABLE:
    client = Client(TWILIO_SID, TWILIO_TOKEN)


def place_call(phone_number, message):
    """
    Place a VOIP call to the specified phone number with a message (text-to-speech).
    Returns True if call initiated, False otherwise.
    """
    if not VOIP_AVAILABLE:
        print("VOIP not available: Twilio credentials missing.")
        return False
    try:
        call = client.calls.create(
            to=phone_number,
            from_=TWILIO_FROM,
            twiml=f'<Response><Say>{message}</Say></Response>'
        )
        print(f"Call initiated: SID={call.sid}")
        return True
    except Exception as e:
        print(f"VOIP call failed: {e}")
        return False

def escalate_call_out(message, escalation_level=0):
    """
    Escalate call-out: 0 = emergency services, 1-7 = contacts in order
    """
    if escalation_level == 0:
        phone = contacts_data["emergency_services"]["phone"]
        name = contacts_data["emergency_services"]["name"]
    else:
        contacts = contacts_data.get("contacts", [])
        if 0 < escalation_level <= len(contacts):
            contact = contacts[escalation_level - 1]
            phone = contact.get("phone", "")
            name = contact.get("name", f"Contact {escalation_level}")
        else:
            print("No contact for escalation level", escalation_level)
            return False
    if phone:
        print(f"Escalating call-out to {name} at {phone}")
        return place_call(phone, message)
    else:
        print(f"No phone number for {name}")
        return False
