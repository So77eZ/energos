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

# /me (GET, PATCH); заодно /{id} (GET, PATCH, DELETE) — только для superuser.
# Отдельный роутер: на него не вешается лимит 10/минуту, действующий на остальной /auth
# (см. api/base.py). Фронт зовёт GET /auth/me на каждый рендер страницы, а с сервера Next
# все запросы приходят с одного IP — иначе лимит выбирается за секунды и разлогинивает всех.
users_router = AutoStatusAPIRouter()
users_router.include_router(fastapi_users.get_users_router(UserRead, UserUpdate))
