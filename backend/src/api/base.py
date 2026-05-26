from fastapi import APIRouter

from src.api import energy_drink, auth, reviews, review_emoji, energy_drink_add_request

api_router = APIRouter()
api_router.include_router(
    energy_drink.router, prefix="/energy-drinks", tags=["energy-drinks"]
)
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
api_router.include_router(
    review_emoji.router, prefix="/reviews", tags=["review-emojis"]
)
api_router.include_router(
    energy_drink_add_request.router,
    prefix="/add-requests",
    tags=["energy-drink-add-requests"],
)
