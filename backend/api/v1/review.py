from fastapi import Depends, Request

from core.auth import get_verified_user
from core.constants import OrderDirection
from core.rate_limiter import limiter
from core.router import AutoStatusAPIRouter
from models import User
from schemas.review import ReviewCreateSchema, ReviewReadSchema, ReviewUpdateSchema
from services.review import ReviewService, get_review_service

router = AutoStatusAPIRouter()


@router.get("/")
async def get_reviews_by_energy_drink(
    request: Request,
    energy_drink_id: int,
    limit: int = 20,
    offset: int = 0,
    order_by: str = "id",
    order_direction: OrderDirection = OrderDirection.ASC,
    review_service: ReviewService = Depends(get_review_service),
) -> list[ReviewReadSchema]:
    return await review_service.get_many_by_energy_drink_id(
        energy_drink_id=energy_drink_id, limit=limit, offset=offset, order_by=order_by, direction=order_direction
    )


@router.post("/{energy_drink_id}")
@limiter.limit("10/minute")
async def create_review(
    request: Request,
    energy_drink_id: int,
    review_data: ReviewCreateSchema,
    current_user: User = Depends(get_verified_user),
    review_service: ReviewService = Depends(get_review_service),
) -> ReviewReadSchema:
    return await review_service.create_review(review_data, user_id=current_user.id, energy_drink_id=energy_drink_id)


@router.put("/{review_id}")
@limiter.limit("10/minute")
async def update_review(
    request: Request,
    review_id: int,
    review_data: ReviewUpdateSchema,
    current_user: User = Depends(get_verified_user),
    review_service: ReviewService = Depends(get_review_service),
) -> ReviewReadSchema:
    return await review_service.update_review(id=review_id, data=review_data, current_user_id=current_user.id)


@router.delete("/{review_id}")
@limiter.limit("10/minute")
async def delete_review(
    request: Request,
    review_id: int,
    current_user: User = Depends(get_verified_user),
    review_service: ReviewService = Depends(get_review_service),
) -> None:
    await review_service.delete_review_by_id(review_id, current_user.id)
    return None


@router.get("/me")
@limiter.limit("100/minute")
async def get_my_reviews(
    request: Request,
    limit: int = 20,
    offset: int = 0,
    order_by: str = "id",
    current_user: User = Depends(get_verified_user),
    review_service: ReviewService = Depends(get_review_service),
) -> list[ReviewReadSchema]:
    return await review_service.get_many_by_user_id(
        user_id=current_user.id, limit=limit, offset=offset, order_by=order_by
    )
