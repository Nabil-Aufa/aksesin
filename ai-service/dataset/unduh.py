import argparse
import io
import json
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import requests
from PIL import Image, ImageOps
from remotezip import RemoteZip

ZIP_ZENODO = "https://zenodo.org/api/records/6382090/files/wm_barriers_data.zip/content"
URL_OPEN_IMAGES = "https://open-images-dataset.s3.amazonaws.com/{}.jpg"
API_WIKIMEDIA = "https://commons.wikimedia.org/w/api.php"
SISI_MAKS = 1280
PERCOBAAN = 4

sesi = requests.Session()
sesi.headers["User-Agent"] = "AksesinDataset/1.0 (https://github.com/Nabil-Aufa/aksesin)"


def simpan(isi: bytes, tujuan: Path) -> None:
    gambar = ImageOps.exif_transpose(Image.open(io.BytesIO(isi))).convert("RGB")
    gambar.thumbnail((SISI_MAKS, SISI_MAKS))
    gambar.save(tujuan, quality=90)


def ulangi(fungsi, *argumen):
    for percobaan in range(PERCOBAAN):
        try:
            return fungsi(*argumen)
        except (requests.RequestException, OSError):
            time.sleep(2**percobaan)
    raise RuntimeError(f"Gagal mengunduh {argumen[0]}")


def unduh_open_images(sumber_id: str) -> bytes:
    respons = sesi.get(URL_OPEN_IMAGES.format(sumber_id), timeout=60)
    respons.raise_for_status()
    return respons.content


def unduh_wikimedia(judul: str) -> bytes:
    info = sesi.get(
        API_WIKIMEDIA,
        params={
            "action": "query",
            "titles": judul,
            "prop": "imageinfo",
            "iiprop": "url",
            "iiurlwidth": 1024,
            "format": "json",
        },
        timeout=60,
    ).json()
    halaman = next(iter(info["query"]["pages"].values()))
    respons = sesi.get(halaman["imageinfo"][0]["thumburl"], timeout=60)
    respons.raise_for_status()
    return respons.content


def unduh_zenodo(daftar: list[dict], folder: Path) -> None:
    with RemoteZip(ZIP_ZENODO) as arsip:
        for foto in daftar:
            simpan(ulangi(arsip.read, foto["sumber_id"]), folder / foto["berkas"])


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Mengunduh foto dataset Aksesin dari sumber aslinya"
    )
    parser.add_argument("tujuan", type=Path, help="Folder tujuan di luar repositori")
    parser.add_argument("--anotasi", type=Path, default=Path(__file__).with_name("anotasi.jsonl"))
    parser.add_argument("--paralel", type=int, default=8)
    argumen = parser.parse_args()

    folder = argumen.tujuan / "foto"
    folder.mkdir(parents=True, exist_ok=True)
    semua = [json.loads(baris) for baris in argumen.anotasi.open(encoding="utf-8")]
    belum = [foto for foto in semua if not (folder / foto["berkas"]).exists()]

    zenodo = [foto for foto in belum if foto["sumber"] == "zenodo"]
    lainnya = [foto for foto in belum if foto["sumber"] != "zenodo"]
    pengunduh = {"openimages": unduh_open_images, "wikimedia": unduh_wikimedia}

    def unduh_satu(foto: dict) -> None:
        isi = ulangi(pengunduh[foto["sumber"]], foto["sumber_id"])
        simpan(isi, folder / foto["berkas"])

    with ThreadPoolExecutor(argumen.paralel) as eksekutor:
        bagian_zenodo = [zenodo[i :: argumen.paralel] for i in range(argumen.paralel)]
        tugas = [eksekutor.submit(unduh_zenodo, b, folder) for b in bagian_zenodo if b]
        tugas += [eksekutor.submit(unduh_satu, foto) for foto in lainnya]
        for t in tugas:
            t.result()

    print(f"{len(semua)} foto tersedia di {folder}")


if __name__ == "__main__":
    main()
