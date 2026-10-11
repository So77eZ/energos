from typing import Annotated

from fastapi import Depends

from core.exceptions import ConflictException, ForbiddenException, ObjectNotFoundException
from models.review import Review
from repositories.energy_drink import EnergyDrinkRepository, get_energy_drink_repository
from repositories.review import ReviewRepository, get_review_repository
from schemas.review import ReviewCreateInternalSchema, ReviewUpdateSchema
from services.base import BaseService


class ReviewService(BaseService[Review, ReviewCreateInternalSchema, ReviewUpdateSchema, ReviewRepository]):
    def __init__(self, repository: ReviewRepository, energy_drink_repository: EnergyDrinkRepository):
        super().__init__(repository)
        self.energy_drink_repository: EnergyDrinkRepository = energy_drink_repository

    async def _ensure_user_is_author(self, review_id: int, user_id: int) -> None:
        author_id = await self.repository.get_author_id(review_id)

        if author_id is None:
            model_name = getattr(self.repository.model, "__verbose_name__", self.repository.model.__name__)
            raise ObjectNotFoundException(f"{model_name} with id {review_id} not found")

        if author_id != user_id:
            raise ForbiddenException("You are not authorized to modify this review")

    async def create(self, data: ReviewCreateInternalSchema) -> Review:
        if not await self.energy_drink_repository.exists_by_id(data.energy_drink_id):
            raise ObjectNotFoundException(
                f"{self.energy_drink_repository.model.__verbose_name__} with id {data.energy_drink_id} not found"
            )

        if await self.repository.exists_by_user_and_energy_drink(
            user_id=data.user_id, energy_drink_id=data.energy_drink_id
        ):
            raise ConflictException("User has already submitted a review for this energy drink")

        return await self.repository.create(data)

    async def update_review(self, id: int, data: ReviewUpdateSchema, current_user_id: int) -> Review:
        await self._ensure_user_is_author(review_id=id, user_id=current_user_id)

        return await self.update(id, data)

    async def delete_review_by_id(self, id: int, current_user_id: int) -> bool:
        await self._ensure_user_is_author(review_id=id, user_id=current_user_id)

        return await self.delete_by_id(id)

    async def get_many_by_user_id(
        self, user_id: int, limit: int = 20, offset: int = 0, order_by: str = "id"
    ) -> list[Review]:
        return await self.repository.get_many_by_user_id(user_id=user_id, limit=limit, offset=offset, order_by=order_by)


async def get_review_service(
    repository: Annotated[ReviewRepository, Depends(get_review_repository)],
    energy_drink_repository: Annotated[EnergyDrinkRepository, Depends(get_energy_drink_repository)],
) -> ReviewService:
    return ReviewService(repository, energy_drink_repository)
