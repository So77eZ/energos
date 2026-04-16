from datetime import datetime

from sqlalchemy import Integer, String, Float, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from pydantic import BaseModel, Field, ConfigDict

from app.models.base import Base


class EnergyDrink(Base):
    __tablename__ = "energy_drinks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    price: Mapped[float | None] = mapped_column(Float, nullable=True)
    image_url: Mapped[str | None] = mapped_column(String, nullable=True)
    acidity: Mapped[int] = mapped_column(Integer, nullable=False)  # кислотность (1-5)
    sweetness: Mapped[int] = mapped_column(Integer, nullable=False)  # сладость (1-5)
    concentration: Mapped[int] = mapped_column(
        Integer, nullable=False
    )  # концентрация / интенсивность (1-5)
    carbonation: Mapped[int] = mapped_column(
        Integer, nullable=False
    )  # газированность (1-5)
    aftertaste: Mapped[int] = mapped_column(
        Integer, nullable=False
    )  # послевкусие (1-5)
    price_quality: Mapped[int] = mapped_column(
        Integer, nullable=False
    )  # соотношение цена-качество (1-5)
    no_sugar: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class EnergyDrinkSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int | None = None
    name: str
    price: float | None = None
    image_url: str | None = None
    acidity: int = Field(ge=1, le=5)  # кислотность (1-5)
    sweetness: int = Field(ge=1, le=5)  # сладость (1-5)
    concentration: int = Field(ge=1, le=5)  # концентрация / интенсивность (1-5)
    carbonation: int = Field(ge=1, le=5)  # газированность (1-5)
    aftertaste: int = Field(ge=1, le=5)  # послевкусие (1-5)
    price_quality: int = Field(ge=1, le=5)  # соотношение цена-качество (1-5)
    no_sugar: bool = False
    created_at: datetime | None = None
    updated_at: datetime | None = None
