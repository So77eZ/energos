from fastapi import FastAPI
from starlette.middleware.body_limit import RequestBodyLimitMiddleware
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

from core.config import settings


def setup_middlewares(app: FastAPI) -> None:
    app.add_middleware(ProxyHeadersMiddleware)
    app.add_middleware(RequestBodyLimitMiddleware, max_body_size=settings.MAX_ENERGY_DRINK_IMAGE_SIZE)
