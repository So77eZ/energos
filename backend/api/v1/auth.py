from core.auth import auth_backend, fastapi_users
from core.router import AutoStatusAPIRouter
from schemas.user import UserCreate, UserRead, UserUpdate
from fastapi import Depends
from fastapi_limitex import RateLimiter

router = AutoStatusAPIRouter()

# /login
# /logout
router.include_router(fastapi_users.get_auth_router(auth_backend), dependencies=[Depends(RateLimiter("10/minute"))])

# /register
router.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate), dependencies=[Depends(RateLimiter("10/minute"))]
)

# /reset-password
router.include_router(fastapi_users.get_reset_password_router(), dependencies=[Depends(RateLimiter("10/minute"))])

# /verify
router.include_router(fastapi_users.get_verify_router(UserRead), dependencies=[Depends(RateLimiter("10/minute"))])

# /me
router.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate), dependencies=[Depends(RateLimiter("100/minute"))]
)
