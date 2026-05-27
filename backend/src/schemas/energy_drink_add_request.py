from pydantic import BaseModel
from typing import Optional


class EnergyDrinkAddRequestRead(BaseModel):
    id: int
    name: str
    price: Optional[float] = None
    no_sugar: bool
    comment: Optional[str] = None
    status: str
    user_id: int
    user_name: Optional[str] = None

    class Config:
        from_attributes = True


class EnergyDrinkAddRequestUpdateStatus(BaseModel):
    status: str
