from fastapi import APIRouter, Request

audio_router = APIRouter()

@audio_router.get("/audio/devices")
def api_list_audio_devices():
    from python_wrapper.audio_mapping_api import list_audio_devices
    return list_audio_devices()

@audio_router.get("/audio/room_map")
def api_get_audio_room_map():
    from python_wrapper.audio_mapping_api import get_audio_room_map
    return get_audio_room_map()

@audio_router.post("/audio/map_room")
async def api_map_audio_device_to_room(request: Request):
    from python_wrapper.audio_mapping_api import map_audio_device_to_room, RoomMappingRequest
    data = await request.json()
    req = RoomMappingRequest(**data)
    return map_audio_device_to_room(req)

@audio_router.get("/audio/config")
def api_get_audio_config():
    from python_wrapper.audio_config_api import get_audio_config
    return get_audio_config()

@audio_router.post("/audio/config")
async def api_set_audio_config(request: Request):
    from python_wrapper.audio_config_api import set_audio_config, AudioConfigModel
    data = await request.json()
    cfg = AudioConfigModel(**data)
    return set_audio_config(cfg)

@audio_router.get("/audio-endpoints")
def list_audio_endpoints():
    import os, json
    try:
        with open(os.path.join(os.path.dirname(__file__), "../../python_wrapper/device_mapping.json"), "r", encoding="utf-8") as f:
            mapping = json.load(f)
        endpoints = [
            {
                "id": dev.get("id"),
                "location": dev.get("location"),
                "hardware": dev.get("hardware"),
                "features": dev.get("features"),
                "type": dev.get("type"),
                "function": dev.get("function"),
            }
            for dev in mapping if dev.get("type") in ("hdmi_hub", "audio_endpoint")
        ]
        return endpoints
    except Exception as e:
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=500, content={"error": str(e)})
