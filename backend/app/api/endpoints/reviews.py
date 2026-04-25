from app.api.models.reviews import EnergyDrinkReview
from typing import List
from fastapi import APIRouter, HTTPException, Path, Depends

from app.api.crud import reviews
from app.api.models.reviews import EnergyDrinkReviewSchema
from app.api.endpoints.auth import get_current_user

router = APIRouter()


@router.post("/", response_model=EnergyDrinkReviewSchema, status_code=201)
async def create_review(
    payload: EnergyDrinkReviewSchema, current_user=Depends(get_current_user)
) -> EnergyDrinkReviewSchema:
    is_admin = current_user.role == "admin"
    return await reviews.post(payload, current_user.id, is_admin)


@router.get("/", response_model=List[EnergyDrinkReviewSchema])
async def read_all_reviews() -> List[EnergyDrinkReview]:
    return await reviews.get_all()


@router.get("/user/", response_model=List[EnergyDrinkReviewSchema])
async def read_reviews_by_user(
    current_user=Depends(get_current_user),
) -> List[EnergyDrinkReview]:
    return await reviews.get_by_user_id(current_user.id)


@router.get(
    "/energy-drink/{energy_drink_id}/", response_model=List[EnergyDrinkReviewSchema]
)
async def read_reviews_by_energy_drink(
    energy_drink_id: int = Path(ge=1),
) -> List[EnergyDrinkReview]:
    return await reviews.get_by_energy_drink_id(energy_drink_id)


@router.get("/{id}/", response_model=EnergyDrinkReviewSchema)
async def read_review(
    id: int = Path(ge=1),
) -> EnergyDrinkReviewSchema:
    review = await reviews.get(id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return review


@router.put("/{id}/", response_model=EnergyDrinkReviewSchema)
async def update_review(
    payload: EnergyDrinkReviewSchema,
    id: int = Path(ge=1),
    current_user=Depends(get_current_user),
) -> EnergyDrinkReviewSchema:
    result = await reviews.put(id, payload)
    if not result:
        raise HTTPException(status_code=404, detail="Review not found")
    return result


@router.delete("/{id}/", response_model=EnergyDrinkReviewSchema)
async def delete_review(
    id: int = Path(ge=1), current_user=Depends(get_current_user)
) -> EnergyDrinkReviewSchema:
    review = await reviews.delete(id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return review
