from src.models.base import Base
from sqlalchemy import String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from src.models.auth import User
    from src.models.reviews import EnergyDrinkReview


class ReviewEmoji(Base):
    __tablename__ = "review_emojis"

    __table_args__ = (
        UniqueConstraint(
            "review_id", "user_id", "emoji_unicode", name="uq_user_review_emoji"
        ),
    )

    emoji_unicode: Mapped[str] = mapped_column(String, nullable=False)

    # Relationships
    review_id: Mapped[int] = mapped_column(
        ForeignKey("energy_drinks_reviews.id"), nullable=False
    )
    review: Mapped["EnergyDrinkReview"] = relationship(back_populates="review_emojis")

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    user: Mapped["User"] = relationship(back_populates="review_emojis")
