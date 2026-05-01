from fastapi import FastAPI
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import HTMLResponse, JSONResponse
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from config import settings

from src.api.base import api_router
from src.rate_limit import limiter

import uvicorn


class NoDirectAccessMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        if settings.DEPLOY_ENV == "prod":
            origin = request.headers.get("origin")
            if not origin:
                return JSONResponse(
                    status_code=403, content={"detail": "Direct access not allowed"}
                )
        return await call_next(request)


app = FastAPI(
    root_path="/api",
)

if settings.DEPLOY_ENV == "dev":
    app.openapi_url = "/openapi.json"

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(SlowAPIMiddleware)
app.add_middleware(NoDirectAccessMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.ALLOWED_ORIGINS.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Energy drink rating API"}


@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html() -> HTMLResponse:
    assert app.openapi_url is not None, "app.openapi_url is None"
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title="API",
    )


app.include_router(api_router)

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
