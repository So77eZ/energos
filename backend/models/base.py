from datetime import datetime
from typing import TypeVar

from sqlalchemy import func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class AbstractBase(DeclarativeBase):
    __abstract__ = True


class MetadataMixin:
    __abstract__ = True

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now(), nullable=True)


class Base(AbstractBase, MetadataMixin):
    __abstract__ = True


class AssociativeBase(AbstractBase):
    __abstract__ = True


BaseModelType = TypeVar("BaseModelType", bound=Base)
AssociativeModelType = TypeVar("AssociativeModelType", bound=AssociativeBase)
