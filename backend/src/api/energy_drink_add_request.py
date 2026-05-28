from typing import List, Optional
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    File,
    UploadFile,
    Form,
    Path,
    Response,
)
from sqlalchemy import select
from sqlalchemy.orm import joinedload

from src.database import async_session_maker
from src.api.auth import get_current_user
from src.models.auth import User
from src.models.energy_drink_add_request import EnergyDrinkAddRequest
from src.schemas.energy_drink_add_request import (
    EnergyDrinkAddRequestRead,
    EnergyDrinkAddRequestUpdateStatus,
)
from src.constants import EnergyDrinkAddRequestStatus, Role

router = APIRouter()


def _get_image_mime_type(image_bytes: bytes) -> str:
    if image_bytes.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    elif image_bytes.startswith(b"\xff\xd8"):
        return "image/jpeg"
    elif image_bytes.startswith(b"GIF87a") or image_bytes.startswith(b"GIF89a"):
        return "image/gif"
    elif image_bytes.startswith(b"RIFF") and image_bytes[8:12] == b"WEBP":
        return "image/webp"
    return "image/jpeg"


@router.post("/", response_model=EnergyDrinkAddRequestRead)
async def create_request(
    name: str = Form(...),
    price: Optional[float] = Form(None),
    no_sugar: bool = Form(False),
    comment: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
):
    image_bytes = None
    if image:
        image_bytes = await image.read()

    async with async_session_maker() as session:
        new_request = EnergyDrinkAddRequest(
            name=name,
            price=price,
            no_sugar=no_sugar,
            comment=comment,
            image=image_bytes,
            user_id=current_user.id,
        )
        session.add(new_request)
        await session.commit()
        await session.refresh(new_request)

    res = EnergyDrinkAddRequestRead.model_validate(new_request)
    res.user_name = current_user.username
    return res


@router.get("/", response_model=List[EnergyDrinkAddRequestRead])
async def get_requests(
    current_user: User = Depends(get_current_user),
):
    async with async_session_maker() as session:
        query = select(EnergyDrinkAddRequest).options(
            joinedload(EnergyDrinkAddRequest.user)
        )
        if current_user.role != Role.ADMIN:
            query = query.where(EnergyDrinkAddRequest.user_id == current_user.id)

        result = await session.execute(query)
        requests = result.scalars().all()

        # Manually populate user_name from the joined user
        res = []
        for r in requests:
            p = EnergyDrinkAddRequestRead.model_validate(r)
            p.user_name = r.user.username if r.user else f"User {r.user_id}"
            res.append(p)
        return res


@router.get("/{id}/image")
async def get_request_image(
    id: int = Path(...),
):
    async with async_session_maker() as session:
        result = await session.execute(
            select(EnergyDrinkAddRequest).where(EnergyDrinkAddRequest.id == id)
        )
        db_request = result.scalar_one_or_none()

        if not db_request or not db_request.image:
            raise HTTPException(status_code=404, detail="Image not found")

        mime_type = _get_image_mime_type(db_request.image)
        return Response(content=db_request.image, media_type=mime_type)


@router.patch("/{id}/status", response_model=EnergyDrinkAddRequestRead)
async def update_request_status(
    status_update: EnergyDrinkAddRequestUpdateStatus,
    id: int = Path(...),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    async with async_session_maker() as session:
        result = await session.execute(
            select(EnergyDrinkAddRequest)
            .options(joinedload(EnergyDrinkAddRequest.user))
            .where(EnergyDrinkAddRequest.id == id)
        )
        db_request = result.scalar_one_or_none()

        if not db_request:
            raise HTTPException(status_code=404, detail="Request not found")

        db_request.status = status_update.status
        if status_update.admin_comment is not None:
            db_request.admin_comment = status_update.admin_comment

        if db_request.status != EnergyDrinkAddRequestStatus.PENDING:
            db_request.image = None

        await session.commit()
        await session.refresh(db_request)

        # Add user_name manually
        res = EnergyDrinkAddRequestRead.model_validate(db_request)
        res.user_name = (
            db_request.user.username
            if db_request.user
            else f"User {db_request.user_id}"
        )
        return res
