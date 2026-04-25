from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import HTMLResponse
from starlette.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.api import api_router
from app.database import async_session_maker

import uvicorn


async def _sync_sequences() -> None:
    """Reset PostgreSQL sequences to match the current max IDs after direct imports."""
    tables = ["energy_drinks", "energy_drinks_reviews", "users"]
    async with async_session_maker() as session:
        for table in tables:
            await session.execute(
                text(
                    f"SELECT setval(pg_get_serial_sequence('{table}', 'id'), "
                    f"COALESCE((SELECT MAX(id) FROM {table}), 1))"
                )
            )
        await session.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await _sync_sequences()
    yield


app = FastAPI(
    lifespan=lifespan,
    openapi_url="/api/openapi.json",
    root_path="/api",
)
origins = [
    "http://127.0.0.1:8000/",
    "http://localhost:8000/",
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["DELETE", "GET", "POST", "PUT"],
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
