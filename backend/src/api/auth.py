from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timezone

from src.schemas.auth import UserCreate, UserResponse, Token
from src.auth import create_access_token, verify_token, hash_password, verify_password
from src.models.auth import User
from src.database import async_session_maker
from src.rate_limit import limiter
from src.localization import localize_text
from sqlalchemy import select

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login/")


@router.post("/register/", response_model=UserResponse, status_code=201)
@limiter.limit("5/minute")
async def register_user(request: Request, payload: UserCreate) -> UserResponse:
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
) -> UserResponse:
    username = verify_token(token)
    if username is None:
        raise HTTPException(status_code=401, detail=localize_text("auth_error", request))
    async with async_session_maker() as session:
        query = select(User).where(User.username == username)
        result = await session.execute(query)
        user = result.scalar_one_or_none()
        if user is None:
            raise HTTPException(status_code=401, detail=localize_text("user_not_found", request))
        return user


@router.get("/me/", response_model=UserResponse)
async def read_users_me(
    current_user: UserResponse = Depends(get_current_user),
) -> UserResponse:
    return current_user
