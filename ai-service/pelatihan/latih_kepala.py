import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import confusion_matrix, roc_auc_score

from app.detektor.kepala import KELAS, FiturFoto, Kepala, KepalaKelas, Linear, normalisasi

AKAR = Path(__file__).resolve().parents[1]
JUMLAH_LIPATAN = 5
IOU_POSITIF = 0.4
IOU_NEGATIF = 0.1
NEGATIF_PER_FOTO = 40
C_GLOBAL = 2.0
C_BAGIAN = 1.0
AMBANG_LAPORAN = (0.5, 0.6, 0.7)


def iou(kotak: np.ndarray, acuan: list[float]) -> np.ndarray:
    lebar = np.clip(np.minimum(kotak[:, 2], acuan[2]) - np.maximum(kotak[:, 0], acuan[0]), 0, None)
    tinggi = np.clip(np.minimum(kotak[:, 3], acuan[3]) - np.maximum(kotak[:, 1], acuan[1]), 0, None)
    irisan = lebar * tinggi
    luas = (kotak[:, 2] - kotak[:, 0]) * (kotak[:, 3] - kotak[:, 1])
    luas_acuan = (acuan[2] - acuan[0]) * (acuan[3] - acuan[1])
    return irisan / (luas + luas_acuan - irisan + 1e-9)


def muat_fitur(foto: list[dict], folder_foto: Path, folder_cache: Path) -> list[FiturFoto]:
    folder_cache.mkdir(parents=True, exist_ok=True)
    pengekstrak = None
    hasil = []
    for i, f in enumerate(foto):
        cache = folder_cache / f"{Path(f['berkas']).stem}.npz"
        if not cache.exists():
            if pengekstrak is None:
                from app.detektor.fitur import PengekstrakFitur

                pengekstrak = PengekstrakFitur()
            gambar = Image.open(folder_foto / f["berkas"]).convert("RGB")
            fitur = pengekstrak.ekstrak(gambar)
            np.savez(
                cache,
                fitur_global=fitur.fitur_global,
                fitur_bagian=fitur.fitur_bagian.astype(np.float16),
                kotak_bagian=fitur.kotak_bagian,
                skor_toilet_bagian=fitur.skor_toilet_bagian,
            )
        data = np.load(cache)
        hasil.append(
            FiturFoto(
                fitur_global=data["fitur_global"],
                fitur_bagian=data["fitur_bagian"].astype(np.float32),
                kotak_bagian=data["kotak_bagian"],
                skor_toilet_bagian=data["skor_toilet_bagian"],
            )
        )
        if (i + 1) % 100 == 0:
            print(f"fitur {i + 1}/{len(foto)}", flush=True)
    return hasil


def regresi(masukan: np.ndarray, target: np.ndarray, c: float) -> Linear:
    model = LogisticRegression(C=c, class_weight="balanced", max_iter=5000)
    model.fit(masukan, target)
    return Linear(model.coef_[0].astype(np.float32), float(model.intercept_[0]))


def contoh_bagian(
    label: str, indeks: np.ndarray, foto: list[dict], fitur: list[FiturFoto], acak
) -> tuple[np.ndarray, np.ndarray]:
    masukan, target = [], []
    for i in indeks:
        emb = normalisasi(fitur[i].fitur_bagian)
        kotak = fitur[i].kotak_bagian
        acuan = [k[1:] for k in foto[i]["kotak"] if k[0] == label]
        if acuan:
            nilai = np.max(np.stack([iou(kotak, a) for a in acuan]), axis=0)
            positif = set(np.where(nilai >= IOU_POSITIF)[0]) | {
                int(np.argmax(iou(kotak, a))) for a in acuan
            }
            calon_negatif = np.where(nilai < IOU_NEGATIF)[0]
        else:
            positif, calon_negatif = set(), np.arange(len(emb))
        negatif = acak.choice(
            calon_negatif, size=min(NEGATIF_PER_FOTO, len(calon_negatif)), replace=False
        )
        masukan += [emb[sorted(positif)], emb[negatif]]
        target += [np.ones(len(positif)), np.zeros(len(negatif))]
    return np.concatenate(masukan), np.concatenate(target)


