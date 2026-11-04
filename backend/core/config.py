from pydantic import field_validator
from pydantic_settings import BaseSettings


class AccessTokenSettings(BaseSettings):
    ACCESS_TOKEN_ALGORITHM: str
    ACCESS_TOKEN_SECRET: str
    RESET_PASSWORD_TOKEN_SECRET: str
    VERIFICATION_TOKEN_SECRET: str
    TOKEN_LIFETIME_SECONDS: int

    @field_validator("ACCESS_TOKEN_SECRET", "RESET_PASSWORD_TOKEN_SECRET", "VERIFICATION_TOKEN_SECRET")
    def validate_secret_keys(cls, v: str) -> str:
        if len(v) < 32:
            raise ValueError("secret keys must be at least 32 characters long")
        return v


class EmailSettings(BaseSettings):
    SMTP_HOST: str
    SMTP_PORT: int
    SMTP_USERNAME: str
    SMTP_PASSWORD: str
    SMTP_FROM: str
    SMTP_REPLY_TO: str
    SMTP_START_TLS: bool
    SMTP_USE_TLS: bool


class Settings(BaseSettings):
    DB_USER: str
    DB_PASSWORD: str
    DB_HOST: str
    DB_NAME: str

    PUBLIC_URL: str
    DEPLOY_ENV: str

    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}/{self.DB_NAME}"

    access_token: AccessTokenSettings = AccessTokenSettings()
    email: EmailSettings = EmailSettings()


settings = Settings()
