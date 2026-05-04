from src.models.reviews import EnergyDrinkReview
from typing import List
from fastapi import APIRouter, HTTPException, Path, Depends, Request
from datetime import datetime, timezone

from src.schemas.reviews import EnergyDrinkReviewSchema, CreateEnergyDrinkReviewSchema
from src.api.auth import get_current_user
from src.database import async_session_maker
from src.rate_limit import limiter
from src.localization import localize_text
from sqlalchemy import select
from sqlalchemy.orm import joinedload

router = APIRouter()


async def _attach_usernames(
    rows: list[EnergyDrinkReview],
) -> list[EnergyDrinkReviewSchema]:
    schemas = []
    for row in rows:
        schema = EnergyDrinkReviewSchema.model_validate(row)
        schema.username = row.user.username if row.user else None
        schemas.append(schema)
    return schemas


@router.post("/", response_model=EnergyDrinkReviewSchema, status_code=201)
@limiter.limit("10/minute")
async def create_review(
    request: Request,
    payload: CreateEnergyDrinkReviewSchema,
    current_user=Depends(get_current_user),
) -> EnergyDrinkReviewSchema:
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    review = EnergyDrinkReview(
        **payload.model_dump(exclude={"from_admin"}),
        user_id=current_user.id,
        from_admin=current_user.role == "admin",
        created_at=now,
        updated_at=now,
    )
    async with async_session_maker() as session:
        session.add(review)
        await session.commit()
        await session.refresh(review)
        schema = EnergyDrinkReviewSchema.model_validate(review)
        schema.username = current_user.username
        return schema


@router.get("/", response_model=List[EnergyDrinkReviewSchema])
async def read_all_reviews() -> List[EnergyDrinkReviewSchema]:
    async with async_session_maker() as session:
        result = await session.execute(
            select(EnergyDrinkReview).options(joinedload(EnergyDrinkReview.user))
        )
        rows = list(result.scalars().unique().all())
        return await _attach_usernames(rows)


@router.get("/user/", response_model=List[EnergyDrinkReviewSchema])
async def read_reviews_by_user(
    current_user=Depends(get_current_user),
) -> List[EnergyDrinkReviewSchema]:
    async with async_session_maker() as session:
        result = await session.execute(
            select(EnergyDrinkReview)
            .options(joinedload(EnergyDrinkReview.user))
            .where(EnergyDrinkReview.user_id == current_user.id)
        )
        rows = list(result.scalars().unique().all())
        return await _attach_usernames(rows)


@router.get(
    "/energy-drink/{energy_drink_id}/", response_model=List[EnergyDrinkReviewSchema]
)
async def read_reviews_by_energy_drink(
    energy_drink_id: int = Path(ge=1),
) -> List[EnergyDrinkReviewSchema]:
    async with async_session_maker() as session:
        result = await session.execute(
            select(EnergyDrinkReview)
            .options(joinedload(EnergyDrinkReview.user))
            .where(EnergyDrinkReview.energy_drink_id == energy_drink_id)
        )
        rows = list(result.scalars().unique().all())
        return await _attach_usernames(rows)


@router.get("/{id}/", response_model=EnergyDrinkReviewSchema)
async def read_review(
    request: Request,
    id: int = Path(ge=1),
) -> EnergyDrinkReviewSchema:
    async with async_session_maker() as session:
        query = (
            select(EnergyDrinkReview)
            .options(joinedload(EnergyDrinkReview.user))
            .where(EnergyDrinkReview.id == id)
        )
        result = await session.execute(query)
        row = result.scalar_one_or_none()
        if row is None:
            raise HTTPException(status_code=404, detail=localize_text("review_not_found", request))
        schema = EnergyDrinkReviewSchema.model_validate(row)
        schema.username = row.user.username if row.user else None
        return schema


@router.put("/{id}/", response_model=EnergyDrinkReviewSchema)
async def update_review(
    request: Request,
    payload: EnergyDrinkReviewSchema,
    id: int = Path(ge=1),
    current_user=Depends(get_current_user),
) -> EnergyDrinkReviewSchema:
    async with async_session_maker() as session:
        query = (
            select(EnergyDrinkReview)
            .options(joinedload(EnergyDrinkReview.user))
            .where(EnergyDrinkReview.id == id)
        )
        result = await session.execute(query)
        existing = result.scalar_one_or_none()
        if not existing:
            raise HTTPException(status_code=404, detail=localize_text("review_not_found", request))
        if existing.user_id != current_user.id and current_user.role != "admin":
            raise HTTPException(status_code=403, detail=localize_text("not_allowed", request))
        update_data = payload.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            if (
                key not in ["id", "created_at", "updated_at", "username", "from_admin"]
                and value is not None
            ):
                setattr(existing, key, value)
        existing.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
        await session.commit()
        schema = EnergyDrinkReviewSchema.model_validate(existing)
        schema.username = existing.user.username if existing.user else None
        return schema


@router.delete("/{id}/", response_model=EnergyDrinkReviewSchema)
async def delete_review(
    request: Request,
    id: int = Path(ge=1),
    current_user=Depends(get_current_user),
) -> EnergyDrinkReviewSchema:
    async with async_session_maker() as session:
        query = (
            select(EnergyDrinkReview)
            .options(joinedload(EnergyDrinkReview.user))
            .where(EnergyDrinkReview.id == id)
        )
        result = await session.execute(query)
        existing = result.scalar_one_or_none()
        if not existing:
            raise HTTPException(status_code=404, detail=localize_text("review_not_found", request))
        if existing.user_id != current_user.id and current_user.role != "admin":
            raise HTTPException(status_code=403, detail=localize_text("not_allowed", request))
        schema = EnergyDrinkReviewSchema.model_validate(existing)
        schema.username = existing.user.username if existing.user else None
        await session.delete(existing)
        await session.commit()
        return schema
