from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from functools import lru_cache
from typing import Annotated

from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.responses import JSONResponse

from app.detektor import Detektor, buat_detektor
from app.foto import unduh_foto
from app.galat import GalatAplikasi
from app.konfigurasi import Pengaturan, ambil_pengaturan
from app.skema import HasilDeteksi, Kesehatan, PermintaanDeteksi


@lru_cache
def detektor_untuk(mode: str) -> Detektor:
    return buat_detektor(mode)


@asynccontextmanager
async def daur_hidup(app: FastAPI) -> AsyncIterator[None]:
    detektor_untuk(ambil_pengaturan().mode_deteksi)
    yield


app = FastAPI(title="Layanan Deteksi Aksesin", lifespan=daur_hidup)

PengaturanTerpakai = Annotated[Pengaturan, Depends(ambil_pengaturan)]
KunciApi = Annotated[str | None, Header(alias="X-Api-Key")]


def ambil_detektor(pengaturan: PengaturanTerpakai) -> Detektor:
    return detektor_untuk(pengaturan.mode_deteksi)


DetektorTerpakai = Annotated[Detektor, Depends(ambil_detektor)]


@app.exception_handler(HTTPException)
async def tangani_galat(request: Request, galat: HTTPException) -> JSONResponse:
    isi = galat.detail
    if not isinstance(isi, dict):
        isi = {"kode": "GALAT", "pesan": str(isi)}
    return JSONResponse(status_code=galat.status_code, content={"galat": isi})


def periksa_kunci(pengaturan: PengaturanTerpakai, x_api_key: KunciApi = None) -> None:
    if not pengaturan.api_key or x_api_key != pengaturan.api_key:
        raise GalatAplikasi(401, "TIDAK_TERAUTENTIKASI", "Kunci API tidak valid")


@app.get("/kesehatan", response_model=Kesehatan)
async def kesehatan(pengaturan: PengaturanTerpakai, detektor: DetektorTerpakai) -> Kesehatan:
    return Kesehatan(
        status="ok",
        mode=pengaturan.mode_deteksi,
        versi_model=detektor.versi_model,
    )


@app.post("/deteksi", response_model=HasilDeteksi, dependencies=[Depends(periksa_kunci)])
async def deteksi(
    permintaan: PermintaanDeteksi,
    pengaturan: PengaturanTerpakai,
    detektor: DetektorTerpakai,
) -> HasilDeteksi:
    isi_gambar, lebar, tinggi = await unduh_foto(permintaan.url_foto)
    hasil = await detektor.deteksi(isi_gambar)
    return HasilDeteksi(
        versi_model=detektor.versi_model,
        lebar_foto=lebar,
        tinggi_foto=tinggi,
        deteksi=[d for d in hasil if d.keyakinan >= pengaturan.ambang_keyakinan],
    )
