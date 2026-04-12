from datetime import datetime, timezone

from fastapi import UploadFile

from app.api.models.energy_drink import EnergyDrink
from app.database import async_session_maker, SupabaseService
from sqlmodel import select


async def post(payload: EnergyDrink):
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    drink = EnergyDrink(
        **payload.model_dump(exclude={"created_at", "updated_at"}),
        created_at=now,
        updated_at=now,
    )
    async with async_session_maker() as session:
        session.add(drink)
        await session.commit()
        await session.refresh(drink)
        return drink


async def get(id: int):
    async with async_session_maker() as session:
        query = select(EnergyDrink).where(EnergyDrink.id == id)
        result = await session.execute(query)
        row = result.scalar_one_or_none()
        if row is None:
            return None
        return row


async def get_all():
    async with async_session_maker() as session:
        query = select(EnergyDrink)
        result = await session.execute(query)
        rows = result.scalars().all()
        return [row for row in rows]


async def put(id: int, payload: EnergyDrink):
    async with async_session_maker() as session:
        query = select(EnergyDrink).where(EnergyDrink.id == id)
        result = await session.execute(query)
        row = result.scalar_one_or_none()
        if row is None:
            return None
        for key, value in payload.model_dump(
            exclude={"created_at", "updated_at"}
        ).items():
            setattr(row, key, value)
        row.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
        await session.commit()
        return row


async def delete(id: int):
    async with async_session_maker() as session:
        query = select(EnergyDrink).where(EnergyDrink.id == id)
        result = await session.execute(query)
        row = result.scalar_one_or_none()
        if row is None:
            return None
        if row.image_url:
            SupabaseService.delete_image(row.image_url)
        deleted_drink = row
        await session.delete(row)
        await session.commit()
        return deleted_drink


async def upload_image_to_drink(id: int, file: UploadFile):
    async with async_session_maker() as session:
        query = select(EnergyDrink).where(EnergyDrink.id == id)
        result = await session.execute(query)
        drink = result.scalar_one_or_none()
        if drink is None:
            return None
        if drink.image_url:
            SupabaseService.delete_image(drink.image_url)
        image_url = await SupabaseService.upload_image(file)
        drink.image_url = image_url
        drink.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
        await session.commit()
        return drink
