from fastapi import APIRouter

energy_router = APIRouter()

@energy_router.get("/energy/usage")
def get_energy_usage():
    return {"devices": [], "total_kwh": 0, "suggestions": []}
