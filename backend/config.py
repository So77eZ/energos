from pydantic_settings import BaseSettings
from pydantic import Field, field_validator


class Settings(BaseSettings):
    SECRET_KEY: str = Field(...)
    # pydantic v2 игнорирует env= у Field: переменная берётся из имени поля или alias
    DB_URL: str = Field(..., validation_alias="DATABASE_URL")
    SUPABASE_URL: str = Field(...)
    SUPABASE_ACCESS_KEY: str = Field(...)
    SUPABASE_SECRET_KEY: str = Field(...)
    SUPABASE_BUCKET_NAME: str = Field(...)
    SUPABASE_REGION: str = Field(...)
    ALLOWED_ORIGINS: str = Field(...)
    PUBLIC_URL: str = Field(...)
    DEPLOY_ENV: str = Field(...)

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
