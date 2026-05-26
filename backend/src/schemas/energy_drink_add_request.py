from pydantic import BaseModel
from typing import Optional


class EnergyDrinkAddRequestRead(BaseModel):
    id: int
    name: str
    price: Optional[float] = None
    no_sugar: bool
    status: str
    user_id: int

    class Config:
        from_attributes = True


class EnergyDrinkAddRequestUpdateStatus(BaseModel):
    status: str
