from typing import TYPE_CHECKING

from fastapi_users.db import SQLAlchemyBaseUserTable
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.constants import Role
from models.base import Base

if TYPE_CHECKING:
    from models.review import Review


class User(Base, SQLAlchemyBaseUserTable[int]):
    __tablename__ = "users"

    username: Mapped[str] = mapped_column(unique=True, index=True)

    reviews: Mapped[list[Review]] = relationship(back_populates="user", cascade="all, delete-orphan")

    @property
    def role(self) -> Role:
        return Role.ADMIN if self.is_superuser else Role.USER
