from fastapi import APIRouter, Request

feedback_router = APIRouter()

@feedback_router.post("/feedback")
async def submit_feedback(request: Request):
    data = await request.json()
    return {"status": "ok", "received": data}
