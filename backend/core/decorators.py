from functools import wraps
from typing import Any, Callable

from fastapi import HTTPException, status

from models.user import User


def require_admin(func: Callable[..., Any]) -> Callable[..., Any]:
    @wraps(func)
    async def wrapper(*args: Any, **kwargs: Any) -> Any:  # noqa: ANN401
        user: User | None = kwargs.get("current_user")

        if user is None or user.role != "admin":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden: Admin privileges required")

        return await func(*args, **kwargs)

    return wrapper


def require_verified(func: Callable[..., Any]) -> Callable[..., Any]:
    @wraps(func)
    async def wrapper(*args: Any, **kwargs: Any) -> Any:  # noqa: ANN401
        user: User | None = kwargs.get("current_user")

        if user is None or user.role != "admin" and not user.is_verified:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden: User must be verified to perform this action"
            )

        return await func(*args, **kwargs)

    return wrapper
