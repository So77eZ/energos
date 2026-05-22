from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, TYPE_CHECKING

from src.models.base import Base

if TYPE_CHECKING:
    from src.models.reviews import EnergyDrinkReview
    from src.models.review_emoji import ReviewEmoji


class User(Base):
    __tablename__ = "users"

    username: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[str] = mapped_column(String, nullable=False, default="user")

    # Relationship
    reviews: Mapped[List["EnergyDrinkReview"]] = relationship(back_populates="user")
    review_emojis: Mapped[List["ReviewEmoji"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
