from enum import StrEnum


class DeployEnv(StrEnum):
    DEV = "dev"
    PROD = "prod"


class Role(StrEnum):
    USER = "user"
    ADMIN = "admin"


class OrderDirection(StrEnum):
    ASC = "asc"
    DESC = "desc"


UserIdType = int

MAX_BODY_SIZE = 10 * 1024 * 1024  # 10 MB
MAX_IMAGE_SIDE = 1600

ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"]

BANNED_USERNAMES = {
    "admin",
    "administrator",
    "support",
    "root",
    "api",
    "help",
    "settings",
    "profile",
    "login",
    "logout",
    "register",
    "auth",
    "null",
    "undefined",
    "anonymous",
    "moderator",
    "system",
}
