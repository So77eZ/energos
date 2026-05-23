from sqlalchemy import Table, Column, Integer, ForeignKey
from src.models.base import Base

user_favorite_drinks = Table(
    "user_favorite_drinks",
    Base.metadata,
    Column(
        "user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    ),
    Column(
        "energy_drink_id",
        Integer,
        ForeignKey("energy_drinks.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)
