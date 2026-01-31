from fastapi import APIRouter

privacy_router = APIRouter()

@privacy_router.get("/privacy/data-info")
def privacy_data_info():
    return {
        "collected": ["device mapping", "alerts", "logs", "user settings", "event history"],
        "storage": "Local server (encrypted)",
        "retention": "User-managed, auto-wipe after 1 year or on request"
    }
