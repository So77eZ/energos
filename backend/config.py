import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DB_URL: str = os.getenv("DATABASE_URL", "")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ACCESS_KEY: str = os.getenv("SUPABASE_ACCESS_KEY", "")
    SUPABASE_SECRET_KEY: str = os.getenv("SUPABASE_SECRET_KEY", "")
    SUPABASE_BUCKET_NAME: str = os.getenv("SUPABASE_BUCKET_NAME", "")
    SUPABASE_REGION: str = os.getenv("SUPABASE_REGION", "")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")


settings = Settings()
