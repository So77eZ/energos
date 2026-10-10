from abc import ABC
from typing import Generic

from core.exceptions import ObjectNotFoundException
from models.base import BaseModelType
from repositories.base import (
    AssociativeRepoType,
    BaseRepoType,
    CreateSchemaType,
    UpdateSchemaType,
)


class BaseService(ABC, Generic[BaseModelType, CreateSchemaType, UpdateSchemaType, BaseRepoType]):
    def __init__(self, repository: BaseRepoType):
        self.repository: BaseRepoType = repository

    async def get_many(self, limit: int = 20, offset: int = 0, order_by: str = "id") -> list:
        return await self.repository.get_many(limit=limit, offset=offset, order_by=order_by)

    async def get_by_id(self, id: int) -> BaseModelType:
        model_instance: BaseModelType | None = await self.repository.get_by_id(id)
        if not model_instance:
            model_name = getattr(self.repository.model, "__verbose_name__", self.repository.model.__name__)
            raise ObjectNotFoundException(f"{model_name} with id {id} not found")

        return model_instance

    async def create(self, data: CreateSchemaType) -> BaseModelType:
        return await self.repository.create(data)

    async def update(self, id: int, data: UpdateSchemaType) -> BaseModelType:
        model_instance: BaseModelType = await self.get_by_id(id)

        update_data = data.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            setattr(model_instance, key, value)

        return await self.repository.update(model_instance)

    async def delete(self, model_instance: BaseModelType) -> None:
        return await self.repository.delete(model_instance)

    async def delete_by_id(self, id: int) -> bool:
        model_instance: BaseModelType = await self.get_by_id(id)
        await self.repository.delete(model_instance)
        return True


class AssociativeService(Generic[AssociativeRepoType], ABC):
    def __init__(self, repository: AssociativeRepoType):
        self.repository: AssociativeRepoType = repository

    async def get_many(self, limit: int = 20, offset: int = 0, order_by: str = "id") -> list:
        return await self.repository.get_many(limit=limit, offset=offset, order_by=order_by)
