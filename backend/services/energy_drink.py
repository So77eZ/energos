from typing import Annotated

from fastapi import Depends, UploadFile

from models.energy_drink import EnergyDrink
from repositories.energy_drink import EnergyDrinkRepository, get_energy_drink_repository
from schemas.energy_drink import EnergyDrinkCreateSchema, EnergyDrinkUpdateSchema, ImageData
from services.base import BaseService


class EnergyDrinkService(
    BaseService[EnergyDrink, EnergyDrinkCreateSchema, EnergyDrinkUpdateSchema, EnergyDrinkRepository]
):
    def __init__(self, repository: EnergyDrinkRepository):
        self.repository = repository

    async def update_image(self, energy_drink_id: int, image_file: UploadFile) -> EnergyDrink:
        energy_drink = await self.get_by_id(energy_drink_id)

        image_data = await image_file.read()
        energy_drink.image = image_data
        energy_drink.image_content_type = image_file.content_type

        return await self.repository.update(energy_drink)

    async def get_many_with_reviews(self, limit: int = 20, offset: int = 0, order_by: str = "id") -> list[EnergyDrink]:
        return await self.repository.get_many_with_reviews(limit=limit, offset=offset, order_by=order_by)

    async def get_image_by_id(self, energy_drink_id: int) -> tuple[bool, ImageData | None]:
        return await self.repository.get_image_by_id(energy_drink_id)

    async def delete_image(self, energy_drink_id: int) -> None:
        energy_drink = await self.get_by_id(energy_drink_id)
        energy_drink.image = None
        energy_drink.image_content_type = None
        await self.repository.update(energy_drink)


async def get_energy_drink_service(
    repository: Annotated[EnergyDrinkRepository, Depends(get_energy_drink_repository)],
) -> EnergyDrinkService:
    return EnergyDrinkService(repository)
