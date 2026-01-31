from fastapi import APIRouter
import pathlib
from fastapi.responses import JSONResponse

static_router = APIRouter()

@static_router.get("/")
def serve_index():
    index_path = pathlib.Path(__file__).parent.parent.parent / "dashboard" / "index.html"
    if index_path.exists():
        with open(index_path, "r", encoding="utf-8") as f:
            return f.read()
    return JSONResponse(status_code=404, content={"error": "index.html not found"})
