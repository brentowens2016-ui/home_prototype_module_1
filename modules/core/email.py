from fastapi import APIRouter, Request
from python_wrapper.email_service import send_email

email_router = APIRouter()

@email_router.post("/send-email")
async def send_email_endpoint(request: Request):
    data = await request.json()
    to = data.get("to")
    subject = data.get("subject")
    body = data.get("body")
    try:
        send_email(to, subject, body)
        return {"status": "sent"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}

@email_router.get("/email-log")
def get_email_log():
    import os, json
    log_path = os.path.join(os.path.dirname(__file__), "email_log.json")
    if not os.path.exists(log_path):
        return []
    try:
        with open(log_path, "r", encoding="utf-8") as f:
            log = json.load(f)
        return log
    except Exception as e:
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=500, content={"error": f"Failed to read email log: {str(e)}"})
