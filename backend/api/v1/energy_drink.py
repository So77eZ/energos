from fastapi import Depends, File, Request, Response, UploadFile

from core.auth import get_superuser
from core.rate_limiter import limiter
from core.router import AutoStatusAPIRouter
from models import User
from schemas.energy_drink import (
    EnergyDrinkCreateSchema,
    EnergyDrinkReadSchema,
    EnergyDrinkUpdateSchema,
    EnergyDrinkWithMetricsReadSchema,
)
from services.energy_drink import EnergyDrinkService, get_energy_drink_service

router = AutoStatusAPIRouter()


@router.get("/")
@limiter.limit("1000/minute")
async def get_all_energy_drinks(
    request: Request,
    energy_drink_service: EnergyDrinkService = Depends(get_energy_drink_service),
) -> list[EnergyDrinkWithMetricsReadSchema]:
    return await energy_drink_service.get_all_with_metrics()


@router.get("/{energy_drink_id}/image")
@limiter.limit("1000/minute")
async def get_energy_drink_image(
    request: Request,
    energy_drink_id: int,
    energy_drink_service: EnergyDrinkService = Depends(get_energy_drink_service),
) -> Response:
    image_data = await energy_drink_service.get_image_by_id(energy_drink_id)
    return Response(content=image_data.data, media_type=image_data.content_type)


@router.post("/")
async def create_energy_drink(
    energy_drink_data: EnergyDrinkCreateSchema,
    current_user: User = Depends(get_superuser),
    energy_drink_service: EnergyDrinkService = Depends(get_energy_drink_service),
) -> EnergyDrinkReadSchema:
    return await energy_drink_service.create(energy_drink_data)


@router.post("/{energy_drink_id}/image")
async def upload_energy_drink_image(
    energy_drink_id: int,
    image: UploadFile = File(...),
    energy_drink_service: EnergyDrinkService = Depends(get_energy_drink_service),
    current_user: User = Depends(get_superuser),
) -> EnergyDrinkReadSchema:
    return await energy_drink_service.update_image(energy_drink_id, image)


@router.delete("/{energy_drink_id}/image")
async def delete_energy_drink_image(
    energy_drink_id: int,
    energy_drink_service: EnergyDrinkService = Depends(get_energy_drink_service),
    current_user: User = Depends(get_superuser),
) -> None:
    await energy_drink_service.delete_image(energy_drink_id)
    return None


@router.put("/{energy_drink_id}")
async def update_energy_drink(
    energy_drink_id: int,
    energy_drink_data: EnergyDrinkUpdateSchema,
    current_user: User = Depends(get_superuser),
    energy_drink_service: EnergyDrinkService = Depends(get_energy_drink_service),
) -> EnergyDrinkReadSchema:
    return await energy_drink_service.update(energy_drink_id, energy_drink_data)


@router.delete("/{energy_drink_id}")
async def delete_energy_drink(
    energy_drink_id: int,
    current_user: User = Depends(get_superuser),
    energy_drink_service: EnergyDrinkService = Depends(get_energy_drink_service),
) -> None:
    await energy_drink_service.delete_by_id(energy_drink_id)
    return None


@router.get("/{energy_drink_id}")
@limiter.limit("1000/minute")
async def get_energy_drink_by_id(
    request: Request,
    energy_drink_id: int,
    energy_drink_service: EnergyDrinkService = Depends(get_energy_drink_service),
) -> EnergyDrinkWithMetricsReadSchema:
    return await energy_drink_service.get_by_id(energy_drink_id)
