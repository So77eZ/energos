from typing import Annotated, Union, cast

from fastapi import BackgroundTasks, Depends, Request
from fastapi_users import BaseUserManager, IntegerIDMixin

from core.config import settings
from core.constants import UserIdType
from core.exceptions import (
    EmailAlreadyExistsException,
    InvalidPasswordException,
    UsernameAlreadyExistsException,
)
from models import User
from repositories.user import UserRepository, get_user_repository
from schemas.user import UserCreate, UserUpdate
from utils.email import EmailClient


class UserManager(IntegerIDMixin, BaseUserManager[User, UserIdType]):
    reset_password_token_secret = settings.access_token.RESET_PASSWORD_TOKEN_SECRET
    verification_token_secret = settings.access_token.VERIFICATION_TOKEN_SECRET

    def __init__(self, user_db: UserRepository, background_tasks: BackgroundTasks):
        super().__init__(user_db)
        self.background_tasks: BackgroundTasks = background_tasks

    async def create(self, user_create: UserCreate, safe: bool = False, request: Request | None = None) -> User:
        await self.validate_password(user_create.password, user_create)
        user_db = cast(UserRepository, self.user_db)

        existing_user_by_email = await user_db.get_by_email(user_create.email)
        if existing_user_by_email:
            raise EmailAlreadyExistsException

        existing_user_by_username = await user_db.get_by_username(user_create.username)

        if existing_user_by_username:
            raise UsernameAlreadyExistsException

        user_dict = user_create.create_update_dict() if safe else user_create.create_update_dict_superuser()
        password = user_dict.pop("password")
        user_dict["hashed_password"] = self.password_helper.hash(password)

        created_user = await user_db.create(user_dict)

        await self.on_after_register(created_user, request)

        return created_user

    async def update(
        self, user_update: UserUpdate, user: User, safe: bool = False, request: Request | None = None
    ) -> User:
        # Отзывы ссылаются на user_id, ник подтягивается при чтении — после смены он виден во всех отзывах.
        if user_update.username is not None and user_update.username != user.username:
            if await cast(UserRepository, self.user_db).get_by_username(user_update.username):
                raise UsernameAlreadyExistsException

        return await super().update(user_update, user, safe=safe, request=request)

    async def validate_password(
        self,
        password: str,
        user: Union[UserCreate, User],
    ) -> None:
        if len(password) < 8:
            raise InvalidPasswordException("Password should be at least 8 characters")

    async def on_after_register(self, user: User, request: Request | None = None) -> None:
        await self.request_verify(user, request)

    async def on_after_request_verify(self, user: User, token: str, request: Request | None = None) -> None:
        self.background_tasks.add_task(EmailClient.send_verification_email, to_email=user.email, token=token)

    async def on_after_forgot_password(self, user: User, token: str, request: Request | None = None) -> None:
        self.background_tasks.add_task(EmailClient.send_reset_password_email, to_email=user.email, token=token)

    async def on_after_update(self, user: User, update_dict: dict, request: Request | None = None) -> None:
        if "email" in update_dict:
            await self.user_db.update(user, {"is_verified": False})
            await self.request_verify(user, request)


async def get_user_manager(
    repository: Annotated[UserRepository, Depends(get_user_repository)],
    background_tasks: BackgroundTasks,
) -> UserManager:
    return UserManager(repository, background_tasks)
