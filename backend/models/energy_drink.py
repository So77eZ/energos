from typing import Any

from sqlalchemy import String, func, select
from sqlalchemy.orm import (
    InstrumentedAttribute,
    Mapped,
    column_property,
    declared_attr,
    mapped_column,
    relationship,
)

from models.base import Base
from models.review import Review


def _avg(model: Any, column: InstrumentedAttribute[Any]) -> Any:  # noqa: ANN401
    return column_property(
        select(func.avg(column)).where(Review.energy_drink_id == model.id).correlate_except(Review).scalar_subquery()
    )


def _count(model: Any, column: InstrumentedAttribute[Any]) -> Any:  # noqa: ANN401
    return column_property(
        select(func.count(column)).where(Review.energy_drink_id == model.id).correlate_except(Review).scalar_subquery()
    )


class EnergyDrink(Base):
    __tablename__ = "energy_drinks"
    __verbose_name__ = "Energy Drink"

    name: Mapped[str]
    price: Mapped[float | None]
    image: Mapped[bytes | None]
    image_content_type: Mapped[str | None] = mapped_column(String(50))
    no_sugar: Mapped[bool] = mapped_column(default=False)

    reviews: Mapped[list[Review]] = relationship(back_populates="energy_drink", cascade="all, delete-orphan")

    @declared_attr
    def avg_rating(cls) -> Mapped[float | None]:
        return _avg(cls, Review.rating)

    @declared_attr
    def avg_acidity(cls) -> Mapped[float | None]:
        return _avg(cls, Review.acidity)

    @declared_attr
    def avg_sweetness(cls) -> Mapped[float | None]:
        return _avg(cls, Review.sweetness)

    @declared_attr
    def avg_concentration(cls) -> Mapped[float | None]:
        return _avg(cls, Review.concentration)

    @declared_attr
    def avg_carbonation(cls) -> Mapped[float | None]:
        return _avg(cls, Review.carbonation)

    @declared_attr
    def avg_aftertaste(cls) -> Mapped[float | None]:
        return _avg(cls, Review.aftertaste)

    @declared_attr
    def avg_price_quality(cls) -> Mapped[float | None]:
        return _avg(cls, Review.price_quality)

    @declared_attr
    def reviews_count(cls) -> Mapped[int]:
        return _count(cls, Review.id)
