from enum import StrEnum


class Role(StrEnum):
    USER = "user"
    ADMIN = "admin"


class DeployEnv(StrEnum):
    DEV = "dev"
    PROD = "prod"


MAX_ENERGY_DRINK_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB
ENERGY_DRINK_IMAGE_ALLOWED_TYPES = {"image/jpeg", "image/png"}
FILE_UPLOAD_CHUNK_SIZE = 1024 * 1024  # 1 MB

UserIdType = int
