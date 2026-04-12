from datetime import datetime

from sqlmodel import Field, SQLModel


class EnergyDrink(SQLModel, table=True):
    __tablename__ = "energy_drinks"

    id: int | None = Field(default=None, primary_key=True, ge=1)
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
