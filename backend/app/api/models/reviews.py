from datetime import datetime

from sqlalchemy import Integer, Float, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from pydantic import BaseModel, Field, ConfigDict

from app.models.base import Base


class EnergyDrinkReview(Base):
    __tablename__ = "energy_drinks_reviews"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    energy_drink_id: Mapped[int] = mapped_column(Integer, nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, nullable=False)
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
    created_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    from_admin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)


class EnergyDrinkReviewSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int | None = None
    energy_drink_id: int
    user_id: int | None = None
    rating: float = Field(..., ge=1, le=5)
    acidity: float = Field(..., ge=1, le=5)
    sweetness: float = Field(..., ge=1, le=5)
    concentration: float = Field(..., ge=1, le=5)
    carbonation: float = Field(..., ge=1, le=5)
    aftertaste: float = Field(..., ge=1, le=5)
    price_quality: float = Field(..., ge=1, le=5)
    from_admin: bool = False
    created_at: datetime | None = None
    updated_at: datetime | None = None
