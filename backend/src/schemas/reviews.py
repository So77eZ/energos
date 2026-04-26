from datetime import datetime

from pydantic import BaseModel, Field, ConfigDict


class EnergyDrinkReviewSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int | None = Field(default=None)
    energy_drink_id: int = Field(..., ge=1)
    user_id: int = Field(..., ge=1)
    comment: str | None = Field(default=None)
    rating: float = Field(..., ge=1, le=5)
    acidity: float = Field(..., ge=1, le=5)
    sweetness: float = Field(..., ge=1, le=5)
    concentration: float = Field(..., ge=1, le=5)
    carbonation: float = Field(..., ge=1, le=5)
    aftertaste: float = Field(..., ge=1, le=5)
    price_quality: float = Field(..., ge=1, le=5)
    from_admin: bool = Field(default=False)
    created_at: datetime | None = Field(default=None)
    updated_at: datetime | None = Field(default=None)
    username: str | None = Field(default=None)
