from abc import ABC
from typing import Generic, Type, TypeVar

from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from core.constants import OrderDirection
from exceptions.base import UnprocessableEntityException
from models.base import BaseModelType
from schemas.base import CreateSchemaType, UpdateSchemaType
from schemas.request_query import RequestQuerySchema


class BaseRepository(ABC, Generic[BaseModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, session: AsyncSession, model: Type[BaseModelType]):
        self.session = session
        self.model = model

    async def get_by_id(self, id: int) -> BaseModelType:
        raise NotImplementedError("get_by_id method must be implemented in the subclass")

    async def get_many(self, request_query: RequestQuerySchema) -> list[BaseModelType]:
        query = select(self.model)
        return await self.execute_get_many_query(query, request_query=request_query)

    async def execute_get_many_query(
        self,
        query: Select[tuple[BaseModelType]],
        request_query: RequestQuerySchema,
    ) -> list[BaseModelType]:
        try:
            column = getattr(self.model, request_query.order_by)
        except AttributeError as e:
            raise UnprocessableEntityException(f"Invalid order_by field: {request_query.order_by}") from e

        if request_query.order_direction == OrderDirection.ASC:
            query = query.order_by(column.asc())
        else:
            query = query.order_by(column.desc())

        query = query.offset(request_query.offset).limit(request_query.limit)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def create(self, create_schema: CreateSchemaType) -> BaseModelType:
        model_instance = self.model(**create_schema.model_dump(exclude_unset=True))
        self.session.add(model_instance)
        await self.session.flush()
        await self.session.refresh(model_instance)
        return model_instance

    async def update(self, model_instance: BaseModelType) -> BaseModelType:
        merged = await self.session.merge(model_instance)
        await self.session.flush()
        return merged

    async def delete_by_id(self, id: int) -> bool:
        raise NotImplementedError("delete_by_id method must be implemented in the subclass")

    async def get_count(self) -> int:
        statement = select(func.count()).select_from(self.model)
        result = await self.session.execute(statement)
        return result.scalar_one()


BaseRepoType = TypeVar("BaseRepoType", bound=BaseRepository)
