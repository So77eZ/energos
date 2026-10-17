from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from core.constants import OrderDirection
from core.database import SessionDep
from core.exceptions import ObjectNotFoundException
from models.review import Review
from repositories.base import BaseRepository
from schemas.review import ReviewCreateSchema, ReviewUpdateSchema


class ReviewRepository(BaseRepository[Review, ReviewCreateSchema, ReviewUpdateSchema]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Review)

    async def get_reviews_by_energy_drink_id(
        self,
        energy_drink_id: int,
        limit: int = 20,
        offset: int = 0,
        order_by: str = "id",
        direction: OrderDirection = OrderDirection.ASC,
    ) -> list[Review]:
        query = (
            select(self.model).where(self.model.energy_drink_id == energy_drink_id).options(selectinload(Review.user))
        )
        return await self.execute_get_many_query(
            query, limit=limit, offset=offset, order_by=order_by, direction=direction
        )

    async def get_many_by_user_id(
        self,
        user_id: int,
        limit: int = 20,
        offset: int = 0,
        order_by: str = "id",
        direction: OrderDirection = OrderDirection.ASC,
    ) -> list[Review]:
        query = select(self.model).where(self.model.user_id == user_id)
        return await self.execute_get_many_query(
            query, limit=limit, offset=offset, order_by=order_by, direction=direction
        )

    async def exists_by_user_and_energy_drink(self, user_id: int, energy_drink_id: int) -> bool:
        stmt = (
            select(Review.id)
            .where(
                Review.user_id == user_id,
                Review.energy_drink_id == energy_drink_id,
            )
            .limit(1)
        )
        return (await self.session.execute(stmt)).scalar_one_or_none() is not None

    async def get_author_id(self, review_id: int) -> int:
        stmt = select(Review.user_id).where(Review.id == review_id)
        result = await self.session.execute(stmt)
        author_id = result.scalar_one_or_none()
        if author_id is None:
            raise ObjectNotFoundException(f"{self.model.__verbose_name__} with id {review_id} not found")
        return author_id


async def get_review_repository(session: SessionDep) -> ReviewRepository:
    return ReviewRepository(session)
