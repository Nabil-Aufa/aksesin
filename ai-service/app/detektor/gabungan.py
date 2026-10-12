import asyncio
import io
from pathlib import Path
from typing import Protocol

from PIL import Image, ImageOps

from app.detektor.kepala import FiturFoto, Kepala
from app.galat import GalatAplikasi
from app.skema import Deteksi

BERKAS_BOBOT = Path(__file__).with_name("bobot_kepala.json")
BATAS_WAKTU_DETIK = 15.0


class Pengekstrak(Protocol):
    def ekstrak(self, gambar: Image.Image) -> FiturFoto: ...


def buat_pengekstrak() -> Pengekstrak:
    # PyTorch hanya dipasang di image produksi, bukan di CI, sehingga impornya ditunda.
    from app.detektor.fitur import PengekstrakFitur

    return PengekstrakFitur()


class DetektorGabungan:
    def __init__(self, pengekstrak: Pengekstrak | None = None, kepala: Kepala | None = None):
        self.kepala = kepala or Kepala.muat(BERKAS_BOBOT)
        self.pengekstrak = pengekstrak or buat_pengekstrak()
        self.versi_model = self.kepala.versi_model

    async def deteksi(self, isi_gambar: bytes) -> list[Deteksi]:
        try:
            return await asyncio.wait_for(
                asyncio.to_thread(self._deteksi, isi_gambar), BATAS_WAKTU_DETIK
            )
        except TimeoutError as galat:
            raise GalatAplikasi(
                504, "DETEKSI_MELEWATI_BATAS_WAKTU", "Deteksi tidak selesai dalam 15 detik"
            ) from galat

    def _deteksi(self, isi_gambar: bytes) -> list[Deteksi]:
        gambar = ImageOps.exif_transpose(Image.open(io.BytesIO(isi_gambar))).convert("RGB")
        return self.kepala.nilai(self.pengekstrak.ekstrak(gambar))
