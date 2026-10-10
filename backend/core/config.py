from pydantic import Field, field_validator
from pydantic_settings import BaseSettings


class AccessTokenSettings(BaseSettings):
    ACCESS_TOKEN_ALGORITHM: str = Field(...)
    ACCESS_TOKEN_SECRET: str = Field(...)
    RESET_PASSWORD_TOKEN_SECRET: str = Field(...)
    VERIFICATION_TOKEN_SECRET: str = Field(...)
    TOKEN_LIFETIME_SECONDS: int = Field(...)

    @field_validator("ACCESS_TOKEN_SECRET", "RESET_PASSWORD_TOKEN_SECRET", "VERIFICATION_TOKEN_SECRET")
    def validate_secret_keys(cls, v: str) -> str:
        if len(v) < 32:
            raise ValueError("secret keys must be at least 32 characters long")
        return v


class EmailSettings(BaseSettings):
    SMTP_HOST: str = Field(...)
    SMTP_PORT: int = Field(...)
    SMTP_USERNAME: str = Field(...)
    SMTP_PASSWORD: str = Field(...)
    SMTP_FROM: str = Field(...)
    SMTP_USE_TLS: bool = Field(...)


class Settings(BaseSettings):
    DB_USER: str = Field(...)
    DB_PASSWORD: str = Field(...)
    DB_HOST: str = Field(...)
    DB_NAME: str = Field(...)

    PUBLIC_URL: str = Field(...)
    DEPLOY_ENV: str = Field(...)

    MAX_ENERGY_DRINK_IMAGE_SIZE: int = Field(...)

    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}/{self.DB_NAME}"

    access_token: AccessTokenSettings = AccessTokenSettings()
    email: EmailSettings = EmailSettings()


settings = Settings()
