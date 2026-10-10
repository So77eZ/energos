from typing import Annotated, Union

from fastapi import BackgroundTasks, Depends, Request
from fastapi_users import BaseUserManager, IntegerIDMixin, InvalidPasswordException

from core.config import settings
from core.constants import UserIdType
from models import User
from repositories.user import UserRepository, get_user_repository
from schemas.user import UserCreate
from utils.email import EmailClient


class UserManager(IntegerIDMixin, BaseUserManager[User, UserIdType]):
    reset_password_token_secret = settings.access_token.RESET_PASSWORD_TOKEN_SECRET
    verification_token_secret = settings.access_token.VERIFICATION_TOKEN_SECRET

    def __init__(self, user_db: UserRepository, background_tasks: BackgroundTasks):
        super().__init__(user_db)
        self.background_tasks: BackgroundTasks = background_tasks

    async def validate_password(
        self,
        password: str,
        user: Union[UserCreate, User],
    ) -> None:
        if len(password) < 8:
            raise InvalidPasswordException(reason="Password should be at least 8 characters")

        if user.email in password:
            raise InvalidPasswordException(reason="Password should not contain e-mail")

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
