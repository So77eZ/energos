from typing import Annotated

from fastapi import Depends

from core.constants import OrderDirection
from core.exceptions import ConflictException, ForbiddenException
from models.review import Review
from repositories.energy_drink import EnergyDrinkRepository, get_energy_drink_repository
from repositories.review import ReviewRepository, get_review_repository
from repositories.user import UserRepository, get_user_repository
from schemas.review import ReviewCreateInternalSchema, ReviewCreateSchema, ReviewReadSchema, ReviewUpdateSchema
from services.base import BaseService


class ReviewService(
    BaseService[Review, ReviewCreateInternalSchema, ReviewReadSchema, ReviewUpdateSchema, ReviewRepository]
):
    def __init__(
        self,
        repository: ReviewRepository,
        energy_drink_repository: EnergyDrinkRepository,
        user_repository: UserRepository,
        read_schema: type[ReviewReadSchema] = ReviewReadSchema,
    ):
        super().__init__(repository, read_schema)
        self.energy_drink_repository: EnergyDrinkRepository = energy_drink_repository
        self.user_repository: UserRepository = user_repository

    async def _check_if_user_is_author(self, review_id: int, user_id: int) -> None:
        author_id = await self.repository.get_author_id(review_id)
        if author_id != user_id:
            raise ForbiddenException("You are not the author of this review")

    async def _check_if_review_already_exists(self, user_id: int, energy_drink_id: int) -> None:
        if await self.repository.exists_by_user_and_energy_drink(user_id=user_id, energy_drink_id=energy_drink_id):
            raise ConflictException(
                f"User has already submitted a review for this {self.energy_drink_repository.model.__verbose_name__}"
            )

    async def create_review(
        self, review_data: ReviewCreateSchema, user_id: int, energy_drink_id: int
    ) -> ReviewReadSchema:
        await self.user_repository.get(user_id)
        await self.energy_drink_repository.get_by_id(energy_drink_id)

        await self._check_if_review_already_exists(user_id=user_id, energy_drink_id=energy_drink_id)

        internal = ReviewCreateInternalSchema(
            **review_data.model_dump(),
            user_id=user_id,
            energy_drink_id=energy_drink_id,
        )
        review = await self.repository.create(internal)
        return self.read_schema.model_validate(review)

    async def update_review(self, id: int, data: ReviewUpdateSchema, current_user_id: int) -> ReviewReadSchema:
        await self._check_if_user_is_author(review_id=id, user_id=current_user_id)
        review = await self.update(id, data)
        return self.read_schema.model_validate(review)

    async def delete_review_by_id(self, id: int, current_user_id: int) -> bool:
        await self._check_if_user_is_author(review_id=id, user_id=current_user_id)
        return await self.repository.delete_by_id(id)

    async def get_many_by_user_id(
        self,
        user_id: int,
        limit: int = 20,
        offset: int = 0,
        order_by: str = "id",
        direction: OrderDirection = OrderDirection.ASC,
    ) -> list[ReviewReadSchema]:
        reviews = await self.repository.get_many_by_user_id(
            user_id=user_id, limit=limit, offset=offset, order_by=order_by, direction=direction
        )
        return [self.read_schema.model_validate(review) for review in reviews]

    async def get_many_by_energy_drink_id(
        self,
        energy_drink_id: int,
        limit: int = 20,
        offset: int = 0,
        order_by: str = "id",
        direction: OrderDirection = OrderDirection.ASC,
    ) -> list[ReviewReadSchema]:
        await self.energy_drink_repository.get_by_id(energy_drink_id)
        reviews = await self.repository.get_reviews_by_energy_drink_id(
            energy_drink_id=energy_drink_id, limit=limit, offset=offset, order_by=order_by, direction=direction
        )
        return [self.read_schema.model_validate(review) for review in reviews]


async def get_review_service(
    repository: Annotated[ReviewRepository, Depends(get_review_repository)],
    energy_drink_repository: Annotated[EnergyDrinkRepository, Depends(get_energy_drink_repository)],
    user_repository: Annotated[UserRepository, Depends(get_user_repository)],
) -> ReviewService:
    return ReviewService(repository, energy_drink_repository, user_repository)
