import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi_users.router.common import ErrorCode as FastAPIUsersErrorCode

from core.error_codes import ErrorCode
from core.exceptions import BaseServiceException

logger = logging.getLogger(__name__)


def _error_response(status_code: int, code: str, message: str, **extra: dict) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"error": {"code": code, "message": message, **extra}},
    )


def _add_service_exception_handler(app: FastAPI) -> None:
    @app.exception_handler(BaseServiceException)
    async def service_exception_handler(request: Request, exc: BaseServiceException) -> JSONResponse:
        return _error_response(status_code=exc.status_code, code=exc.error_code, message=exc.message, **exc.extra)


def _add_validation_exception_handler(app: FastAPI) -> None:
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        errors = jsonable_encoder(exc.errors())
        invalid_body = any(
            err["type"] == "json_invalid" or (err["loc"] == ("body",) and isinstance(err.get("input"), bytes))
            for err in exc.errors()
        )
        if invalid_body:
            return _error_response(400, ErrorCode.INVALID_JSON, "Invalid JSON body")
        return _error_response(422, ErrorCode.VALIDATION_ERROR, "Request validation failed", fields=errors)


def _add_http_exception_handler(app: FastAPI) -> None:
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
        if exc.detail == FastAPIUsersErrorCode.LOGIN_BAD_CREDENTIALS:
            return _error_response(401, ErrorCode.BAD_CREDENTIALS, message=exc.detail)
        return _error_response(exc.status_code, f"HTTP_{exc.status_code}", message=exc.detail)


def _add_unhandled_exception_handler(app: FastAPI) -> None:
    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
        return _error_response(500, ErrorCode.INTERNAL_ERROR, message="Internal server error")


def setup_exception_handlers(app: FastAPI) -> None:
    _add_service_exception_handler(app)
    _add_validation_exception_handler(app)
    _add_http_exception_handler(app)
    _add_unhandled_exception_handler(app)
