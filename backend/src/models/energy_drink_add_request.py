from sqlalchemy import String, Float, Boolean, LargeBinary, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING
from src.constants import EnergyDrinkAddRequestStatus

from src.models.base import Base

if TYPE_CHECKING:
    from src.models.auth import User


class EnergyDrinkAddRequest(Base):
    __tablename__ = "energy_drink_add_requests"

    name: Mapped[str] = mapped_column(String, nullable=False)
    price: Mapped[float | None] = mapped_column(Float, nullable=True)
    image: Mapped[bytes | None] = mapped_column(LargeBinary, nullable=True)
    no_sugar: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    comment: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(
        String, default=EnergyDrinkAddRequestStatus.PENDING, nullable=False
    )

    # Relationships
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    user: Mapped["User"] = relationship(back_populates="energy_drink_add_requests")
