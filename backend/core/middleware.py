from fastapi import FastAPI
from fastapi.responses import JSONResponse
from starlette.middleware.body_limit import RequestBodyLimitMiddleware
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

from core.config import settings
from core.content_too_large_middleware import ContentTooLargeResponseMiddleware
from core.exceptions import ContentTooLargeException


def setup_middlewares(app: FastAPI) -> None:
    app.add_middleware(ProxyHeadersMiddleware)
    app.add_middleware(RequestBodyLimitMiddleware, max_body_size=settings.MAX_ENERGY_DRINK_IMAGE_SIZE)
    app.add_middleware(
        ContentTooLargeResponseMiddleware,
        response=JSONResponse(
            status_code=ContentTooLargeException.status_code,
            content={
                "error": {
                    "code": ContentTooLargeException.error_code,
                    "message": ContentTooLargeException.default_message,
                }
            },
        ),
    )
