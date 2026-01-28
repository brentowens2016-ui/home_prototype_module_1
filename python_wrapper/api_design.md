# Device Health & Alerts API

## Endpoints

### GET /alerts
Returns all unacknowledged device-down/removed alerts.

**Response Example:**
```
[
	{
		"device_id": "zigbee_0x00158d0001a2b3c4",
		"event": "down",
		"timestamp": 1769567805,
		"acknowledged": false
	}
]
```

### POST /alerts/ack?device_id=...
Acknowledge a device alert locally. Does not affect remote/monitoring notifications.

**Response:**
- 200 OK: `{ "status": "ok" }`

## Contract

- Device health is tracked per device (up/down/removed, last_seen timestamp).
- Alerts are generated for any device going down or being removed.
- Alerts must be acknowledged by the user in the UI, but are always sent to remote/monitoring endpoints.
- The system is resilient: any device can be missing, removed, or replaced without breaking overall operation.
# Device Mapping API

## Endpoints

### GET /mapping
Returns the current device mapping as a JSON array.

**Response Example:**
```
[
	{
		"id": "zigbee_0x00158d0001a2b3c4",
		"location": "Bed 1",
		"type": "pressure",
		"function": "bed_occupied"
	},
	...
]
```

### POST /mapping
Accepts a new device mapping (JSON array). Validates schema and uniqueness of IDs. Overwrites the current mapping if valid.

**Request Example:**
```
[
	{
		"id": "zigbee_0x00158d0001a2b3c4",
		"location": "Bed 1",
		"type": "pressure",
		"function": "bed_occupied"
	}
]
```

**Response:**
- 200 OK: `{ "status": "ok" }`
- 400 Bad Request: `{ "error": "..." }`

## Contract

Each mapping entry must include:
- `id` (string, required): Unique device identifier (e.g., Zigbee address)
- `location` (string, required): Physical or logical location
- `type` (string, required): Device type (e.g., "pressure", "router")
- `function` (string, optional): Logical function or automation trigger
- `room` (string, optional): Room or zone name for placement
- `x` (number, optional): X coordinate for spatial placement
- `y` (number, optional): Y coordinate for spatial placement

All IDs must be unique. All required fields must be present. See [mapping_loader.py](../python_wrapper/mapping_loader.py) for schema and validation logic.
# REST API design for Smart Home Devices

## Endpoints

### Bulbs
- `GET /bulbs` — List all bulbs and their status
- `POST /bulbs/{name}/on` — Turn on a bulb
- `POST /bulbs/{name}/off` — Turn off a bulb
- `POST /bulbs/{name}/brightness` — Set brightness (body: `{ "brightness": 0-100 }`)
- `POST /bulbs/{name}/color` — Set color (body: `{ "r": 0-255, "g": 0-255, "b": 0-255 }`)

### Devices (future expansion)
- `GET /devices` — List all devices
- `POST /devices/add` — Add a new device (body: device info)

## Notes
- All endpoints return JSON.
- Designed for easy expansion to new device types.
- Web dashboard will consume these endpoints.
