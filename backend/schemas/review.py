from typing import Optional

from pydantic import Field

from schemas.base import BaseSchema
from schemas.user import SimpleUserSchema


class ReviewBase(BaseSchema):
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = Field(default=None, max_length=1000)
    acidity: int = Field(ge=1, le=5)
    sweetness: int = Field(ge=1, le=5)
    concentration: int = Field(ge=1, le=5)
    carbonation: int = Field(ge=1, le=5)
    aftertaste: int = Field(ge=1, le=5)
    price_quality: int = Field(ge=1, le=5)


class ReviewCreateSchema(ReviewBase):
    pass


class ReviewCreateInternalSchema(ReviewCreateSchema):
    energy_drink_id: int
    user_id: int


class ReviewUpdateSchema(BaseSchema):
    rating: Optional[int] = Field(default=None, ge=1, le=5)
    comment: Optional[str] = Field(default=None, max_length=1000)
    acidity: Optional[int] = Field(default=None, ge=1, le=5)
    sweetness: Optional[int] = Field(default=None, ge=1, le=5)
    concentration: Optional[int] = Field(default=None, ge=1, le=5)
    carbonation: Optional[int] = Field(default=None, ge=1, le=5)
    aftertaste: Optional[int] = Field(default=None, ge=1, le=5)
    price_quality: Optional[int] = Field(default=None, ge=1, le=5)


class ReviewReadSchema(ReviewBase):
    id: int
    user: SimpleUserSchema
    created_at: str


class ReviewForUserSchema(ReviewBase):
    pass
