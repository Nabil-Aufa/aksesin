import io

import httpx
from PIL import Image

from app.galat import GalatAplikasi

BATAS_UKURAN_BYTE = 5 * 1024 * 1024
BATAS_WAKTU_DETIK = 10.0


async def unduh_foto(url: str) -> tuple[bytes, int, int]:
    try:
        async with httpx.AsyncClient(timeout=BATAS_WAKTU_DETIK, follow_redirects=True) as klien:
            respons = await klien.get(url)
            respons.raise_for_status()
    except httpx.HTTPError as galat:
        raise GalatAplikasi(
            400, "FOTO_TIDAK_DAPAT_DIUNDUH", "Foto tidak dapat diunduh dari URL tersebut"
        ) from galat

    isi = respons.content
    if len(isi) > BATAS_UKURAN_BYTE:
        raise GalatAplikasi(413, "FOTO_TERLALU_BESAR", "Ukuran foto melebihi 5 MB")

    try:
        with Image.open(io.BytesIO(isi)) as gambar:
            lebar, tinggi = gambar.size
    except OSError as galat:
        raise GalatAplikasi(
            400, "FOTO_TIDAK_DAPAT_DIUNDUH", "Berkas yang diunduh bukan gambar yang dikenali"
        ) from galat

    return isi, lebar, tinggi
