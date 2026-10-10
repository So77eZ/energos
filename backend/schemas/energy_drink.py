from typing import Optional

from schemas.base import BaseSchema
from schemas.review import ReviewForUserSchema


class ImageData(BaseSchema):
    data: bytes | None
    content_type: str | None


class EnergyDrinkBase(BaseSchema):
    name: str
    price: Optional[float] = None
    no_sugar: bool = False


class EnergyDrinkSchema(EnergyDrinkBase):
    id: int
    created_at: str


class EnergyDrinkWithReviewsSchema(EnergyDrinkSchema):
    reviews: list[ReviewForUserSchema] = []


class EnergyDrinkCreateSchema(EnergyDrinkBase):
    pass


class EnergyDrinkUpdateSchema(BaseSchema):
    name: Optional[str] = None
    price: Optional[float] = None
    no_sugar: Optional[bool] = None
