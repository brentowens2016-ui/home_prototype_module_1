from fastapi import APIRouter

hdmi_router = APIRouter()

@hdmi_router.get("/hdmi-hubs")
def list_hdmi_hubs():
    import os, json
    try:
        with open(os.path.join(os.path.dirname(__file__), "../../python_wrapper/device_mapping.json"), "r", encoding="utf-8") as f:
            mapping = json.load(f)
        hubs = [dev for dev in mapping if dev.get("type") == "hdmi_hub"]
        return hubs
    except Exception as e:
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=500, content={"error": str(e)})
