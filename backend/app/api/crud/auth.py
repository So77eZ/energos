from datetime import datetime, timezone

from app.api.models.auth import User
from app.auth import hash_password, verify_password
from app.database import async_session_maker
from sqlalchemy import select


async def create_user(username: str, password: str, role: str = "user") -> User:
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    hashed_password = hash_password(password)
    user = User(
        username=username,
        password_hash=hashed_password,
        role=role,
        created_at=now,
        updated_at=now,
    )
    async with async_session_maker() as session:
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user


async def get_user_by_username(username: str) -> User | None:
    async with async_session_maker() as session:
        query = select(User).where(User.username == username)
        result = await session.execute(query)
        return result.scalar_one_or_none()


async def authenticate_user(username: str, password: str) -> User | None:
    user = await get_user_by_username(username)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user
