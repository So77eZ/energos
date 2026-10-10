from typing import Annotated

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_session
from models.review import Review
from repositories.base import BaseRepository
from schemas.review import ReviewCreateSchema, ReviewUpdateSchema


class ReviewRepository(BaseRepository[Review, ReviewCreateSchema, ReviewUpdateSchema]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Review)

    async def get_reviews_by_energy_drink_id(
        self, energy_drink_id: int, limit: int = 20, offset: int = 0
    ) -> list[Review]:
        query = (
            select(self.model)
            .where(self.model.energy_drink_id == energy_drink_id)
            .offset(offset)
            .limit(limit)
            .order_by(self.model.id)
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_many_by_user_id(
        self, user_id: int, limit: int = 20, offset: int = 0, order_by: str = "id"
    ) -> list[Review]:
        query = (
            select(self.model)
            .where(self.model.user_id == user_id)
            .offset(offset)
            .limit(limit)
            .order_by(getattr(self.model, order_by))
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())


async def get_review_repository(session: Annotated[AsyncSession, Depends(get_session)]) -> ReviewRepository:
    return ReviewRepository(session)
