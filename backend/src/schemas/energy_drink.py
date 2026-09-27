from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

# Лимит длины названия (#115). С запасом: у спарсенных напитков названия длинные (#50)
DRINK_NAME_MAX = 200


class EnergyDrinkSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int | None = Field(default=None)
    name: str = Field(...)
    price: float | None = Field(default=None)
    image_url: str | None = Field(default=None)
    no_sugar: bool = Field(default=False)
    created_at: datetime | None = Field(default=None)
    updated_at: datetime | None = Field(default=None)


class EnergyDrinkWriteSchema(BaseModel):
    """Тело POST и PUT напитка: только редактируемые поля.

    image_url меняется только через upload-image, id и даты ставит сервер,
    лишние поля в теле игнорируются (#104, #114).
    """

    name: str = Field(..., min_length=1, max_length=DRINK_NAME_MAX)
    price: float | None = Field(default=None)
    no_sugar: bool = Field(default=False)
