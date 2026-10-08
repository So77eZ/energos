from fastapi import FastAPI

from api.base import api_router_v1
from core.exception_handlers import setup_exception_handlers
from core.middleware import setup_middlewares
from core.rate_limiter import setup_rate_limiter

app = FastAPI(
    root_path="/api",
    docs_url="/docs",
    openapi_url="/openapi.json",
)
setup_middlewares(app)
setup_rate_limiter(app)
setup_exception_handlers(app)

app.include_router(api_router_v1)
