from src.models.energy_drink import EnergyDrink
from typing import List, Optional
from fastapi import (
    APIRouter,
    HTTPException,
    Path,
    Query,
    UploadFile,
    File,
    Depends,
    Request,
)
from datetime import datetime, timezone

from src.schemas.energy_drink import EnergyDrinkSchema
from src.api.auth import get_current_user
from src.database import async_session_maker, SupabaseService
from src.localization import localize_text
from sqlalchemy import select

router = APIRouter()


@router.post("/{id}/upload-image/", response_model=EnergyDrinkSchema)
async def upload_image_to_drink(
    request: Request,
    id: int = Path(ge=1),
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
) -> EnergyDrinkSchema:
    async with async_session_maker() as session:
        drink = await query_energy_drink_by_id(session, id)
        if drink is None:
            raise HTTPException(status_code=404, detail=localize_text("drink_not_found", request))
        if drink.image_url:
            SupabaseService.delete_image(drink.image_url)
        image_url = await SupabaseService.upload_image(file)
        drink.image_url = image_url
        drink.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
        await session.commit()
        return drink


@router.post("/", response_model=EnergyDrinkSchema, status_code=201)
async def create_energy_drink(
    payload: EnergyDrinkSchema, current_user=Depends(get_current_user)
) -> EnergyDrinkSchema:
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    drink = EnergyDrink(
        **payload.model_dump(exclude={"id", "created_at", "updated_at"}),
        created_at=now,
        updated_at=now,
    )
    async with async_session_maker() as session:
        session.add(drink)
        await session.commit()
        await session.refresh(drink)
        return drink


@router.get("/{id}/", response_model=EnergyDrinkSchema)
async def read_energy_drink(
    request: Request,
    id: int = Path(ge=1),
) -> EnergyDrinkSchema:
    async with async_session_maker() as session:
        query = select(EnergyDrink).where(EnergyDrink.id == id)
        result = await session.execute(query)
        row = result.scalar_one_or_none()
        if row is None:
            raise HTTPException(status_code=404, detail=localize_text("drink_not_found", request))
        return row


@router.get("/", response_model=List[EnergyDrinkSchema])
async def read_all_energy_drinks(
    limit: Optional[int] = Query(default=None, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> List[EnergyDrink]:
    async with async_session_maker() as session:
        query = select(EnergyDrink).offset(offset)
        if limit is not None:
            query = query.limit(limit)
        result = await session.execute(query)
        rows = result.scalars().all()
        return [row for row in rows]


@router.put("/{id}/", response_model=EnergyDrinkSchema)
async def update_energy_drink(
    request: Request,
    payload: EnergyDrinkSchema,
    id: int = Path(ge=1),
    current_user=Depends(get_current_user),
) -> EnergyDrinkSchema:
    async with async_session_maker() as session:
        query = select(EnergyDrink).where(EnergyDrink.id == id)
        result = await session.execute(query)
        row = result.scalar_one_or_none()
        if row is None:
            raise HTTPException(status_code=404, detail=localize_text("drink_not_found", request))
        update_data = payload.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            if key not in ["id", "created_at", "updated_at"] and value is not None:
                setattr(row, key, value)
        row.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
        await session.commit()
        return row


@router.delete("/{id}/", response_model=EnergyDrinkSchema)
async def delete_energy_drink(
    request: Request,
    id: int = Path(ge=1),
    current_user=Depends(get_current_user),
) -> EnergyDrinkSchema:
    async with async_session_maker() as session:
        query = select(EnergyDrink).where(EnergyDrink.id == id)
        result = await session.execute(query)
        row = result.scalar_one_or_none()
        if row is None:
            raise HTTPException(status_code=404, detail=localize_text("drink_not_found", request))
        if row.image_url:
            SupabaseService.delete_image(row.image_url)
        deleted_drink = row
        await session.delete(row)
        await session.commit()
        return deleted_drink


async def query_energy_drink_by_id(session, id: int) -> EnergyDrink | None:
    query = select(EnergyDrink).where(EnergyDrink.id == id)
    result = await session.execute(query)
    return result.scalar_one_or_none()
