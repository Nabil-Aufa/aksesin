from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Pengaturan(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        protected_namespaces=(),
    )

    api_key: str = ""
    mode_deteksi: str = "sementara"
    ambang_keyakinan: float = 0.5


@lru_cache
def ambil_pengaturan() -> Pengaturan:
    return Pengaturan()
