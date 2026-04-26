import asyncio
import subprocess
import sys

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from config import settings


async def should_stamp_head(db_url: str) -> bool:
    engine = create_async_engine(db_url)
    try:
        async with engine.connect() as connection:
            alembic_exists = await connection.scalar(
                text("SELECT to_regclass('public.alembic_version') IS NOT NULL")
            )
            if alembic_exists:
                return False

            app_table_exists = await connection.scalar(
                text("SELECT to_regclass('public.energy_drinks') IS NOT NULL")
            )
            return bool(app_table_exists)
    finally:
        await engine.dispose()


def run_alembic(*args: str) -> None:
    subprocess.run([sys.executable, "-m", "alembic", *args], check=True)


def main() -> None:
    db_url = settings.DB_URL
    if not db_url:
        raise RuntimeError("DATABASE_URL is required for migrations")

    if asyncio.run(should_stamp_head(db_url)):
        run_alembic("stamp", "head")

    run_alembic("upgrade", "head")


if __name__ == "__main__":
    main()
