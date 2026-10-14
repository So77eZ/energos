from enum import StrEnum


class DeployEnv(StrEnum):
    DEV = "dev"
    PROD = "prod"


class Role(StrEnum):
    USER = "user"
    ADMIN = "admin"


UserIdType = int
