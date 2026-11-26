import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppBar } from "@/components/ui/AppBar";
import {
  ChipKepercayaan,
  ChipKesesuaian,
  ChipStatusFasilitas,
  penandaKepercayaan,
  penandaKesesuaian,
  penandaStatusFasilitas,
} from "@/components/ui/Chip";
import { GambarTempat } from "@/components/ui/GambarTempat";
import { KolomIsian } from "@/components/ui/KolomIsian";
import { Tombol } from "@/components/ui/Tombol";
import type {
  KategoriKesesuaian,
  StatusFasilitas,
  TingkatKepercayaan,
} from "@/types/status";

export const metadata: Metadata = { title: "Panduan Visual" };

const tokenWarna = [
  ["primer", "bg-primer"],
  ["primer-muda", "bg-primer-muda"],
  ["teks", "bg-teks"],
  ["teks-sekunder", "bg-teks-sekunder"],
  ["permukaan", "bg-permukaan"],
  ["garis-kontrol", "bg-garis-kontrol"],
  ["garis-dekoratif", "bg-garis-dekoratif"],
  ["latar", "bg-latar"],
  ["sukses", "bg-sukses"],
  ["sukses-latar", "bg-sukses-latar"],
  ["peringatan", "bg-peringatan"],
  ["peringatan-latar", "bg-peringatan-latar"],
  ["bahaya", "bg-bahaya"],
  ["bahaya-latar", "bg-bahaya-latar"],
];

const tokenTeks = [
  ["judul-1", "text-judul-1"],
  ["judul-2", "text-judul-2"],
  ["judul-3", "text-judul-3"],
  ["isi", "text-isi"],
  ["kecil", "text-kecil"],
  ["mini", "text-mini"],
];

const fotoContoh =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="gray"/></svg>',
  );

function Bagian({ judul, children }: { judul: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-judul-2">{judul}</h2>
      {children}
    </section>
  );
}

export default function PanduanVisualPage() {
  return (
    <>
      <AppBar judul="Aksesin" tautanKembali="/" />
      <main
        id="konten-utama"
        className="mx-auto flex w-full max-w-konten flex-col gap-12 px-4 py-8 sm:px-6"
      >
        <h1 className="text-judul-1">Panduan Visual</h1>

        <Bagian judul="Warna">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {tokenWarna.map(([nama, kelas]) => (
              <li key={nama} className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className={`size-10 shrink-0 rounded-dasar border border-garis-dekoratif ${kelas}`}
                />
                <code className="text-kecil">{nama}</code>
              </li>
            ))}
          </ul>
        </Bagian>

        <Bagian judul="Tipografi">
          <ul className="flex flex-col gap-2">
            {tokenTeks.map(([nama, kelas]) => (
              <li key={nama} className={kelas}>
                {nama}: Perpustakaan Pusat UGM
              </li>
            ))}
          </ul>
        </Bagian>

        <Bagian judul="Tombol">
          <div className="flex flex-wrap gap-3">
            <Tombol>Primer</Tombol>
            <Tombol varian="sekunder">Sekunder</Tombol>
            <Tombol disabled>Nonaktif</Tombol>
            <Tombol memuat>Menyimpan</Tombol>
          </div>
        </Bagian>

        <Bagian judul="Kolom isian">
          <KolomIsian label="Kosong" placeholder="Contoh: Perpustakaan" />
          <KolomIsian label="Terisi" defaultValue="Gedung DTETI" />
          <KolomIsian
            label="Lebar pintu (cm)"
            keterangan="Ukur bagian tersempit saat pintu terbuka penuh"
            galat="Lebar pintu wajib diisi"
            inputMode="numeric"
          />
          <KolomIsian label="Nonaktif" defaultValue="Tidak bisa diubah" disabled />
        </Bagian>

        <Bagian judul="Chip">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(penandaKesesuaian) as KategoriKesesuaian[]).map((k) => (
              <ChipKesesuaian key={k} kategori={k} />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(penandaStatusFasilitas) as StatusFasilitas[]).map((s) => (
              <ChipStatusFasilitas key={s} status={s} />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(penandaKepercayaan) as TingkatKepercayaan[]).map((t) => (
              <ChipKepercayaan key={t} tingkat={t} />
            ))}
          </div>
        </Bagian>

        <Bagian judul="Gambar tempat">
          <GambarTempat
            src={fotoContoh}
            alt="Contoh foto pintu masuk"
            deteksi={[
              { label: "ramp", keyakinan: 0.92, bbox: { x: 0.21, y: 0.44, w: 0.35, h: 0.3 } },
            ]}
          />
          <GambarTempat src="/tidak-ada.jpg" alt="Contoh foto yang gagal dimuat" />
        </Bagian>
      </main>
    </>
  );
}
