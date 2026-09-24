from fastapi.testclient import TestClient


def test_kesehatan_mengembalikan_status_dan_mode(klien: TestClient) -> None:
    respons = klien.get("/kesehatan")

    assert respons.status_code == 200
    isi = respons.json()
    assert isi["status"] == "ok"
    assert isi["mode"] == "sementara"
    assert isi["versiModel"] == "sementara-v0"
