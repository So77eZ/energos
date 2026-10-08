from typing import Annotated

from fastapi import Depends

from core.exceptions import ForbiddenException, ObjectNotFoundException
from models.review import Review
from repositories.energy_drink import EnergyDrinkRepository, get_energy_drink_repository
from repositories.review import ReviewRepository, get_review_repository
from schemas.review import ReviewCreateInternalSchema, ReviewUpdateSchema
from services.base import BaseService


class ReviewService(BaseService[Review, ReviewCreateInternalSchema, ReviewUpdateSchema, ReviewRepository]):
    def __init__(self, repository: ReviewRepository, energy_drink_repository: EnergyDrinkRepository):
        super().__init__(repository)
        self.energy_drink_repository: EnergyDrinkRepository = energy_drink_repository

    async def _check_if_user_is_author(self, review_id: int, user_id: int) -> Review:
        review = await self._get_or_404(review_id)
        if review.user_id != user_id:
            raise ForbiddenException("You are not authorized to perform this action on this review.")
        return review

    async def create(self, data: ReviewCreateInternalSchema) -> Review:
        energy_drink_exists = await self.energy_drink_repository.exists_by_id(data.energy_drink_id)
        if not energy_drink_exists:
            raise ObjectNotFoundException(
                f"{self.energy_drink_repository.model.__verbose_name__} with id {data.energy_drink_id} not found"
            )

        return await self.repository.create(data)

    async def update_review(self, id: int, data: ReviewUpdateSchema, current_user_id: int) -> Review:
        review_instance = await self._check_if_user_is_author(review_id=id, user_id=current_user_id)

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(review_instance, key, value)

        return await self.repository.update(review_instance)

    async def delete_review_by_id(self, id: int, current_user_id: int) -> bool:
        review_instance = await self._check_if_user_is_author(review_id=id, user_id=current_user_id)

        await self.repository.delete(review_instance)
        return True


async def get_review_service(
    repository: Annotated[ReviewRepository, Depends(get_review_repository)],
    energy_drink_repository: Annotated[EnergyDrinkRepository, Depends(get_energy_drink_repository)],
) -> ReviewService:
    return ReviewService(repository, energy_drink_repository)
