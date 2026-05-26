from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, TYPE_CHECKING

from src.models.base import Base
from src.models.favorites import UserFavoriteDrinks
from src.constants import Role

if TYPE_CHECKING:
    from src.models.reviews import EnergyDrinkReview
    from src.models.review_emoji import ReviewEmoji
    from src.models.energy_drinks import EnergyDrink
    from src.models.energy_drink_add_request import EnergyDrinkAddRequest


class User(Base):
    __tablename__ = "users"

    username: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[str] = mapped_column(String, nullable=False, default=Role.USER)

    # Relationship
    reviews: Mapped[List["EnergyDrinkReview"]] = relationship(back_populates="user")
    review_emojis: Mapped[List["ReviewEmoji"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    favorite_energy_drinks: Mapped[List["EnergyDrink"]] = relationship(
        secondary=UserFavoriteDrinks, back_populates="favorited_by"
    )
    energy_drink_add_requests: Mapped[List["EnergyDrinkAddRequest"]] = relationship(
        back_populates="user"
    )
