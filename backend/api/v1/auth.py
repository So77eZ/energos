from core.auth import auth_backend, fastapi_users
from core.router import AutoStatusAPIRouter
from schemas.user import UserCreate, UserRead, UserUpdate

router = AutoStatusAPIRouter()

# /login
# /logout
router.include_router(fastapi_users.get_auth_router(auth_backend))

# /register
router.include_router(fastapi_users.get_register_router(UserRead, UserCreate))

# /reset-password
router.include_router(fastapi_users.get_reset_password_router())

# /verify
router.include_router(fastapi_users.get_verify_router(UserRead))

# /me (GET, PATCH); заодно /{id} (GET, PATCH, DELETE) — только для superuser
router.include_router(fastapi_users.get_users_router(UserRead, UserUpdate))
