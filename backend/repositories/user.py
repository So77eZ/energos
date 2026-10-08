from typing import Annotated

from fastapi import Depends
from fastapi_users.db import SQLAlchemyUserDatabase
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_session
from models.user import User


class UserRepository(SQLAlchemyUserDatabase[User, int]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, User)


async def get_user_repository(session: Annotated[AsyncSession, Depends(get_session)]) -> UserRepository:
    return UserRepository(session)
