from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from config import settings

from src.api.base import api_router
from src.rate_limit import limiter
from slowapi.errors import RateLimitExceeded
from src.rate_limit import rate_limit_exceeded_handler

import uvicorn


class NoDirectAccessMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http" and settings.DEPLOY_ENV == "prod":
            request = Request(scope, receive)
            origin = request.headers.get("origin")
            if not origin:
                response = JSONResponse(
                    status_code=403, content={"detail": "Direct access not allowed"}
                )
                await response(scope, receive, send)
                return
        await self.app(scope, receive, send)


app = FastAPI(
    root_path="/api",
)

app.state.limiter = limiter


app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

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


app.include_router(api_router)

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
