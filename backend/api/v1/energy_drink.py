from fastapi import Depends, File, Response, UploadFile

from core.auth import get_current_user
from core.decorators import require_admin
from core.exceptions import ObjectNotFoundException
from core.rate_limiter import limiter
from core.router import AutoStatusAPIRouter
from models import User
from schemas.energy_drink import (
    EnergyDrinkCreateSchema,
    EnergyDrinkSchema,
    EnergyDrinkUpdateSchema,
    EnergyDrinkWithReviewsSchema,
)
from services.energy_drink import EnergyDrinkService, get_energy_drink_service

router = AutoStatusAPIRouter()


@router.get("/")
@limiter.limit("100/minute")
async def get_energy_drinks_with_reviews(
    limit: int = 20,
    offset: int = 0,
    order_by: str = "id",
    energy_drink_service: EnergyDrinkService = Depends(get_energy_drink_service),
) -> list[EnergyDrinkWithReviewsSchema]:
    energy_drinks = await energy_drink_service.get_many_with_reviews(limit=limit, offset=offset, order_by=order_by)
    return [EnergyDrinkWithReviewsSchema.model_validate(drink) for drink in energy_drinks]


@router.get("/{energy_drink_id}/image")
@limiter.limit("100/minute")
async def get_energy_drink_image(
    energy_drink_id: int,
    energy_drink_service: EnergyDrinkService = Depends(get_energy_drink_service),
) -> Response:
    exists, image = await energy_drink_service.get_image_by_id(energy_drink_id)

    if not exists:
        raise ObjectNotFoundException(f"Energy drink with id {energy_drink_id} not found")

    if image is None:
        raise ObjectNotFoundException(f"Image for energy drink with id {energy_drink_id} not found")

    return Response(content=image.data, media_type=image.content_type)


@router.post("/")
@require_admin
async def create_energy_drink(
    energy_drink_data: EnergyDrinkCreateSchema,
    current_user: User = Depends(get_current_user),
    energy_drink_service: EnergyDrinkService = Depends(get_energy_drink_service),
) -> EnergyDrinkSchema:
    energy_drink = await energy_drink_service.create(energy_drink_data)
    return EnergyDrinkSchema.model_validate(energy_drink)


@router.post("/{energy_drink_id}/image")
@require_admin
async def upload_energy_drink_image(
    energy_drink_id: int,
    image: UploadFile = File(...),
    energy_drink_service: EnergyDrinkService = Depends(get_energy_drink_service),
    current_user: User = Depends(get_current_user),
) -> EnergyDrinkSchema:
    updated_drink = await energy_drink_service.update_image(energy_drink_id, image)
    return EnergyDrinkSchema.model_validate(updated_drink)


@router.delete("/{energy_drink_id}/image")
@require_admin
async def delete_energy_drink_image(
    energy_drink_id: int,
    energy_drink_service: EnergyDrinkService = Depends(get_energy_drink_service),
    current_user: User = Depends(get_current_user),
) -> None:
    await energy_drink_service.delete_image(energy_drink_id)
    return None


@router.put("/{energy_drink_id}")
@require_admin
async def update_energy_drink(
    energy_drink_id: int,
    energy_drink_data: EnergyDrinkUpdateSchema,
    current_user: User = Depends(get_current_user),
    energy_drink_service: EnergyDrinkService = Depends(get_energy_drink_service),
) -> EnergyDrinkSchema:
    updated_energy_drink = await energy_drink_service.update(energy_drink_id, energy_drink_data)
    return EnergyDrinkSchema.model_validate(updated_energy_drink)


@router.delete("/{energy_drink_id}")
@require_admin
async def delete_energy_drink(
    energy_drink_id: int,
    current_user: User = Depends(get_current_user),
    energy_drink_service: EnergyDrinkService = Depends(get_energy_drink_service),
) -> None:
    await energy_drink_service.delete_by_id(energy_drink_id)
    return None
