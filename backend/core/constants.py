from enum import StrEnum


class Role(StrEnum):
    USER = "user"
    ADMIN = "admin"


class DeployEnv(StrEnum):
    DEV = "dev"
    PROD = "prod"


UserIdType = int
