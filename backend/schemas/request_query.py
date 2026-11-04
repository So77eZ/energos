from pydantic import BaseModel, Field

from core.constants import OrderDirection


class RequestQuerySchema(BaseModel):
    limit: int = Field(default=20, ge=1)
    offset: int = Field(default=0, ge=0)
    order_by: str = Field(default="id")
    order_direction: OrderDirection = Field(default=OrderDirection.ASC)
