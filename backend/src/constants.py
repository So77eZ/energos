from enum import Enum


class Role(str, Enum):
    USER = "user"
    ADMIN = "admin"


class EnergyDrinkAddRequestStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
