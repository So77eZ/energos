from fastapi import APIRouter

from app.api.endpoints import energy_drink

api_router = APIRouter()
api_router.include_router(
    energy_drink.router, prefix="/energy-drinks", tags=["energy-drinks"]
)
