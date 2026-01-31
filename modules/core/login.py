from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse

login_router = APIRouter()

@login_router.post("/login")
async def login(request: Request):
    try:
        data = await request.json()
        username = data.get("username")
        password = data.get("password")
        if username == "admin" and password == "admin":
            return {"username": username, "role": "admin", "token": "fake-jwt-token"}
        elif username == "user" and password == "user":
            return {"username": username, "role": "user", "token": "fake-jwt-token"}
        else:
            raise HTTPException(status_code=401, detail="Invalid username or password")
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
