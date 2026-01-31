from fastapi import APIRouter, Request

automation_router = APIRouter()

@automation_router.post("/automation/schedule")
async def schedule_automation(request: Request):
    data = await request.json()
    return {"status": "ok", "schedule": data}

@automation_router.get("/automation/schedules")
def list_schedules():
    return []
