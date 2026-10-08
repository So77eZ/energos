from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base

if TYPE_CHECKING:
    from models.review import Review


class EnergyDrink(Base):
    __tablename__ = "energy_drinks"
    __verbose_name__ = "Energy drink"

    name: Mapped[str]
    price: Mapped[float | None]
    image: Mapped[bytes | None]
    image_content_type: Mapped[str | None] = mapped_column(String(50))
    no_sugar: Mapped[bool] = mapped_column(default=False)

    reviews: Mapped[list[Review]] = relationship(back_populates="energy_drink", cascade="all, delete-orphan")
