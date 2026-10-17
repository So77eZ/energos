from datetime import datetime

from schemas.base import BaseSchema


class ImageData(BaseSchema):
    data: bytes | None
    content_type: str | None


class EnergyDrinkMetricsSchema(BaseSchema):
    avg_rating: float | None = None
    reviews_count: int = 0
    avg_acidity: float | None = None
    avg_sweetness: float | None = None
    avg_concentration: float | None = None
    avg_carbonation: float | None = None
    avg_aftertaste: float | None = None
    avg_price_quality: float | None = None


class EnergyDrinkBaseSchema(BaseSchema):
    name: str
    price: float | None = None
    no_sugar: bool = False


class EnergyDrinkCreateSchema(EnergyDrinkBaseSchema):
    pass


class EnergyDrinkUpdateSchema(BaseSchema):
    name: str | None = None
    price: float | None = None
    no_sugar: bool | None = None


class EnergyDrinkReadSchema(EnergyDrinkBaseSchema):
    id: int
    created_at: datetime


class EnergyDrinkWithMetricsReadSchema(EnergyDrinkReadSchema, EnergyDrinkMetricsSchema):
    pass
