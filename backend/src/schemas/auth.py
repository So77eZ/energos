from datetime import datetime

import re
from pydantic import BaseModel, ConfigDict, Field, field_validator


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        if not re.fullmatch(r"[a-zA-Z0-9_-]+", v):
            raise ValueError("Логин может содержать только буквы, цифры, _ и -")
        return v

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        errors = []
        if not re.search(r"[A-Z]", v):
            errors.append("хотя бы одну заглавную букву")
        if not re.search(r"[a-z]", v):
            errors.append("хотя бы одну строчную букву")
        if not re.search(r"\d", v):
            errors.append("хотя бы одну цифру")
        if errors:
            raise ValueError(f"Пароль должен содержать: {', '.join(errors)}")
        return v


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int = Field(...)
    username: str = Field(...)
    role: str = Field(...)
    created_at: datetime | None = Field(default=None)
    updated_at: datetime | None = Field(default=None)


class Token(BaseModel):
    access_token: str = Field(...)
    token_type: str = Field(default="bearer")


class TokenData(BaseModel):
    username: str | None = Field(default=None)
    token_type: str = Field(...)
