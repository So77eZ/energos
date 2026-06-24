from pydantic_settings import BaseSettings
from pydantic import Field, field_validator


class Settings(BaseSettings):
    SECRET_KEY: str = Field(..., env="SECRET_KEY")
    DB_URL: str = Field(..., env="DATABASE_URL")
    SUPABASE_URL: str = Field(..., env="SUPABASE_URL")
    SUPABASE_ACCESS_KEY: str = Field(..., env="SUPABASE_ACCESS_KEY")
    SUPABASE_SECRET_KEY: str = Field(..., env="SUPABASE_SECRET_KEY")
    SUPABASE_BUCKET_NAME: str = Field(..., env="SUPABASE_BUCKET_NAME")
    SUPABASE_REGION: str = Field(..., env="SUPABASE_REGION")
    SECRET_KEY: str = Field(..., env="SECRET_KEY")
    ALLOWED_ORIGINS: str = Field(..., env="ALLOWED_ORIGINS")
    PUBLIC_URL: str = Field(..., env="PUBLIC_URL")
    DEPLOY_ENV: str = Field(..., env="DEPLOY_ENV")

    @field_validator("SECRET_KEY")
    def validate_secret_key(cls, v: str) -> str:
        if v == "":
            raise ValueError("SECRET_KEY cannot be empty")
        if len(v) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters long")
        return v

    class Config:
        env_file = ".env"


settings = Settings()
