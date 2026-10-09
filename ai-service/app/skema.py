from typing import Literal

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

LabelKelas = Literal["ramp", "tangga", "pintu", "toilet_aksesibel"]


class SkemaDasar(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class PermintaanDeteksi(SkemaDasar):
    url_foto: str = Field(min_length=1)


class KotakPembatas(SkemaDasar):
    x: float = Field(ge=0, le=1)
    y: float = Field(ge=0, le=1)
    w: float = Field(gt=0, le=1)
    h: float = Field(gt=0, le=1)


class Deteksi(SkemaDasar):
    label: LabelKelas
    keyakinan: float = Field(ge=0, le=1)
    bbox: KotakPembatas


class HasilDeteksi(SkemaDasar):
    versi_model: str
    lebar_foto: int
    tinggi_foto: int
    deteksi: list[Deteksi]


class Kesehatan(SkemaDasar):
    status: str
    mode: str
    versi_model: str
