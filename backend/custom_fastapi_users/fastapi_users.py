from fastapi import APIRouter, Depends, Request, status
from fastapi_users import FastAPIUsers, models, schemas
from fastapi_users.manager import UserManagerDependency

from core.constants import UserIdType
from models import User
from services.user_manager import UserManager


class CustomFastAPIUsers(FastAPIUsers[User, UserIdType]):
    def __init__(
        self,
        get_user_manager: UserManagerDependency[User, UserIdType],
        auth_backends: list,
    ):
        super().__init__(get_user_manager, auth_backends)

    def get_register_router(self, user_schema: type[schemas.U], user_create_schema: type[schemas.UC]) -> APIRouter:
        return get_register_router(self.get_user_manager, user_schema, user_create_schema)


def get_register_router(
    get_user_manager: UserManagerDependency[models.UP, models.ID],
    user_schema: type[schemas.U],
    user_create_schema: type[schemas.UC],
) -> APIRouter:
    router = APIRouter()

    @router.post(
        "/register",
        response_model=user_schema,
        status_code=status.HTTP_201_CREATED,
        name="register:register",
    )
    async def register(
        request: Request,
        user_create: user_create_schema,  # type: ignore
        user_manager: UserManager = Depends(get_user_manager),
    ) -> User:
        return await user_manager.create(user_create, safe=True, request=request)

    return router
