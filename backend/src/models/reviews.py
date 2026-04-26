from datetime import datetime

from sqlalchemy import Integer, Float, DateTime, Boolean, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import Base
from .energy_drink import EnergyDrink
from .auth import User


class EnergyDrinkReview(Base):
    __tablename__ = "energy_drinks_reviews"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    energy_drink_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("energy_drinks.id"), nullable=False
    )
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False
    )
    comment: Mapped[str | None] = mapped_column(String, nullable=True)
    rating: Mapped[float] = mapped_column(Float, nullable=False)  # рейтинг (1-5)
    acidity: Mapped[float] = mapped_column(Float, nullable=False)  # кислотность (1-5)
    sweetness: Mapped[float] = mapped_column(Float, nullable=False)  # сладость (1-5)
    concentration: Mapped[float] = mapped_column(
        Float, nullable=False
    )  # концентрация / интенсивность (1-5)
    carbonation: Mapped[float] = mapped_column(
        Float, nullable=False
    )  # газированность (1-5)
    aftertaste: Mapped[float] = mapped_column(
        Float, nullable=False
    )  # послевкусие (1-5)
    price_quality: Mapped[float] = mapped_column(
        Float, nullable=False
    )  # соотношение цена-качество (1-5)
    from_admin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # Relationships
    energy_drink: Mapped[EnergyDrink] = relationship(backref="reviews")
    user: Mapped[User] = relationship(backref="reviews")
