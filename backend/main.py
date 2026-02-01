from fastapi import FastAPI, Response
from fastapi.responses import JSONResponse
import os

app = FastAPI()

@app.get("/dashboard-data")
def dashboard_data():
    # Simulate user tier and features; replace with real user/session logic
    user_tier = "basic"
    features = [
        {"name": "AI Controls & Settings", "tier": "basic", "enabled": True, "controls": []},
        {"name": "Audio/Video Controls & Settings", "tier": "basic", "enabled": True, "controls": []},
        {"name": "Monitoring Controls & Settings", "tier": "basic", "enabled": True, "controls": []},
        {"name": "Mapping Controls & Settings", "tier": "basic", "enabled": True, "controls": []},
        {"name": "Map Editor", "tier": "basic", "enabled": True, "controls": []}
    ]
    return JSONResponse({"user_tier": user_tier, "features": features})

FRONTEND_PATH = os.path.join(os.path.dirname(__file__), '..', 'frontend')
UNDER_CONSTRUCTION_FILE = os.path.join(FRONTEND_PATH, 'under-construction.html')

def get_under_construction_html():
    with open(UNDER_CONSTRUCTION_FILE, encoding='utf-8') as f:
        return f.read()

@app.get("/{full_path:path}")
def under_construction(full_path: str):
    html = get_under_construction_html()
    return Response(content=html, media_type="text/html")
