from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.openapi.docs import get_swagger_ui_html
from starlette.middleware.cors import CORSMiddleware

from app.api.api import api_router
from app.api.models.energy_drink import EnergyDrink
from app.database import engine

import uvicorn


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(EnergyDrink.metadata.create_all)
    yield


app = FastAPI(
    openapi_url="/api/openapi.json",
    root_path="/api",
    lifespan=lifespan,
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
def root():
    return {"message": "Energy drink rating API"}


@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    assert app.openapi_url is not None, "app.openapi_url is None"
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title="API",
    )


app.include_router(api_router)

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
