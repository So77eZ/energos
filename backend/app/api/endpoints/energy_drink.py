from typing import List
from fastapi import APIRouter, HTTPException, Path, UploadFile, File

from app.api.crud import energy_drink
from app.api.models.energy_drink import EnergyDrink

router = APIRouter()


@router.post("/{id}/upload-image/", response_model=EnergyDrink)
async def upload_image_to_drink(id: int = Path(ge=1), file: UploadFile = File(...)):
    result = await energy_drink.upload_image_to_drink(id, file)
    if not result:
        raise HTTPException(status_code=404, detail="Energy drink not found")
    return result


@router.post("/", response_model=EnergyDrink, status_code=201)
async def create_energy_drink(payload: EnergyDrink):
    return await energy_drink.post(payload)


@router.get("/{id}/", response_model=EnergyDrink)
async def read_energy_drink(
    id: int = Path(ge=1),
):
    drink = await energy_drink.get(id)
    if not drink:
        raise HTTPException(status_code=404, detail="Energy drink not found")
    return drink


@router.get("/", response_model=List[EnergyDrink])
async def read_all_energy_drinks():
    return await energy_drink.get_all()


@router.put("/{id}/", response_model=EnergyDrink)
async def update_energy_drink(payload: EnergyDrink, id: int = Path(ge=1)):
    result = await energy_drink.put(id, payload)
    if not result:
        raise HTTPException(status_code=404, detail="Energy drink not found")
    return result


@router.delete("/{id}/", response_model=EnergyDrink)
async def delete_energy_drink(id: int = Path(ge=1)):
    drink = await energy_drink.get(id)
    if not drink:
        raise HTTPException(status_code=404, detail="Energy drink not found")
    return await energy_drink.delete(id)