def latih_kelas(
    label: str, indeks: np.ndarray, foto: list[dict], fitur: list[FiturFoto], acak
) -> tuple[Linear, Linear | None]:
    target = np.array([foto[i]["label"][label] for i in indeks])
    global_ = regresi(
        np.stack([normalisasi(fitur[i].fitur_global) for i in indeks]), target, C_GLOBAL
    )
    bagian = None
    if any(k[0] == label for i in indeks for k in foto[i]["kotak"]):
        bagian = regresi(*contoh_bagian(label, indeks, foto, fitur, acak), C_BAGIAN)
    return global_, bagian


def skor_masukan(
    label: str, global_: Linear, bagian: Linear | None, fitur: FiturFoto
) -> np.ndarray:
    kepala = KepalaKelas(label, global_, bagian, Linear(np.zeros(1), 0.0))
    return kepala.skor_masukan(fitur)[0]


def ringkas(target: np.ndarray, peluang: np.ndarray) -> dict:
    ringkasan = {
        "jumlah_foto": len(target),
        "berisi_objek": int(target.sum()),
        "auc": round(float(roc_auc_score(target, peluang)), 4),
    }
    for ambang in AMBANG_LAPORAN:
        prediksi = peluang >= ambang
        tn, fp, fn, tp = confusion_matrix(target, prediksi, labels=[0, 1]).ravel()
        ringkasan[f"ambang_{ambang}"] = {
            "presisi": round(tp / (tp + fp), 4) if tp + fp else None,
            "recall": round(tp / (tp + fn), 4),
            "matriks": {"tp": int(tp), "fp": int(fp), "fn": int(fn), "tn": int(tn)},
        }
    return ringkasan


def main() -> None:
    parser = argparse.ArgumentParser(description="Melatih kepala klasifikasi detektor gabungan")
    parser.add_argument("dataset", type=Path, help="Folder hasil dataset/unduh.py")
    parser.add_argument("--versi", default="aksesin-gabungan-v1")
    parser.add_argument("--anotasi", type=Path, default=AKAR / "dataset" / "anotasi.jsonl")
    parser.add_argument(
        "--keluaran", type=Path, default=AKAR / "app" / "detektor" / "bobot_kepala.json"
    )
    parser.add_argument("--metrik", type=Path, default=AKAR / "pelatihan" / "metrik.json")
    argumen = parser.parse_args()

    acak = np.random.default_rng(15)
    foto = [json.loads(b) for b in argumen.anotasi.open(encoding="utf-8")]
    fitur = muat_fitur(foto, argumen.dataset / "foto", argumen.dataset / "fitur")
    lipatan = np.array([f["lipatan"] for f in foto])

    per_kelas, metrik = {}, {"versi_model": argumen.versi, "kelas": {}}
    for label in KELAS:
        indeks = np.array([i for i, f in enumerate(foto) if f["label"][label] is not None])
        target = np.array([foto[i]["label"][label] for i in indeks])

        masukan_oof = np.zeros((len(indeks), 0))
        for lip in range(JUMLAH_LIPATAN):
            latih = indeks[lipatan[indeks] != lip]
            global_, bagian = latih_kelas(label, latih, foto, fitur, acak)
            uji = np.where(lipatan[indeks] == lip)[0]
            skor = np.stack([skor_masukan(label, global_, bagian, fitur[indeks[j]]) for j in uji])
            if masukan_oof.shape[1] == 0:
                masukan_oof = np.zeros((len(indeks), skor.shape[1]))
            masukan_oof[uji] = skor

        peluang_oof = np.zeros(len(indeks))
        for lip in range(JUMLAH_LIPATAN):
            uji = lipatan[indeks] == lip
            penggabung = regresi(masukan_oof[~uji], target[~uji], 1.0)
            peluang_oof[uji] = 1 / (1 + np.exp(-penggabung.logit(masukan_oof[uji])))
        metrik["kelas"][label] = ringkas(target, peluang_oof)

        global_, bagian = latih_kelas(label, indeks, foto, fitur, acak)
        penggabung = regresi(masukan_oof, target, 1.0)
        per_kelas[label] = KepalaKelas(label, global_, bagian, penggabung)
        print(f"{label}: {json.dumps(metrik['kelas'][label])}", flush=True)

    Kepala(argumen.versi, per_kelas).simpan(argumen.keluaran)
    argumen.metrik.write_text(json.dumps(metrik, indent=2), encoding="utf-8")
    print(f"bobot tersimpan di {argumen.keluaran}")


if __name__ == "__main__":
    main()
