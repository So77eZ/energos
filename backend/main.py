from fastapi import FastAPI

from api.base import api_router_v1
from core.logging_config import setup_logging
from core.rate_limiter import setup_rate_limiter
from exceptions.exception_handlers import setup_exception_handlers
from middlewares.base import setup_middlewares

app = FastAPI(
    root_path="/api",
    docs_url="/docs",
    openapi_url="/openapi.json",
)
setup_middlewares(app)
setup_rate_limiter(app)
setup_exception_handlers(app)
setup_logging()

app.include_router(api_router_v1)
