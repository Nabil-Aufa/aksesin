import json
from dataclasses import dataclass
from pathlib import Path

import numpy as np

from app.skema import Deteksi, KotakPembatas, LabelKelas

KELAS: tuple[LabelKelas, ...] = ("ramp", "tangga", "pintu", "toilet_aksesibel")
LEBAR_KOTAK_MINIMUM = 1e-3


@dataclass
class FiturFoto:
    fitur_global: np.ndarray
    fitur_bagian: np.ndarray
    kotak_bagian: np.ndarray
    skor_toilet_bagian: np.ndarray


def normalisasi(vektor: np.ndarray) -> np.ndarray:
    return vektor / np.linalg.norm(vektor, axis=-1, keepdims=True)


def sigmoid(nilai: float) -> float:
    return float(1 / (1 + np.exp(-nilai)))


@dataclass
class Linear:
    bobot: np.ndarray
    bias: float

    @classmethod
    def dari_dict(cls, data: dict) -> "Linear":
        return cls(np.asarray(data["bobot"], dtype=np.float32), float(data["bias"]))

    def ke_dict(self) -> dict:
        return {"bobot": [round(float(b), 6) for b in self.bobot], "bias": round(self.bias, 6)}

    def logit(self, masukan: np.ndarray) -> np.ndarray:
        return masukan @ self.bobot + self.bias


@dataclass
class KepalaKelas:
    label: LabelKelas
    kepala_global: Linear
    kepala_bagian: Linear | None
    penggabung: Linear

    def skor_masukan(self, fitur: FiturFoto) -> tuple[np.ndarray, int]:
        logit_global = self.kepala_global.logit(normalisasi(fitur.fitur_global))
        if self.kepala_bagian is None:
            return np.array([logit_global]), int(np.argmax(fitur.skor_toilet_bagian))
        logit_bagian = self.kepala_bagian.logit(normalisasi(fitur.fitur_bagian))
        terbaik = int(np.argmax(logit_bagian))
        return np.array([logit_global, logit_bagian[terbaik]]), terbaik

    def nilai(self, fitur: FiturFoto) -> Deteksi:
        masukan, bagian_terbaik = self.skor_masukan(fitur)
        x1, y1, x2, y2 = (round(float(v), 4) for v in fitur.kotak_bagian[bagian_terbaik])
        lebar = max(x2 - x1, LEBAR_KOTAK_MINIMUM)
        tinggi = max(y2 - y1, LEBAR_KOTAK_MINIMUM)
        return Deteksi(
            label=self.label,
            keyakinan=round(sigmoid(float(self.penggabung.logit(masukan))), 4),
            bbox=KotakPembatas(
                x=round(min(x1, 1 - lebar), 4),
                y=round(min(y1, 1 - tinggi), 4),
                w=round(lebar, 4),
                h=round(tinggi, 4),
            ),
        )


@dataclass
class Kepala:
    versi_model: str
    per_kelas: dict[str, KepalaKelas]

    @classmethod
    def muat(cls, berkas: Path) -> "Kepala":
        data = json.loads(berkas.read_text(encoding="utf-8"))
        per_kelas = {}
        for label in KELAS:
            isi = data["kelas"][label]
            per_kelas[label] = KepalaKelas(
                label=label,
                kepala_global=Linear.dari_dict(isi["global"]),
                kepala_bagian=Linear.dari_dict(isi["bagian"]) if isi["bagian"] else None,
                penggabung=Linear.dari_dict(isi["penggabung"]),
            )
        return cls(data["versi_model"], per_kelas)

    def simpan(self, berkas: Path) -> None:
        data = {
            "versi_model": self.versi_model,
            "kelas": {
                label: {
                    "global": k.kepala_global.ke_dict(),
                    "bagian": k.kepala_bagian.ke_dict() if k.kepala_bagian else None,
                    "penggabung": k.penggabung.ke_dict(),
                }
                for label, k in self.per_kelas.items()
            },
        }
        berkas.write_text(json.dumps(data), encoding="utf-8")

    def nilai(self, fitur: FiturFoto) -> list[Deteksi]:
        return [self.per_kelas[label].nilai(fitur) for label in KELAS]
