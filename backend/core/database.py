from typing import Annotated, AsyncGenerator

from fastapi import Depends
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from core.config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=True)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


# scope="function": commit после yield выполняется до отправки ответа. При scope по умолчанию
# ("request") он идёт уже после ответа, и клиент, перечитавший данные сразу после 201/204,
# видит состояние до записи (фронт после отзыва кешировал так старый счётчик на 60 с).
SessionDep = Annotated[AsyncSession, Depends(get_session, scope="function")]
