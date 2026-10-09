import pytest
from fastapi.testclient import TestClient

from app.konfigurasi import ambil_pengaturan
from app.main import app, detektor_untuk

KUNCI_UJI = "kunci-uji"


def bersihkan_cache() -> None:
    ambil_pengaturan.cache_clear()
    detektor_untuk.cache_clear()


@pytest.fixture
def klien(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("API_KEY", KUNCI_UJI)
    monkeypatch.setenv("MODE_DETEKSI", "sementara")
    bersihkan_cache()
    with TestClient(app) as klien_uji:
        yield klien_uji
    bersihkan_cache()
