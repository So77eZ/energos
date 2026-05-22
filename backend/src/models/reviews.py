from src.models.base import Base

from sqlalchemy import Float, Boolean, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship


from typing import TYPE_CHECKING, List

if TYPE_CHECKING:
    from src.models.review_emoji import ReviewEmoji
    from src.models.energy_drinks import EnergyDrink
    from src.models.auth import User


class EnergyDrinkReview(Base):
    __tablename__ = "energy_drinks_reviews"

    comment: Mapped[str | None] = mapped_column(String, nullable=True)
    acidity: Mapped[float] = mapped_column(Float, nullable=False)  # кислотность (1-5)
    sweetness: Mapped[float] = mapped_column(Float, nullable=False)  # сладость (1-5)
    concentration: Mapped[float] = mapped_column(
        Float, nullable=False
    )  # концентрация (1-5)
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

    # Relationships
    energy_drink_id: Mapped[int] = mapped_column(
        ForeignKey("energy_drinks.id"), nullable=False
    )
    energy_drink: Mapped["EnergyDrink"] = relationship(back_populates="reviews")

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    user: Mapped["User"] = relationship(back_populates="reviews")

    review_emojis: Mapped[List["ReviewEmoji"]] = relationship(
        back_populates="review", cascade="all, delete-orphan"
    )
