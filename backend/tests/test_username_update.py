from typing import Any

import pytest
from fastapi import BackgroundTasks
from pydantic import ValidationError

from core.exceptions import UsernameAlreadyExistsException
from models import User
from schemas.user import UserUpdate
from services.user_manager import UserManager


class FakeUserRepository:
    def __init__(self, *users: User) -> None:
        self.users = list(users)

    async def get_by_username(self, username: str) -> User | None:
        return next((u for u in self.users if u.username == username), None)

    async def update(self, user: User, update_dict: dict[str, Any]) -> User:
        for key, value in update_dict.items():
            setattr(user, key, value)
        return user


def make_manager() -> tuple[UserManager, User]:
    me = User(id=1, email="me@example.com", username="Fox")
    other = User(id=2, email="other@example.com", username="Wolf")
    return UserManager(FakeUserRepository(me, other), BackgroundTasks()), me  # type: ignore[arg-type]


async def test_username_can_be_changed_to_a_free_one() -> None:
    manager, me = make_manager()
    updated = await manager.update(UserUpdate(username="  Bear "), me, safe=True)
    assert updated.username == "Bear"


async def test_username_taken_by_another_user_is_rejected() -> None:
    manager, me = make_manager()
    with pytest.raises(UsernameAlreadyExistsException):
        await manager.update(UserUpdate(username="Wolf"), me, safe=True)
    assert me.username == "Fox"


async def test_own_username_is_not_a_conflict() -> None:
    manager, me = make_manager()
    assert (await manager.update(UserUpdate(username="Fox"), me, safe=True)).username == "Fox"


@pytest.mark.parametrize("username", ["", " ", "x", "  x  ", "a" * 33])
def test_username_length_is_validated(username: str) -> None:
    with pytest.raises(ValidationError):
        UserUpdate(username=username)
