from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class EnergyDrinkSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int | None = Field(default=None)
    name: str = Field(...)
    price: float | None = Field(default=None)
    image_url: str | None = Field(default=None)
    no_sugar: bool = Field(default=False)
    created_at: datetime | None = Field(default=None)
    updated_at: datetime | None = Field(default=None)
