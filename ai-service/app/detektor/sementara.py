from app.skema import Deteksi


class DetektorSementara:
    versi_model = "sementara-v0"

    async def deteksi(self, isi_gambar: bytes) -> list[Deteksi]:
        return []
