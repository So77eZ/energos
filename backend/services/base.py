from abc import ABC
from typing import Generic

from models.base import BaseModelType
from repositories.base import (
    BaseRepoType,
    CreateSchemaType,
    UpdateSchemaType,
)
from schemas.base import ReadSchemaType
from schemas.request_query import RequestQuerySchema


class BaseService(
    ABC,
    Generic[BaseModelType, CreateSchemaType, ReadSchemaType, UpdateSchemaType, BaseRepoType],
):
    def __init__(self, repository: BaseRepoType, read_schema: type[ReadSchemaType]):
        self.repository: BaseRepoType = repository
        self.read_schema: type[ReadSchemaType] = read_schema

    async def get_many(self, request_query: RequestQuerySchema) -> list[ReadSchemaType]:
        instances: list[BaseModelType] = await self.repository.get_many(request_query=request_query)
        return [self.read_schema.model_validate(instance) for instance in instances]

    async def get_by_id(self, id: int) -> ReadSchemaType:
        instance: BaseModelType = await self.repository.get_by_id(id)
        return self.read_schema.model_validate(instance)

    async def create(self, data: CreateSchemaType) -> ReadSchemaType:
        instance: BaseModelType = await self.repository.create(data)
        return self.read_schema.model_validate(instance)

    async def update(self, id: int, data: UpdateSchemaType) -> ReadSchemaType:
        instance: BaseModelType = await self.repository.get_by_id(id)

        update_data = data.model_dump(exclude_unset=True)
        if update_data:
            for key, value in update_data.items():
                setattr(instance, key, value)
            instance = await self.repository.update(instance)

        return self.read_schema.model_validate(instance)

    async def delete_by_id(self, id: int) -> bool:
        return await self.repository.delete_by_id(id)

    async def get_count(self) -> int:
        return await self.repository.get_count()
