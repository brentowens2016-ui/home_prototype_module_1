from fastapi import APIRouter, Request

guests_router = APIRouter()

@guests_router.post("/guests/add")
async def add_guest(request: Request):
    data = await request.json()
    return {"status": "ok", "guest": data}

@guests_router.post("/guests/remove")
async def remove_guest(request: Request):
    data = await request.json()
    return {"status": "ok", "guest": data}

@guests_router.get("/guests/list")
def list_guests():
    return []
