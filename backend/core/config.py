from pydantic import Field, field_validator
from pydantic_settings import BaseSettings


class AccessTokenSettings(BaseSettings):
    ACCESS_TOKEN_ALGORITHM: str = Field(..., alias="ACCESS_TOKEN_ALGORITHM")
    ACCESS_TOKEN_SECRET: str = Field(..., alias="ACCESS_TOKEN_SECRET")
    RESET_PASSWORD_TOKEN_SECRET: str = Field(..., alias="RESET_PASSWORD_TOKEN_SECRET")
    VERIFICATION_TOKEN_SECRET: str = Field(..., alias="VERIFICATION_TOKEN_SECRET")
    TOKEN_LIFETIME_SECONDS: int = Field(..., alias="TOKEN_LIFETIME_SECONDS")

    @field_validator("ACCESS_TOKEN_SECRET", "RESET_PASSWORD_TOKEN_SECRET", "VERIFICATION_TOKEN_SECRET")
    def validate_secret_keys(cls, v: str) -> str:
        if len(v) < 32:
            raise ValueError("secret keys must be at least 32 characters long")
        return v


class EmailSettings(BaseSettings):
    SMTP_HOST: str = Field(..., alias="SMTP_HOST")
    SMTP_PORT: int = Field(..., alias="SMTP_PORT")
    SMTP_USERNAME: str = Field(..., alias="SMTP_USERNAME")
    SMTP_PASSWORD: str = Field(..., alias="SMTP_PASSWORD")
    SMTP_FROM: str = Field(..., alias="SMTP_FROM")
    SMTP_USE_TLS: bool = Field(..., alias="SMTP_USE_TLS")


class Settings(BaseSettings):
    DB_USER: str = Field(...)
    DB_PASSWORD: str = Field(...)
    DB_HOST: str = Field(...)
    DB_NAME: str = Field(...)

    ALLOWED_ORIGINS: str = Field(...)
    PUBLIC_URL: str = Field(...)
    DEPLOY_ENV: str = Field(...)

    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}/{self.DB_NAME}"

    access_token: AccessTokenSettings = AccessTokenSettings()
    email: EmailSettings = EmailSettings()


settings = Settings()
