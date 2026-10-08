from typing import TYPE_CHECKING

from fastapi_users.db import SQLAlchemyBaseUserTable
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.constants import Role
from models.base import Base

if TYPE_CHECKING:
    from models.review import Review


class User(Base, SQLAlchemyBaseUserTable[int]):
    __tablename__ = "users"

    role: Mapped[str] = mapped_column(default=Role.USER)

    reviews: Mapped[list[Review]] = relationship(back_populates="user", cascade="all, delete-orphan")
