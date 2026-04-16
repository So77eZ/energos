from fastapi import APIRouter

from app.api.endpoints import energy_drink, auth, reviews

api_router = APIRouter()
api_router.include_router(
    energy_drink.router, prefix="/energy-drinks", tags=["energy-drinks"]
)
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
