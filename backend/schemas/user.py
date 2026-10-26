from typing import Annotated

from fastapi_users.schemas import BaseUser, BaseUserCreate, BaseUserUpdate
from pydantic import StringConstraints

from core.constants import UserIdType
from schemas.base import BaseSchema

# Публичное имя рядом с отзывами; те же пределы, что у формы регистрации на фронте.
Username = Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=32)]


class BaseUserSchema(BaseUser[UserIdType]):
    username: str


class UserRead(BaseUserSchema):
    pass


class UserCreate(BaseUserCreate):
    username: Username


class UserUpdate(BaseUserUpdate):
    username: Username | None = None


class SimpleUserSchema(BaseSchema):
    id: UserIdType
    username: str
    role: str
