from datetime import datetime, timezone

from app.api.models.reviews import EnergyDrinkReview, EnergyDrinkReviewSchema
from app.database import async_session_maker
from sqlalchemy import select


async def post(
    payload: EnergyDrinkReviewSchema, user_id: int, is_admin: bool = False
) -> EnergyDrinkReview:
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    review = EnergyDrinkReview(
        **payload.model_dump(
            exclude={"id", "user_id", "created_at", "updated_at", "from_admin"}
        ),
        user_id=user_id,
        from_admin=is_admin,
        created_at=now,
        updated_at=now,
    )
    async with async_session_maker() as session:
        session.add(review)
        await session.commit()
        await session.refresh(review)
        return review


async def query_review_by_id(session, id: int) -> EnergyDrinkReview | None:
    query = select(EnergyDrinkReview).where(EnergyDrinkReview.id == id)
    result = await session.execute(query)
    return result.scalar_one_or_none()


async def get(id: int) -> EnergyDrinkReview | None:
    async with async_session_maker() as session:
        row = await query_review_by_id(session, id)
        if row is None:
            return None
        return row


async def get_all() -> list[EnergyDrinkReview]:
    async with async_session_maker() as session:
        query = select(EnergyDrinkReview)
        result = await session.execute(query)
        rows = result.scalars().all()
        return [row for row in rows]


async def get_by_energy_drink_id(energy_drink_id: int) -> list[EnergyDrinkReview]:
    async with async_session_maker() as session:
        query = select(EnergyDrinkReview).where(
            EnergyDrinkReview.energy_drink_id == energy_drink_id
        )
        result = await session.execute(query)
        rows = result.scalars().all()
        return [row for row in rows]


async def get_by_user_id(user_id: int) -> list[EnergyDrinkReview]:
    async with async_session_maker() as session:
        query = select(EnergyDrinkReview).where(EnergyDrinkReview.user_id == user_id)
        result = await session.execute(query)
        rows = result.scalars().all()
        return [row for row in rows]


async def put(id: int, payload: EnergyDrinkReviewSchema) -> EnergyDrinkReview | None:
    async with async_session_maker() as session:
        row = await query_review_by_id(session, id)
        if row is None:
            return None
        update_data = payload.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            if key not in ["id", "created_at", "updated_at"] and value is not None:
                setattr(row, key, value)
        row.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
        await session.commit()
        return row


async def delete(id: int) -> EnergyDrinkReview | None:
    async with async_session_maker() as session:
        row = await query_review_by_id(session, id)
        if row is None:
            return None
        deleted_review = row
        await session.delete(row)
        await session.commit()
        return deleted_review
