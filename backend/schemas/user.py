from fastapi_users.schemas import BaseUser, BaseUserCreate, BaseUserUpdate

from core.constants import UserIdType


class UserRead(BaseUser[UserIdType]):
    pass


class UserCreate(BaseUserCreate):
    pass


class UserUpdate(BaseUserUpdate):
    pass
