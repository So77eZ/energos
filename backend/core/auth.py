from fastapi_users import FastAPIUsers
from fastapi_users.authentication import AuthenticationBackend, BearerTransport, JWTStrategy

from core.config import settings
from core.constants import UserIdType
from models import User
from services.user_manager import get_user_manager

bearer_transport = BearerTransport(tokenUrl="/api/v1/auth/login")


def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(
        secret=settings.access_token.ACCESS_TOKEN_SECRET,
        lifetime_seconds=settings.access_token.TOKEN_LIFETIME_SECONDS,
        algorithm=settings.access_token.ACCESS_TOKEN_ALGORITHM,
    )


auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

fastapi_users = FastAPIUsers[User, UserIdType](
    get_user_manager=get_user_manager,
    auth_backends=[auth_backend],
)

get_current_user = fastapi_users.current_user()
