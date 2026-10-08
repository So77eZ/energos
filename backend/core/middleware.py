from typing import Callable

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.datastructures import Address
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.body_limit import RequestBodyLimitMiddleware
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

from core.config import settings
from core.constants import MAX_ENERGY_DRINK_IMAGE_SIZE, DeployEnv


class NoDirectAccessMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        request_address: Address | None = request.client
        allowed_origins = settings.ALLOWED_ORIGINS.split(",")
        allowed_origins = list(map(lambda origin: origin.split("//")[-1].split(":")[0], allowed_origins))

        if (
            settings.DEPLOY_ENV == DeployEnv.PROD
            and request_address is not None
            and request_address.host not in allowed_origins
        ):
            response = JSONResponse(status_code=403, content={"detail": "Direct access not allowed"})
        else:
            response = await call_next(request)

        return response


def setup_middlewares(app: FastAPI) -> None:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=(settings.ALLOWED_ORIGINS.split(",")),
        allow_credentials=True,
        allow_methods=("*"),
        allow_headers=("*"),
    )
    app.add_middleware(ProxyHeadersMiddleware)
    app.add_middleware(NoDirectAccessMiddleware)
    app.add_middleware(RequestBodyLimitMiddleware, max_body_size=MAX_ENERGY_DRINK_IMAGE_SIZE)
