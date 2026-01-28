import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from fastapi.testclient import TestClient
from python_wrapper.api import app

def run_tests():
    client = TestClient(app)
    print("Testing GET /mapping...")
    resp = client.get('/mapping')
    print('GET /mapping:', resp.status_code, resp.json())

    print("Testing POST /mapping (valid)...")
    valid_mapping = [
        {"id": "zigbee_0x00158d0001a2b3c4", "location": "Bed 1", "type": "pressure", "function": "bed_occupied"},
        {"id": "zigbee_0x00158d0001a2b3c5", "location": "Chair 2", "type": "pressure"}
    ]
    resp = client.post('/mapping', json=valid_mapping)
    print('POST /mapping (valid):', resp.status_code, resp.json())

    print("Testing POST /mapping (duplicate id)...")
    invalid_mapping = [
        {"id": "zigbee_0x00158d0001a2b3c4", "location": "Bed 1", "type": "pressure"},
        {"id": "zigbee_0x00158d0001a2b3c4", "location": "Chair 2", "type": "pressure"}
    ]
    resp = client.post('/mapping', json=invalid_mapping)
    print('POST /mapping (duplicate id):', resp.status_code, resp.json())

    print("Testing POST /mapping (missing field)...")
    invalid_mapping2 = [
        {"id": "zigbee_0x00158d0001a2b3c4", "location": "Bed 1"}
    ]
    resp = client.post('/mapping', json=invalid_mapping2)
    print('POST /mapping (missing field):', resp.status_code, resp.json())

if __name__ == "__main__":
    run_tests()
