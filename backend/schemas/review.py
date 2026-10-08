from typing import Optional

from pydantic import Field

from schemas.base import BaseSchema


class ReviewBase(BaseSchema):
    acidity: float = Field(ge=0, le=5)
    sweetness: float = Field(ge=0, le=5)
    concentration: float = Field(ge=0, le=5)
    carbonation: float = Field(ge=0, le=5)
    aftertaste: float = Field(ge=0, le=5)
    price_quality: float = Field(ge=0, le=5)
    overall: float = Field(ge=0, le=5)


class ReviewSchema(ReviewBase):
    id: int


class ReviewForUserSchema(BaseSchema):
    acidity: float = Field(ge=0, le=5)
    sweetness: float = Field(ge=0, le=5)
    concentration: float = Field(ge=0, le=5)
    carbonation: float = Field(ge=0, le=5)
    aftertaste: float = Field(ge=0, le=5)
    price_quality: float = Field(ge=0, le=5)
    overall: float = Field(ge=0, le=5)


class ReviewCreateSchema(ReviewBase):
    pass


class ReviewCreateInternalSchema(ReviewCreateSchema):
    energy_drink_id: int
    user_id: int


class ReviewUpdateSchema(BaseSchema):
    comment: Optional[str] = Field(default=None, max_length=1000)
    acidity: Optional[float] = Field(ge=0, le=5)
    sweetness: Optional[float] = Field(ge=0, le=5)
    concentration: Optional[float] = Field(ge=0, le=5)
    carbonation: Optional[float] = Field(ge=0, le=5)
    aftertaste: Optional[float] = Field(ge=0, le=5)
    price_quality: Optional[float] = Field(ge=0, le=5)
    overall: Optional[float] = Field(ge=0, le=5)
