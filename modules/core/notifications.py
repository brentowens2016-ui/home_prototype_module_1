from fastapi import APIRouter, Request

notifications_router = APIRouter()

@notifications_router.post("/notify/sms")
async def send_sms(request: Request):
    data = await request.json()
    return {"status": "ok", "sent": data}

@notifications_router.post("/notify/push")
async def send_push(request: Request):
    data = await request.json()
    return {"status": "ok", "sent": data}
