from fastapi import HTTPException


class GalatAplikasi(HTTPException):
    def __init__(self, status_code: int, kode: str, pesan: str) -> None:
        super().__init__(status_code=status_code, detail={"kode": kode, "pesan": pesan})
