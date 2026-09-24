from typing import Protocol

from app.skema import Deteksi


class Detektor(Protocol):
    versi_model: str

    async def deteksi(self, isi_gambar: bytes) -> list[Deteksi]: ...
