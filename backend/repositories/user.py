from fastapi_users.db import SQLAlchemyUserDatabase
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import SessionDep
from core.exceptions import UserNotFoundException
from models.user import User


class UserRepository(SQLAlchemyUserDatabase[User, int]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, User)

    async def get(self, id: int) -> User:
        user = await super().get(id)
        if user is None:
            raise UserNotFoundException(f"User with id {id} not found")

        return user

    async def get_by_username(self, username: str) -> User | None:
        statement = select(self.user_table).where(self.user_table.username == username)
        return await self._get_user(statement)


async def get_user_repository(session: SessionDep) -> UserRepository:
    return UserRepository(session)
