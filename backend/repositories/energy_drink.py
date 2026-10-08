from typing import Annotated

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import defer, selectinload

from core.database import get_session
from models.energy_drink import EnergyDrink
from repositories.base import BaseRepository
from schemas.energy_drink import EnergyDrinkCreateSchema, EnergyDrinkUpdateSchema, ImageData


class EnergyDrinkRepository(BaseRepository[EnergyDrink, EnergyDrinkCreateSchema, EnergyDrinkUpdateSchema]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, EnergyDrink)

    async def get_many_with_reviews(self, limit: int = 20, offset: int = 0, order_by: str = "id") -> list[EnergyDrink]:
        query = (
            select(self.model)
            .options(defer(self.model.image), defer(self.model.image_content_type), selectinload(self.model.reviews))
            .offset(offset)
            .limit(limit)
            .order_by(getattr(self.model, order_by))
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_image_by_id(self, energy_drink_id: int) -> tuple[bool, ImageData | None]:
        query = (
            select(self.model.id, self.model.image, self.model.image_content_type)
            .filter(self.model.id == energy_drink_id)
            .limit(1)
        )
        result = await self.session.execute(query)

        energy_drink = result.first()
        if energy_drink is None:
            return False, None

        _, image_data, content_type = energy_drink
        return True, ImageData(data=image_data, content_type=content_type)


async def get_energy_drink_repository(session: Annotated[AsyncSession, Depends(get_session)]) -> EnergyDrinkRepository:
    return EnergyDrinkRepository(session)
