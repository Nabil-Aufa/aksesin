import asyncio
import io
import time
from pathlib import Path

import numpy as np
import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.detektor.gabungan import DetektorGabungan
from app.detektor.kepala import KELAS, FiturFoto, Kepala, KepalaKelas, Linear
from app.galat import GalatAplikasi
from app.main import ambil_detektor, app
from tests.conftest import KUNCI_UJI

DIMENSI_GLOBAL = 4
DIMENSI_BAGIAN = 3


def isi_gambar() -> bytes:
    keluaran = io.BytesIO()
    Image.new("RGB", (40, 30)).save(keluaran, format="JPEG")
    return keluaran.getvalue()


def fitur_contoh() -> FiturFoto:
    return FiturFoto(
        fitur_global=np.array([1.0, 0.0, 0.0, 0.0]),
        fitur_bagian=np.array([[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]]),
        kotak_bagian=np.array([[0.1, 0.2, 0.4, 0.6], [0.5, 0.5, 0.9, 0.9], [0.95, 0.3, 0.95, 0.8]]),
        skor_toilet_bagian=np.array([0.0, 0.0, 5.0]),
    )


def kepala_contoh(bias_ramp: float = 5.0) -> Kepala:
    per_kelas = {}
    for label in KELAS:
        kepala_bagian = None
        if label != "toilet_aksesibel":
            kepala_bagian = Linear(np.array([0.0, 4.0, 0.0]), 0.0)
        per_kelas[label] = KepalaKelas(
            label=label,
            kepala_global=Linear(np.zeros(DIMENSI_GLOBAL), 0.0),
            kepala_bagian=kepala_bagian,
            penggabung=Linear(
                np.zeros(1 if kepala_bagian is None else 2),
                bias_ramp if label == "ramp" else -5.0,
            ),
        )
    return Kepala("uji-v1", per_kelas)


class PengekstrakPalsu:
    def __init__(self, jeda: float = 0.0) -> None:
        self.jeda = jeda

    def ekstrak(self, gambar: Image.Image) -> FiturFoto:
        time.sleep(self.jeda)
        return fitur_contoh()


def test_kepala_menghasilkan_satu_deteksi_per_kelas() -> None:
    hasil = kepala_contoh().nilai(fitur_contoh())

    assert [d.label for d in hasil] == list(KELAS)
    assert hasil[0].keyakinan > 0.99
    assert all(d.keyakinan < 0.01 for d in hasil[1:])


def test_kotak_diambil_dari_bagian_dengan_skor_tertinggi() -> None:
    ramp = kepala_contoh().nilai(fitur_contoh())[0]

    assert ramp.bbox.x == pytest.approx(0.5)
    assert ramp.bbox.w == pytest.approx(0.4)


def test_kotak_toilet_diambil_dari_skor_kueri_toilet() -> None:
    toilet = kepala_contoh().nilai(fitur_contoh())[3]

    assert toilet.bbox.w > 0
    assert toilet.bbox.x + toilet.bbox.w <= 1


def test_bobot_dapat_disimpan_dan_dimuat_ulang(tmp_path: Path) -> None:
    berkas = tmp_path / "bobot.json"
    kepala_contoh().simpan(berkas)

    dimuat = Kepala.muat(berkas)

    assert dimuat.versi_model == "uji-v1"
    assert dimuat.nilai(fitur_contoh()) == kepala_contoh().nilai(fitur_contoh())


def test_detektor_gabungan_memakai_versi_dari_bobot() -> None:
    detektor = DetektorGabungan(PengekstrakPalsu(), kepala_contoh())

    hasil = asyncio.run(detektor.deteksi(isi_gambar()))

    assert detektor.versi_model == "uji-v1"
    assert len(hasil) == len(KELAS)


def test_deteksi_yang_terlalu_lama_mengembalikan_504(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr("app.detektor.gabungan.BATAS_WAKTU_DETIK", 0.05)
    detektor = DetektorGabungan(PengekstrakPalsu(jeda=0.5), kepala_contoh())

    with pytest.raises(GalatAplikasi) as galat:
        asyncio.run(detektor.deteksi(isi_gambar()))

    assert galat.value.status_code == 504
    assert galat.value.detail["kode"] == "DETEKSI_MELEWATI_BATAS_WAKTU"


def test_endpoint_hanya_mengembalikan_deteksi_di_atas_ambang(
    klien: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    async def unduh_foto_palsu(url: str) -> tuple[bytes, int, int]:
        return isi_gambar(), 40, 30

    monkeypatch.setattr("app.main.unduh_foto", unduh_foto_palsu)
    app.dependency_overrides[ambil_detektor] = lambda: DetektorGabungan(
        PengekstrakPalsu(), kepala_contoh()
    )
    try:
        respons = klien.post(
            "/deteksi",
            json={"urlFoto": "https://contoh.test/foto.jpg"},
            headers={"X-Api-Key": KUNCI_UJI},
        )
    finally:
        app.dependency_overrides.clear()

    assert respons.status_code == 200
    isi = respons.json()
    assert isi["versiModel"] == "uji-v1"
    assert [d["label"] for d in isi["deteksi"]] == ["ramp"]
    assert set(isi["deteksi"][0]["bbox"]) == {"x", "y", "w", "h"}
