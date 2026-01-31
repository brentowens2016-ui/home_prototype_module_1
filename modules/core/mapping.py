from fastapi import APIRouter, Request
from python_wrapper.mapping_engine import get_mapping as engine_get_mapping, set_mapping as engine_set_mapping, validate_mapping as engine_validate_mapping

mapping_router = APIRouter()

@mapping_router.get("/mapping")
def get_device_mapping():
    return engine_get_mapping()

@mapping_router.post("/mapping")
async def upload_device_mapping(request: Request):
    try:
        mapping = await request.json()
        err = engine_validate_mapping(mapping)
        if err:
            from fastapi.responses import JSONResponse
            return JSONResponse(status_code=400, content={"error": err})
        engine_set_mapping(mapping)
        return {"status": "ok"}
    except Exception as e:
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=400, content={"error": str(e)})
