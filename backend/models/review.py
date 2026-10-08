from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base

if TYPE_CHECKING:
    from models.energy_drink import EnergyDrink
    from models.user import User


class Review(Base):
    __tablename__ = "reviews"

    comment: Mapped[str | None]
    acidity: Mapped[float]
    sweetness: Mapped[float]
    concentration: Mapped[float]
    carbonation: Mapped[float]
    aftertaste: Mapped[float]
    price_quality: Mapped[float]
    overall: Mapped[float]

    energy_drink_id: Mapped[int] = mapped_column(ForeignKey("energy_drinks.id"))
    energy_drink: Mapped[EnergyDrink] = relationship(back_populates="reviews")

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    user: Mapped[User] = relationship(back_populates="reviews")
