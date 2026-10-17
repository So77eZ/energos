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
