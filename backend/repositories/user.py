from fastapi_users.db import SQLAlchemyUserDatabase
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import SessionDep
from core.exceptions import ObjectNotFoundException
from models.user import User


class UserRepository(SQLAlchemyUserDatabase[User, int]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, User)

    async def get(self, id: int) -> User:
        user = await super().get(id)
        if user is None:
            raise ObjectNotFoundException(f"User with id {id} not found")
        return user


async def get_user_repository(session: SessionDep) -> UserRepository:
    return UserRepository(session)
