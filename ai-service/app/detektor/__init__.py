from app.detektor.dasar import Detektor
from app.detektor.sementara import DetektorSementara

DETEKTOR_TERSEDIA: dict[str, type[Detektor]] = {
    "sementara": DetektorSementara,
}


def buat_detektor(mode: str) -> Detektor:
    if mode not in DETEKTOR_TERSEDIA:
        tersedia = ", ".join(sorted(DETEKTOR_TERSEDIA))
        raise ValueError(f"MODE_DETEKSI '{mode}' belum tersedia. Pilihan yang ada: {tersedia}")
    return DETEKTOR_TERSEDIA[mode]()


__all__ = ["DETEKTOR_TERSEDIA", "Detektor", "DetektorSementara", "buat_detektor"]
