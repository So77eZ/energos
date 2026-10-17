from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import defer, selectinload

from core.constants import OrderDirection
from core.database import SessionDep
from core.exceptions import ObjectNotFoundException
from models.energy_drink import EnergyDrink
from repositories.base import BaseRepository
from schemas.energy_drink import EnergyDrinkCreateSchema, EnergyDrinkUpdateSchema, ImageData


class EnergyDrinkRepository(BaseRepository[EnergyDrink, EnergyDrinkCreateSchema, EnergyDrinkUpdateSchema]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, EnergyDrink)

    async def create(self, create_schema: EnergyDrinkCreateSchema) -> EnergyDrink:
        model_instance = self.model(**create_schema.model_dump(exclude_unset=True))
        self.session.add(model_instance)
        await self.session.flush()
        await self.session.refresh(model_instance, attribute_names=["id", "created_at", "updated_at"])
        return model_instance

    async def get_many_with_reviews(
        self, limit: int = 20, offset: int = 0, order_by: str = "id", direction: OrderDirection = OrderDirection.ASC
    ) -> list[EnergyDrink]:
        query = select(self.model).options(
            defer(key=self.model.image), defer(self.model.image_content_type), selectinload(self.model.reviews)
        )
        result = await self.execute_get_many_query(
            query, limit=limit, offset=offset, order_by=order_by, direction=direction
        )
        return result

    async def get_by_id(self, id: int) -> EnergyDrink:
        query = (
            select(self.model)
            .filter(self.model.id == id)
            .options(defer(self.model.image), defer(self.model.image_content_type))
        )
        result = await self.session.execute(query)
        result = result.scalar_one_or_none()
        if not result:
            raise ObjectNotFoundException(f"{self.model.__verbose_name__} with id {id} not found")

        return result

    async def get_image_by_energy_drink_id(self, energy_drink_id: int) -> tuple[bool, ImageData | None]:
        query = select(self.model.image, self.model.image_content_type).where(self.model.id == energy_drink_id).limit(1)
        result = await self.session.execute(query)

        row = result.first()
        if row is None:
            return False, None

        return True, ImageData(data=row.image, content_type=row.image_content_type)


async def get_energy_drink_repository(session: SessionDep) -> EnergyDrinkRepository:
    return EnergyDrinkRepository(session)
