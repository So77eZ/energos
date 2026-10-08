from fastapi import FastAPI, HTTPException, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi_users.router.common import ErrorCode

from core.exceptions import (
    BadRequestException,
    ForbiddenException,
    InternalServerErrorException,
    ObjectNotFoundException,
)


def _add_validation_exception_handler(app: FastAPI) -> None:
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        errors = exc.errors()

        invalid_body = any(
            error["type"] == "json_invalid" or (error["loc"] == ("body",) and isinstance(error.get("input"), bytes))
            for error in errors
        )

        status_code = 400 if invalid_body else 422

        return JSONResponse(status_code=status_code, content={"detail": jsonable_encoder(errors)})


def _add_bad_credentials_exception_handler(app: FastAPI) -> None:
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
        status_code = 401 if exc.detail == ErrorCode.LOGIN_BAD_CREDENTIALS else exc.status_code
        return JSONResponse(status_code=status_code, content={"detail": exc.detail})


def _add_object_not_found_exception_handler(app: FastAPI) -> None:
    @app.exception_handler(ObjectNotFoundException)
    async def object_not_found_exception_handler(request: Request, exc: ObjectNotFoundException) -> JSONResponse:
        return JSONResponse(status_code=404, content={"detail": exc.detail})


def _add_forbidden_exception_handler(app: FastAPI) -> None:
    @app.exception_handler(ForbiddenException)
    async def forbidden_exception_handler(request: Request, exc: ForbiddenException) -> JSONResponse:
        return JSONResponse(status_code=403, content={"detail": exc.detail})


def _add_bad_request_exception_handler(app: FastAPI) -> None:
    @app.exception_handler(BadRequestException)
    async def bad_request_exception_handler(request: Request, exc: BadRequestException) -> JSONResponse:
        return JSONResponse(status_code=400, content={"detail": exc.detail})


def _add_internal_server_error_exception_handler(app: FastAPI) -> None:
    @app.exception_handler(InternalServerErrorException)
    async def internal_server_error_exception_handler(
        request: Request, exc: InternalServerErrorException
    ) -> JSONResponse:
        return JSONResponse(status_code=500, content={"detail": exc.detail})


def setup_exception_handlers(app: FastAPI) -> None:
    _add_validation_exception_handler(app)
    _add_bad_credentials_exception_handler(app)
    _add_object_not_found_exception_handler(app)
    _add_forbidden_exception_handler(app)
    _add_bad_request_exception_handler(app)
    _add_internal_server_error_exception_handler(app)
