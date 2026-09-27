from pydantic import BaseModel, Field
from typing import Optional

# Лимиты длины строк заявки (#115): совпадают с maxLength на фронте
REQUEST_NAME_MAX = 80
REQUEST_COMMENT_MAX = 500


class EnergyDrinkAddRequestRead(BaseModel):
    id: int
    name: str
    price: Optional[float] = None
    no_sugar: bool
    comment: Optional[str] = None
    admin_comment: Optional[str] = None
    status: str
    user_id: int
    user_name: Optional[str] = None

    class Config:
        from_attributes = True


class EnergyDrinkAddRequestUpdateStatus(BaseModel):
    status: str
    admin_comment: Optional[str] = Field(default=None, max_length=REQUEST_COMMENT_MAX)
