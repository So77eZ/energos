from datetime import datetime
from typing import ClassVar, TypeVar

from sqlalchemy import DateTime, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class AbstractBase(DeclarativeBase):
    __abstract__ = True


class MetadataMixin:
    __abstract__ = True

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


class Base(AbstractBase, MetadataMixin):
    __abstract__ = True
    __verbose_name__: ClassVar[str]


class AssociativeBase(AbstractBase):
    __abstract__ = True
    __verbose_name__: ClassVar[str]


BaseModelType = TypeVar("BaseModelType", bound=Base)
AssociativeModelType = TypeVar("AssociativeModelType", bound=AssociativeBase)
