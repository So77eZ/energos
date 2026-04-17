from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from app.api.crud import auth
from app.api.models.auth import UserCreate, UserResponse, Token
from app.auth import create_access_token, verify_token

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login/")


@router.post("/register/", response_model=UserResponse, status_code=201)
async def register_user(payload: UserCreate) -> UserResponse:
    existing_user = await auth.get_user_by_username(payload.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    user = await auth.create_user(payload.username, payload.password)
    return user


@router.post("/login/", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> dict[str, str]:
    user = await auth.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserResponse:
    username = verify_token(token)
    if username is None:
        raise HTTPException(
            status_code=401, detail="Invalid authentication credentials"
        )
    user = await auth.get_user_by_username(username)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.get("/me/", response_model=UserResponse)
async def read_users_me(
    current_user: UserResponse = Depends(get_current_user),
) -> UserResponse:
    return current_user
