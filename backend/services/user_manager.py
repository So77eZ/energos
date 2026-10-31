from typing import Annotated, Union, cast

from fastapi import BackgroundTasks, Depends, Request
from fastapi_users import BaseUserManager, IntegerIDMixin

from core.config import settings
from core.constants import BANNED_USERNAMES, UserIdType
from core.exceptions import (
    EmailAlreadyExistsException,
    InvalidPasswordException,
    InvalidUsernameException,
    UsernameAlreadyExistsException,
    UserNotFoundException,
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

    async def get_by_email(self, user_email: str) -> User:
        user = await self.user_db.get_by_email(user_email)

        if user is None:
            raise UserNotFoundException(f"User with email {user_email} not found")

        return user

    async def get_by_username(self, username: str) -> User:
        user_db = cast(UserRepository, self.user_db)
        user = await user_db.get_by_username(username)

        if user is None:
            raise UserNotFoundException(f"User with username {username} not found")

        return user

    async def create(self, user_create: UserCreate, safe: bool = False, request: Request | None = None) -> User:
        await self.validate_password(user_create.password, user_create)
        user_db = cast(UserRepository, self.user_db)

        existing_user_by_email = await user_db.get_by_email(user_create.email)
        if existing_user_by_email:
            raise EmailAlreadyExistsException

        existing_user_by_username = await user_db.get_by_username(user_create.username)
        if existing_user_by_username:
            raise UsernameAlreadyExistsException

        await self.validate_username(user_create.username, user_create)

        user_dict = user_create.create_update_dict() if safe else user_create.create_update_dict_superuser()
        password = user_dict.pop("password")
        user_dict["hashed_password"] = self.password_helper.hash(password)

        created_user = await user_db.create(user_dict)

        await self.on_after_register(created_user, request)

        return created_user

    async def update(
        self,
        user_update: UserUpdate,
        user: User,
        safe: bool = False,
        request: Request | None = None,
    ) -> User:
        if safe:
            update_dict = user_update.create_update_dict()
        else:
            update_dict = user_update.create_update_dict_superuser()

        validated_update_dict = {}
        for field, value in update_dict.items():
            if field == "email" and value != user.email:
                try:
                    await self.get_by_email(value)
                    raise EmailAlreadyExistsException("Email already exists")

                except UserNotFoundException:
                    validated_update_dict["email"] = value
                    validated_update_dict["is_verified"] = False

            elif field == "password" and value is not None:
                await self.validate_password(value, user)
                validated_update_dict["hashed_password"] = self.password_helper.hash(value)

            elif field == "username" and value != user.username:
                try:
                    await self.get_by_username(value)
                    raise UsernameAlreadyExistsException("Username already exists")
                except UserNotFoundException:
                    await self.validate_username(value, user)
                    validated_update_dict["username"] = value

            else:
                validated_update_dict[field] = value

        if not validated_update_dict:
            return user

        updated_user = await self.user_db.update(user, validated_update_dict)

        await self.on_after_update(updated_user, validated_update_dict, request)

        return updated_user

    async def validate_password(
        self,
        password: str,
        user: Union[UserCreate, User],
    ) -> None:
        if len(password) < 8:
            raise InvalidPasswordException("Password should be at least 8 characters")

    async def validate_username(
        self,
        username: str,
        user: Union[UserCreate, User],
    ) -> None:
        username_lower = username.lower()

        if (
            # 1. Length check: username must be between 2 and 32 characters
            len(username) < 2
            or len(username) > 32
            # 2. Banned usernames: username should not be in the list of banned usernames
            or username_lower in BANNED_USERNAMES
            # 3. Start and end with a letter or digit
            or not username[0].isalnum()
            or not username[-1].isalnum()
            # 4. Username should not contain substrings that resemble URLs or domain names
            or "://" in username_lower
            or "www." in username_lower
            or ".com" in username_lower
            or ".ru" in username_lower
            # 5. No consecutive separators: username should not contain "__", "--", "_-", or "-_"
            or "__" in username
            or "--" in username
            or "_-" in username
            or "-_" in username
            # 6. Allowed characters: username should only contain alphanumeric characters, underscores, or hyphens
            or any(not (char.isascii() and (char.isalnum() or char in ("_", "-"))) for char in username)
        ):
            raise InvalidUsernameException(
                "Username must be 2-32 chars long, start/end with a letter or digit, "
                "contain no consecutive separators (_ or -), and include only alphanumeric characters, '_' or '-'"
            )

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
