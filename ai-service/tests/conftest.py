import pytest
from fastapi.testclient import TestClient

from app.konfigurasi import ambil_pengaturan
from app.main import app

KUNCI_UJI = "kunci-uji"


@pytest.fixture
def klien(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("API_KEY", KUNCI_UJI)
    monkeypatch.setenv("MODE_DETEKSI", "sementara")
    ambil_pengaturan.cache_clear()
    with TestClient(app) as klien_uji:
        yield klien_uji
    ambil_pengaturan.cache_clear()
