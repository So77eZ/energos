from fastapi_users.schemas import BaseUser, BaseUserCreate, BaseUserUpdate

from core.constants import UserIdType
from schemas.base import BaseSchema


class BaseUserSchema(BaseUser[UserIdType]):
    username: str


class UserRead(BaseUserSchema):
    pass


class UserCreate(BaseUserCreate):
    username: str


class UserUpdate(BaseUserUpdate):
    username: str | None = None


class SimpleUserSchema(BaseSchema):
    id: UserIdType
    username: str
    role: str
