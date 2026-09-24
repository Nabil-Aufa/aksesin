import pytest
from fastapi.testclient import TestClient

from app.detektor import DETEKTOR_TERSEDIA, DetektorSementara, buat_detektor
from app.main import app
from tests.conftest import bersihkan_cache


def test_mode_sementara_menghasilkan_detektor_sementara() -> None:
    assert isinstance(buat_detektor("sementara"), DetektorSementara)


def test_mode_yang_belum_tersedia_ditolak() -> None:
    with pytest.raises(ValueError, match="belum tersedia"):
        buat_detektor("yolo")


def test_daftar_mode_berisi_sementara() -> None:
    assert "sementara" in DETEKTOR_TERSEDIA


def test_mode_tidak_dikenal_menggagalkan_layanan_saat_mulai(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("API_KEY", "kunci-uji")
    monkeypatch.setenv("MODE_DETEKSI", "belum_ada")
    bersihkan_cache()

    with pytest.raises(ValueError, match="belum tersedia"), TestClient(app):
        pass

    bersihkan_cache()
