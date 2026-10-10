from abc import ABC
from typing import Generic, List, Type, TypeVar

from sqlalchemy import exists, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.base import AssociativeModelType, BaseModelType
from schemas.base import CreateSchemaType, UpdateSchemaType


class BaseRepository(ABC, Generic[BaseModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, session: AsyncSession, model: Type[BaseModelType]):
        self.session = session
        self.model = model

    async def get_by_id(self, id: int) -> BaseModelType | None:
        return await self.session.get(self.model, id)

    async def get_many(self, limit: int = 20, offset: int = 0, order_by: str = "id") -> List[BaseModelType]:
        query = select(self.model).offset(offset).limit(limit).order_by(getattr(self.model, order_by))
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


class AssociativeRepository(ABC, Generic[AssociativeModelType]):
    def __init__(self, session: AsyncSession, model: Type[AssociativeModelType]):
        self.session = session
        self.model = model

    async def get_many(self, limit: int = 20, offset: int = 0, order_by: str = "id") -> List[AssociativeModelType]:
        query = select(self.model).offset(offset).limit(limit).order_by(getattr(self.model, order_by))
        result = await self.session.execute(query)
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


BaseRepoType = TypeVar("BaseRepoType", bound=BaseRepository)
AssociativeRepoType = TypeVar("AssociativeRepoType", bound=AssociativeRepository)
