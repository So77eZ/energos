from fastapi import Depends
from fastapi_limitex import RateLimiter

from api.v1 import auth, energy_drink, review
from core.router import AutoStatusAPIRouter

api_router_v1 = AutoStatusAPIRouter(prefix="/v1")
api_router_v1.include_router(
    auth.router, prefix="/auth", tags=["auth"], dependencies=[Depends(RateLimiter("10/minute"))]
)
api_router_v1.include_router(auth.users_router, prefix="/auth", tags=["auth"])
api_router_v1.include_router(energy_drink.router, prefix="/energy-drinks", tags=["energy-drinks"])
api_router_v1.include_router(review.router, prefix="/reviews", tags=["reviews"])
