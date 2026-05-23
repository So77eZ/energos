from sqlalchemy import String, Float, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, TYPE_CHECKING

from src.models.base import Base

if TYPE_CHECKING:
    from src.models.reviews import EnergyDrinkReview
    from src.models.auth import User


class EnergyDrink(Base):
    __tablename__ = "energy_drinks"

    name: Mapped[str] = mapped_column(String, nullable=False)
    price: Mapped[float | None] = mapped_column(Float, nullable=True)
    image_url: Mapped[str | None] = mapped_column(String, nullable=True)
    no_sugar: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationship
    reviews: Mapped[List["EnergyDrinkReview"]] = relationship(
        back_populates="energy_drink"
    )
    favorited_by: Mapped[List["User"]] = relationship(
        secondary="user_favorite_drinks", back_populates="favorite_energy_drinks"
    )
