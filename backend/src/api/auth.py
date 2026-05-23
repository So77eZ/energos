from fastapi import APIRouter, HTTPException, Depends, Request, Response
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timezone

from src.schemas.auth import UserCreate, UserResponse, Token
from src.schemas.energy_drink import EnergyDrinkSchema
from src.auth import create_access_token, verify_token, hash_password, verify_password
from src.models.auth import User
from src.models.energy_drinks import EnergyDrink
from src.database import async_session_maker
from src.rate_limiter import limiter
from src.localization import localize_text
from sqlalchemy import select
from sqlalchemy.orm import selectinload

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login/")


@router.post("/register/", response_model=UserResponse, status_code=201)
@limiter.limit("5/minute")
async def register_user(request: Request, payload: UserCreate) -> User:
    async with async_session_maker() as session:
        query = select(User).where(User.username == payload.username)
        result = await session.execute(query)
        existing_user = result.scalar_one_or_none()
        if existing_user:
            raise HTTPException(
                status_code=400, detail=localize_text("username_taken", request)
            )

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    hashed_password = hash_password(payload.password)
    user = User(
        username=payload.username,
        password_hash=hashed_password,
        role="user",
        created_at=now,
        updated_at=now,
    )
    async with async_session_maker() as session:
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user


@router.post("/login/", response_model=Token)
@limiter.limit("10/minute")
async def login_for_access_token(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> dict[str, str]:
    async with async_session_maker() as session:
        query = select(User).where(User.username == form_data.username)
        result = await session.execute(query)
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(
                status_code=401,
                detail=localize_text("invalid_credentials", request),
                headers={"WWW-Authenticate": "Bearer"},
            )
        if not verify_password(form_data.password, user.password_hash):
            raise HTTPException(
                status_code=401,
                detail=localize_text("invalid_credentials", request),
                headers={"WWW-Authenticate": "Bearer"},
            )
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


async def get_current_user(
    request: Request,
    token: str = Depends(oauth2_scheme),
) -> User:
    username = verify_token(token)
    if username is None:
        raise HTTPException(
            status_code=401, detail=localize_text("auth_error", request)
        )
    async with async_session_maker() as session:
        query = select(User).where(User.username == username)
        result = await session.execute(query)
        user = result.scalar_one_or_none()
        if user is None:
            raise HTTPException(
                status_code=401, detail=localize_text("user_not_found", request)
            )
        return user


@router.get("/me/", response_model=UserResponse)
async def read_users_me(
    current_user: User = Depends(get_current_user),
) -> User:
    return current_user


@router.get("/me/favorites/", response_model=list[EnergyDrinkSchema])
async def get_favorite_drinks(
    request: Request,
    current_user: User = Depends(get_current_user),
) -> list[EnergyDrink]:
    async with async_session_maker() as session:
        query = (
            select(User)
            .where(User.id == current_user.id)
            .options(selectinload(User.favorite_energy_drinks))
        )
        result = await session.execute(query)
        user = result.scalar_one()
        return list(user.favorite_energy_drinks)


@router.post("/me/favorites/{energy_drink_id}/", status_code=201)
async def add_favorite_drink(
    request: Request,
    energy_drink_id: int,
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    async with async_session_maker() as session:
        query = (
            select(User)
            .where(User.id == current_user.id)
            .options(selectinload(User.favorite_energy_drinks))
        )
        result = await session.execute(query)
        user = result.scalar_one()

        drink_query = select(EnergyDrink).where(EnergyDrink.id == energy_drink_id)
        drink_result = await session.execute(drink_query)
        drink = drink_result.scalar_one_or_none()

        if not drink:
            raise HTTPException(
                status_code=404, detail=localize_text("drink_not_found", request)
            )

        if any(d.id == energy_drink_id for d in user.favorite_energy_drinks):
            raise HTTPException(
                status_code=400, detail=localize_text("already_in_favorites", request)
            )

        user.favorite_energy_drinks.append(drink)
        await session.commit()
        return {"message": "Energy drink added to favorites"}


@router.delete(
    "/me/favorites/{energy_drink_id}/", status_code=204, response_class=Response
)
async def remove_favorite_drink(
    request: Request,
    energy_drink_id: int,
    current_user: User = Depends(get_current_user),
):
    async with async_session_maker() as session:
        query = (
            select(User)
            .where(User.id == current_user.id)
            .options(selectinload(User.favorite_energy_drinks))
        )
        result = await session.execute(query)
        user = result.scalar_one()

        drink_to_remove = next(
            (d for d in user.favorite_energy_drinks if d.id == energy_drink_id), None
        )

        if not drink_to_remove:
            raise HTTPException(
                status_code=404, detail=localize_text("not_in_favorites", request)
            )

        user.favorite_energy_drinks.remove(drink_to_remove)
        await session.commit()
        return Response(status_code=204)
