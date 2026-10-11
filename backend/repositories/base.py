from abc import ABC
from typing import Generic, List, Type, TypeVar

from sqlalchemy import Select, exists, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from core.exceptions import UnprocessableEntityException
from models.base import AssociativeModelType, BaseModelType
from schemas.base import CreateSchemaType, UpdateSchemaType


class BaseRepository(ABC, Generic[BaseModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, session: AsyncSession, model: Type[BaseModelType]):
        self.session = session
        self.model = model

    async def get_by_id(self, id: int) -> BaseModelType | None:
        return await self.session.get(self.model, id)

    async def get_many(self, limit: int = 20, offset: int = 0, order_by: str = "id") -> List[BaseModelType]:
        query = select(self.model)
        return await self.execute_get_many_query(query, limit=limit, offset=offset, order_by=order_by)

    async def execute_get_many_query(
        self, query: Select[tuple[BaseModelType]], limit: int = 20, offset: int = 0, order_by: str = "id"
    ) -> List[BaseModelType]:
        try:
            query = query.offset(offset).limit(limit).order_by(getattr(self.model, order_by))
        except AttributeError as e:
            raise UnprocessableEntityException(f"Invalid order_by field: {order_by}") from e
        result = await self.session.execute(query)

        return list(result.scalars().all())

    async def get_all(self) -> List[BaseModelType]:
        query = select(self.model)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def create(self, create_schema: CreateSchemaType) -> BaseModelType:
        model_instance = self.model(**create_schema.model_dump(exclude_unset=True))
        self.session.add(model_instance)
        await self.session.commit()
        await self.session.refresh(model_instance)
        return model_instance

    async def update(self, model_instance: BaseModelType) -> BaseModelType:
        await self.session.merge(model_instance)
        await self.session.commit()
        await self.session.refresh(model_instance)
        return model_instance

    async def delete(self, model_instance: BaseModelType) -> None:
        await self.session.delete(model_instance)
        await self.session.commit()

    async def exists_by_id(self, id: int) -> bool:
        statement = select(exists().where(self.model.id == id))
        result = await self.session.execute(statement)
        return bool(result.scalar())

    async def get_count(self) -> int:
        statement = select(func.count()).select_from(self.model)
        result = await self.session.execute(statement)
        return result.scalar_one()


class AssociativeRepository(ABC, Generic[AssociativeModelType]):
    def __init__(self, session: AsyncSession, model: Type[AssociativeModelType]):
        self.session = session
        self.model = model

    async def get_many(self, limit: int = 20, offset: int = 0, order_by: str = "id") -> List[AssociativeModelType]:
        query = select(self.model).offset(offset).limit(limit).order_by(getattr(self.model, order_by))
        try:
            result = await self.session.execute(query)
        except AttributeError as e:
            raise UnprocessableEntityException(f"Invalid order_by field: {order_by}") from e
        return list(result.scalars().all())

    async def get_all(self) -> List[AssociativeModelType]:
        query = select(self.model)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def create(self, **kwargs: dict) -> AssociativeModelType:
        model_instance = self.model(**kwargs)
        self.session.add(model_instance)
        await self.session.commit()
        await self.session.refresh(model_instance)
        return model_instance

    async def delete(self, model_instance: AssociativeModelType) -> None:
        await self.session.delete(model_instance)
        await self.session.commit()

    async def get_count(self) -> int:
        query = select(self.model)
        result = await self.session.execute(query)
        return len(result.scalars().all())


BaseRepoType = TypeVar("BaseRepoType", bound=BaseRepository)
AssociativeRepoType = TypeVar("AssociativeRepoType", bound=AssociativeRepository)
