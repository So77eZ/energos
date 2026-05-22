from typing import List, Sequence
from fastapi import APIRouter, HTTPException, Path, Depends, Request, Response, Query
from datetime import datetime, timezone
from sqlalchemy import select, and_

from src.schemas.review_emoji import ReviewEmojiSchema
from src.api.auth import get_current_user
from src.database import async_session_maker
from src.localization import localize_text
from src.models.reviews import EnergyDrinkReview
from src.models.review_emoji import ReviewEmoji

router = APIRouter()


@router.get("/{review_id}/emojis/", response_model=List[ReviewEmojiSchema])
async def get_review_emojis(
    request: Request,
    review_id: int = Path(..., ge=1),
) -> Sequence[ReviewEmoji]:
    async with async_session_maker() as session:
        query = select(EnergyDrinkReview).where(EnergyDrinkReview.id == review_id)
        result = await session.execute(query)
        review = result.scalar_one_or_none()
        if not review:
            raise HTTPException(
                status_code=404, detail=localize_text("review_not_found", request)
            )

        emojis_query = select(ReviewEmoji).where(ReviewEmoji.review_id == review_id)
        emojis_result = await session.execute(emojis_query)
        return emojis_result.scalars().all()


@router.post("/{review_id}/emojis/", response_model=ReviewEmojiSchema, status_code=201)
async def add_emoji_to_review(
    request: Request,
    review_id: int = Path(..., ge=1),
    emoji: str = Query(
        ...,
    ),
    current_user=Depends(get_current_user),
) -> ReviewEmoji:
    async with async_session_maker() as session:
        query = select(EnergyDrinkReview).where(EnergyDrinkReview.id == review_id)
        result = await session.execute(query)
        review = result.scalar_one_or_none()
        if not review:
            raise HTTPException(
                status_code=404, detail=localize_text("review_not_found", request)
            )

        existing_emoji_query = select(ReviewEmoji).where(
            and_(
                ReviewEmoji.review_id == review_id,
                ReviewEmoji.user_id == current_user.id,
                ReviewEmoji.emoji_unicode == emoji,
            )
        )
        existing_emoji_result = await session.execute(existing_emoji_query)
        existing_emoji = existing_emoji_result.scalar_one_or_none()
        if existing_emoji:
            raise HTTPException(
                status_code=400,
                detail="You have already added this emoji to the review",
            )

        now = datetime.now(timezone.utc).replace(tzinfo=None)
        new_emoji = ReviewEmoji(
            review_id=review_id,
            user_id=current_user.id,
            emoji_unicode=emoji,
            created_at=now,
            updated_at=now,
        )
        session.add(new_emoji)
        await session.commit()
        await session.refresh(new_emoji)
        return new_emoji


@router.delete("/{review_id}/emojis/", status_code=204, response_class=Response)
async def remove_emoji_from_review(
    request: Request,
    review_id: int = Path(..., ge=1),
    emoji: str = Query(...),
    current_user=Depends(get_current_user),
) -> Response:
    async with async_session_maker() as session:
        query = select(ReviewEmoji).where(
            and_(
                ReviewEmoji.emoji_unicode == emoji,
                ReviewEmoji.review_id == review_id,
                ReviewEmoji.user_id == current_user.id,
            )
        )
        result = await session.execute(query)
        emoji_obj = result.scalar_one_or_none()

        if not emoji_obj:
            raise HTTPException(status_code=404, detail="Emoji reaction not found")

        await session.delete(emoji_obj)
        await session.commit()
        return Response(status_code=204)
