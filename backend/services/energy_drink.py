from io import BytesIO
from typing import Annotated

from fastapi import Depends, UploadFile
from PIL import Image, ImageOps

from core.constants import ALLOWED_IMAGE_MIME_TYPES, MAX_IMAGE_SIDE, OrderDirection
from core.exceptions import EnergyDrinkNotFoundException, ImageNotFoundException, UnsupportedMediaTypeException
from models.energy_drink import EnergyDrink
from repositories.energy_drink import EnergyDrinkRepository, get_energy_drink_repository
from schemas.energy_drink import (
    EnergyDrinkCreateSchema,
    EnergyDrinkReadSchema,
    EnergyDrinkUpdateSchema,
    EnergyDrinkWithMetricsReadSchema,
    ImageData,
)
from services.base import BaseService


class EnergyDrinkService(
    BaseService[
        EnergyDrink, EnergyDrinkCreateSchema, EnergyDrinkReadSchema, EnergyDrinkUpdateSchema, EnergyDrinkRepository
    ]
):
    def __init__(self, repository: EnergyDrinkRepository):
        super().__init__(repository, EnergyDrinkReadSchema)

    async def update_image(self, energy_drink_id: int, image_file: UploadFile) -> EnergyDrinkReadSchema:
        energy_drink = await self.repository.get_by_id(energy_drink_id)

        image_data = await image_file.read()
        image_type = image_file.content_type

        if image_type not in ALLOWED_IMAGE_MIME_TYPES:
            raise UnsupportedMediaTypeException

        image = ImageOps.exif_transpose(Image.open(BytesIO(image_data))).convert("RGBA")
        image.thumbnail((MAX_IMAGE_SIDE, MAX_IMAGE_SIDE), Image.Resampling.LANCZOS)
        compressed_buffer = BytesIO()

        image.save(compressed_buffer, format="WEBP", quality=80, method=6)
        compressed_bytes = compressed_buffer.getvalue()

        energy_drink.image = compressed_bytes
        energy_drink.image_content_type = "image/webp"

        updated_energy_drink = await self.repository.update(energy_drink)
        return self.read_schema.model_validate(updated_energy_drink)

    async def get_by_id(self, id: int) -> EnergyDrinkWithMetricsReadSchema:
        energy_drink: EnergyDrink = await self.repository.get_by_id(id)
        return EnergyDrinkWithMetricsReadSchema.model_validate(energy_drink)

    async def get_all_with_metrics(self) -> list[EnergyDrinkWithMetricsReadSchema]:
        energy_drinks: list[EnergyDrink] = await self.repository.get_all_with_metrics()
        return [EnergyDrinkWithMetricsReadSchema.model_validate(drink) for drink in energy_drinks]

    async def get_many_with_reviews(
        self, limit: int = 20, offset: int = 0, order_by: str = "id", direction: OrderDirection = OrderDirection.ASC
    ) -> list[EnergyDrinkWithMetricsReadSchema]:
        energy_drinks: list[EnergyDrink] = await self.repository.get_many_with_reviews(
            limit=limit, offset=offset, order_by=order_by, direction=direction
        )
        return [EnergyDrinkWithMetricsReadSchema.model_validate(drink) for drink in energy_drinks]

    async def get_image_by_id(self, energy_drink_id: int) -> ImageData:
        exists, image = await self.repository.get_image_by_energy_drink_id(energy_drink_id)

        if not exists:
            raise EnergyDrinkNotFoundException(f"Energy drink with id {energy_drink_id} not found")

        if image is None:
            raise ImageNotFoundException(f"Image for energy drink with id {energy_drink_id} not found")

        return image

    async def delete_image(self, energy_drink_id: int) -> None:
        energy_drink: EnergyDrink = await self.repository.get_by_id(energy_drink_id)
        energy_drink.image = None
        energy_drink.image_content_type = None
        await self.repository.update(energy_drink)


async def get_energy_drink_service(
    repository: Annotated[EnergyDrinkRepository, Depends(get_energy_drink_repository)],
) -> EnergyDrinkService:
    return EnergyDrinkService(repository)
