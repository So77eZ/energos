from fastapi import Depends, Request

from core.auth import get_verified_user
from core.rate_limiter import limiter
from core.router import AutoStatusAPIRouter
from models import User
from schemas.review import ReviewCreateInternalSchema, ReviewCreateSchema, ReviewSchema, ReviewUpdateSchema
from services.review import ReviewService, get_review_service

router = AutoStatusAPIRouter()


@router.get("/")
async def get_reviews(
    request: Request,
    limit: int = 20,
    offset: int = 0,
    order_by: str = "id",
    review_service: ReviewService = Depends(get_review_service),
) -> list[ReviewSchema]:
    return await review_service.get_many(limit=limit, offset=offset, order_by=order_by)


@router.post("/{energy_drink_id}")
@limiter.limit("10/minute")
async def create_review(
    request: Request,
    energy_drink_id: int,
    review_data: ReviewCreateSchema,
    current_user: User = Depends(get_verified_user),
    review_service: ReviewService = Depends(get_review_service),
) -> ReviewSchema:
    review_data = ReviewCreateInternalSchema(
        **review_data.model_dump(), user_id=current_user.id, energy_drink_id=energy_drink_id
    )
    review = await review_service.create(review_data)
    return ReviewSchema.model_validate(review)


@router.put("/{review_id}")
@limiter.limit("10/minute")
async def update_review(
    request: Request,
    review_id: int,
    review_data: ReviewUpdateSchema,
    current_user: User = Depends(get_verified_user),
    review_service: ReviewService = Depends(get_review_service),
) -> ReviewSchema:
    updated_review = await review_service.update_review(review_id, review_data, current_user.id)
    return ReviewSchema.model_validate(updated_review)


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
