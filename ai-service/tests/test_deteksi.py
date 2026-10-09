import pytest
from fastapi.testclient import TestClient

from tests.conftest import KUNCI_UJI

URL_FOTO = "https://contoh.test/foto.jpg"


async def unduh_foto_palsu(url: str) -> tuple[bytes, int, int]:
    return b"gambar", 1920, 1080


def test_tanpa_kunci_api_ditolak(klien: TestClient) -> None:
    respons = klien.post("/deteksi", json={"urlFoto": URL_FOTO})

    assert respons.status_code == 401
    assert respons.json()["galat"]["kode"] == "TIDAK_TERAUTENTIKASI"


def test_kunci_api_salah_ditolak(klien: TestClient) -> None:
    respons = klien.post(
        "/deteksi",
        json={"urlFoto": URL_FOTO},
        headers={"X-Api-Key": "kunci-salah"},
    )

    assert respons.status_code == 401


def test_deteksi_mengembalikan_daftar_kosong(
    klien: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr("app.main.unduh_foto", unduh_foto_palsu)

    respons = klien.post(
        "/deteksi",
        json={"urlFoto": URL_FOTO},
        headers={"X-Api-Key": KUNCI_UJI},
    )

    assert respons.status_code == 200
    isi = respons.json()
    assert isi["deteksi"] == []
    assert isi["lebarFoto"] == 1920
    assert isi["tinggiFoto"] == 1080
    assert isi["versiModel"] == "sementara-v0"


def test_url_foto_kosong_ditolak(klien: TestClient) -> None:
    respons = klien.post(
        "/deteksi",
        json={"urlFoto": ""},
        headers={"X-Api-Key": KUNCI_UJI},
    )

    assert respons.status_code == 422
