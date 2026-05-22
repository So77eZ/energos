from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ReviewEmojiSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int | None = Field(default=None)
    emoji_unicode: str = Field(...)
    review_id: int = Field(..., ge=1)
    user_id: int = Field(..., ge=1)
    created_at: datetime | None = Field(default=None)
    updated_at: datetime | None = Field(default=None)


class CreateReviewEmojiSchema(BaseModel):
    emoji_unicode: str = Field(...)
    review_id: int = Field(..., ge=1)
