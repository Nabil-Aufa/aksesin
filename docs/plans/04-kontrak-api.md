# Kontrak API

Dokumen ini menetapkan bentuk permintaan dan respons setiap endpoint. Frontend dan backend boleh dikerjakan paralel selama keduanya mengikuti kontrak ini. Perubahan kontrak wajib diperbarui di dokumen ini dalam pull request yang sama.

Issue terkait: #13, #16, #18, #21, #23, #27 (Gilbert), #26 (Nabil), serta halaman yang memanggil endpoint ini.

## Ketentuan umum

### Format

- Semua permintaan dan respons berformat JSON dengan nama field `camelCase`, termasuk layanan AI.
- Waktu memakai format ISO 8601 dengan zona waktu, contoh `2026-09-21T08:30:00+07:00`.
- ID berupa UUID, kecuali `sumberEksternalId`.
- Validasi masukan di aplikasi web memakai skema `zod`. Skema yang sama diekspor untuk dipakai formulir di frontend.

### Autentikasi

- Sesi pengguna dikelola Supabase Auth dengan cookie lewat `@supabase/ssr`. Route handler membaca pengguna dari cookie, bukan dari body permintaan.
- Kolom "Login" di tabel endpoint berarti: `tidak` boleh tanpa sesi, `ya` wajib punya sesi, `moderator` wajib berperan moderator.

### Format galat

```json
{
  "galat": {
    "kode": "VALIDASI_GAGAL",
    "pesan": "Status fasilitas wajib diisi",
    "detail": { "status": "Wajib diisi" }
  }
}
```

| Kode | HTTP | Kapan |
|---|---|---|
| `VALIDASI_GAGAL` | 400 | Masukan tidak lolos validasi. `detail` berisi pesan per field |
| `TIDAK_TERAUTENTIKASI` | 401 | Endpoint butuh login tetapi sesi tidak ada |
| `TIDAK_DIIZINKAN` | 403 | Sesi ada tetapi tidak berhak |
| `TIDAK_DITEMUKAN` | 404 | Sumber daya tidak ada atau tidak terlihat oleh pengguna |
| `KONFLIK` | 409 | Aksi bertentangan dengan data yang ada, misalnya verifikasi ganda |
| `PROFIL_BELUM_ADA` | 409 | Skor kesesuaian diminta tetapi pengguna belum mengisi profil |
| `TERLALU_BANYAK_PERMINTAAN` | 429 | Melewati batas permintaan |
| `LAYANAN_LUAR_GAGAL` | 502 | Nominatim, Overpass, atau layanan AI gagal merespons |

`pesan` ditulis dalam bahasa Indonesia dan boleh langsung ditampilkan ke pengguna.

## Ringkasan endpoint aplikasi web

| Metode | Path | Login | FR | Issue |
|---|---|---|---|---|
| GET | `/api/tempat/cari` | tidak | 3, 4 | #16 |
| GET | `/api/tempat/terdekat` | tidak | 27 | #18 |
| POST | `/api/tempat/impor` | tidak | 5 | #16 |
| GET | `/api/tempat/{id}` | tidak | 6, 7 | #16 |
| GET | `/api/tempat/{id}/bukti` | tidak | 8 | #21 |
| GET | `/api/tempat/{id}/kesesuaian` | ya | 10, 11, 12 | #29 |
| GET | `/api/saya/profil-kebutuhan` | ya | 9 | #14 |
| PUT | `/api/saya/profil-kebutuhan` | ya | 9 | #14 |
| GET | `/api/saya/riwayat` | ya | 29 | #22 |
| POST | `/api/laporan` | ya | 13, 14, 15 | #20 |
| POST | `/api/laporan/{id}/deteksi-ulang` | ya | 16 | #27 |
| POST | `/api/laporan/{id}/verifikasi` | ya | 19 | #21 |
| DELETE | `/api/laporan/{id}/verifikasi` | ya | 19 | #21 |
| POST | `/api/laporan/{id}/tanda` | ya | 20 | #23 |
| GET | `/api/moderasi/laporan` | moderator | 24 | #23 |
| PATCH | `/api/moderasi/laporan/{id}` | moderator | 24 | #23 |
| PATCH | `/api/moderasi/tanda/{id}` | moderator | 24 | #23 |
| PATCH | `/api/moderasi/tempat/{id}` | moderator | 25 | #23 |

Pendaftaran, login, dan logout tidak melewati API internal. Halaman memanggil Supabase Auth langsung lewat `supabase-js`.

## Tipe bersama

```ts
type StatusFasilitas = 'tersedia' | 'terbatas' | 'tidak_tersedia' | 'tidak_diketahui'

type KodeFitur =
  | 'akses_masuk'
  | 'lebar_pintu'
  | 'ramp'
  | 'jalur_bebas_tangga'
  | 'toilet_aksesibel'
  | 'lift'
  | 'parkir_aksesibel'

type TingkatKepercayaan = 'tinggi' | 'sedang' | 'rendah'

type KategoriKesesuaian = 'sesuai' | 'sebagian_sesuai' | 'kurang_sesuai' | 'tidak_sesuai' | 'belum_cukup_data'

type RingkasanTempat = {
  id: string | null
  sumberEksternalId: string | null
  nama: string
  kategori: string | null
  alamat: string | null
  latitude: number
  longitude: number
  jarakMeter: number | null
  sudahDiimpor: boolean
  kesesuaian: { kategori: KategoriKesesuaian; skor: number | null } | null
}
```

`kesesuaian` bernilai `null` jika pengguna belum login, belum punya profil, atau tempat belum diimpor.

## Endpoint tempat

### GET /api/tempat/cari

Parameter query:

| Nama | Wajib | Aturan |
|---|---|---|
| `q` | ya | 3 sampai 100 karakter |
| `lat`, `lon` | tidak | Keduanya harus ada bersamaan. Dipakai untuk menghitung jarak dan mengurutkan |
| `urutkan` | tidak | `relevansi` (bawaan), `jarak`, atau `skor` |
| `kategori` | tidak | Filter kategori fasilitas wajib, dipisah koma, contoh `ramp,toilet_aksesibel` |

Respons 200:

```json
{
  "hasil": [
    {
      "id": "7b1e0c1a-8a3f-4d5e-9f2b-1c2d3e4f5a6b",
      "sumberEksternalId": "osm:node/123456789",
      "nama": "Perpustakaan UGM",
      "kategori": "library",
      "alamat": "Jl. Tri Dharma, Sleman",
      "latitude": -7.7713,
      "longitude": 110.3778,
      "jarakMeter": 420,
      "sudahDiimpor": true,
      "kesesuaian": { "kategori": "sesuai", "skor": 86 }
    }
  ]
}
```

Aturan:

- Hasil lokal dicari dengan kemiripan trigram pada `nama`. Jika hasil lokal kurang dari lima, lengkapi dengan Nominatim dan buang hasil yang `sumberEksternalId`-nya sudah ada di hasil lokal.
- Maksimal 20 hasil.
- Panggilan Nominatim di-cache 24 jam per kata kunci lewat opsi `next: { revalidate: 86400 }` pada `fetch`, dan frontend menunda pemanggilan 500 ms setelah pengguna berhenti mengetik. Keduanya wajib, karena kebijakan Nominatim membatasi 1 permintaan per detik.
- `urutkan=skor` dan filter `kategori` hanya berlaku untuk tempat yang sudah diimpor.

### GET /api/tempat/terdekat

| Nama | Wajib | Aturan |
|---|---|---|
| `lat`, `lon` | ya | Koordinat valid |
| `radius` | tidak | Meter, 100 sampai 5000, bawaan 1000 |

Respons 200 sama dengan `/api/tempat/cari`, hanya berisi tempat yang sudah diimpor, diurutkan dari yang terdekat, maksimal 20.

### POST /api/tempat/impor

```json
{ "sumberEksternalId": "osm:node/123456789" }
```

Respons 201 jika tempat baru dibuat, 200 jika sudah pernah diimpor:

```json
{ "id": "7b1e0c1a-8a3f-4d5e-9f2b-1c2d3e4f5a6b" }
```

Batas permintaan: 10 per menit per alamat IP.

Pemetaan tag OpenStreetMap ke `place_features` dengan `sumber_data = 'osm'`:

| Tag OSM | Nilai | Fitur | Status dan nilai |
|---|---|---|---|
| `wheelchair` | `yes` | `akses_masuk` | `tersedia`, nilai 0 |
| `wheelchair` | `limited` | `akses_masuk` | `terbatas` |
| `wheelchair` | `no` | `akses_masuk` | `tidak_tersedia` |
| `step_count` | angka lebih dari 0 | `jalur_bebas_tangga` | `tidak_tersedia` |
| `ramp:wheelchair` | `yes` / `no` | `ramp` | `tersedia` / `tidak_tersedia` |
| `door:width` | angka dalam meter | `lebar_pintu` | `tersedia`, nilai dikonversi ke cm |
| `toilets:wheelchair` | `yes` / `no` | `toilet_aksesibel` | `tersedia` / `tidak_tersedia` |
| `capacity:disabled` | angka lebih dari 0 / `no` | `parkir_aksesibel` | `tersedia` / `tidak_tersedia` |

Fitur yang tidak punya tag dibuat dengan status `tidak_diketahui`. Pastikan kembali nama dan format setiap tag di wiki OpenStreetMap sebelum implementasi, karena tag aksesibilitas tidak dipakai seragam di semua wilayah.

### GET /api/tempat/{id}

Respons 200:

```json
{
  "tempat": {
    "id": "7b1e0c1a-8a3f-4d5e-9f2b-1c2d3e4f5a6b",
    "nama": "Perpustakaan UGM",
    "kategori": "library",
    "alamat": "Jl. Tri Dharma, Sleman",
    "latitude": -7.7713,
    "longitude": 110.3778
  },
  "fasilitas": [
    {
      "kode": "lebar_pintu",
      "nama": "Lebar pintu",
      "status": "tersedia",
      "nilaiNumerik": 90,
      "satuan": "cm",
      "sumberData": "laporan_pengguna",
      "kepercayaan": { "nilai": 0.82, "tingkat": "tinggi" },
      "terakhirDiverifikasi": "2026-09-20T10:15:00+07:00",
      "jumlahLaporan": 3,
      "jumlahFoto": 2
    }
  ]
}
```

`fasilitas` selalu berisi tujuh item sesuai `feature_types`, termasuk yang berstatus `tidak_diketahui`. `kepercayaan.nilai` diambil dari `confidence_efektif`.

### GET /api/tempat/{id}/bukti

| Nama | Wajib | Aturan |
|---|---|---|
| `fitur` | ya | Salah satu `KodeFitur` |

Respons 200:

```json
{
  "laporan": [
    {
      "id": "0d6f...",
      "pelapor": { "nama": "Nayla" },
      "status": "tersedia",
      "nilaiNumerik": null,
      "catatan": "Ramp di pintu samping",
      "statusModerasi": "aktif",
      "dibuatPada": "2026-09-20T10:15:00+07:00",
      "verifikasi": { "setuju": 3, "sanggah": 0, "milikSaya": "setuju" },
      "foto": [
        {
          "id": "a91c...",
          "url": "https://<proyek>.supabase.co/storage/v1/object/public/foto-laporan/...",
          "statusDeteksi": "selesai",
          "deteksi": [
            { "label": "ramp", "keyakinan": 0.92, "bbox": { "x": 0.21, "y": 0.44, "w": 0.35, "h": 0.30 } }
          ]
        }
      ]
    }
  ]
}
```

Diurutkan dari yang terbaru. `verifikasi.milikSaya` bernilai `null` jika belum login atau belum memverifikasi.

### GET /api/tempat/{id}/kesesuaian

Respons 200 berupa `HasilPenilaian` yang didefinisikan di [Algoritma Penilaian](05-algoritma-penilaian.md#bentuk-hasil). Galat `409 PROFIL_BELUM_ADA` jika pengguna belum mengisi profil kebutuhan.

## Endpoint pengguna

### GET dan PUT /api/saya/profil-kebutuhan

Body PUT dan respons GET:

```json
{
  "jenisAlatBantu": "kursi_roda_manual",
  "tinggiUndakanMaksCm": 3,
  "lebarPintuMinCm": 80,
  "butuhRamp": true,
  "butuhJalurBebasTangga": true,
  "butuhToiletAksesibel": true,
  "butuhLift": false,
  "butuhParkirAksesibel": true
}
```

Aturan validasi: `tinggiUndakanMaksCm` 0 sampai 30, `lebarPintuMinCm` 50 sampai 150. GET mengembalikan `404 TIDAK_DITEMUKAN` jika profil belum ada. PUT membuat profil baru atau menimpa yang lama, lalu menghapus seluruh cache `compatibility_assessments` milik pengguna.

### GET /api/saya/riwayat

| Nama | Wajib | Aturan |
|---|---|---|
| `halaman` | tidak | Mulai dari 1, 10 item per halaman |

```json
{
  "statistik": { "laporan": 12, "verifikasi": 31, "foto": 8 },
  "riwayat": [
    {
      "laporanId": "0d6f...",
      "tempat": { "id": "7b1e...", "nama": "Perpustakaan UGM" },
      "fitur": { "kode": "ramp", "nama": "Ramp atau jalur landai" },
      "status": "tersedia",
      "statusModerasi": "aktif",
      "ringkasanVerifikasi": "terverifikasi",
      "dibuatPada": "2026-09-20T10:15:00+07:00"
    }
  ],
  "halaman": 1,
  "totalHalaman": 2
}
```

`ringkasanVerifikasi`: `terverifikasi` jika setuju minimal 2 dan lebih banyak dari sanggah, `disanggah` jika sanggah lebih banyak dari setuju, selain itu `menunggu_verifikasi`.

## Endpoint laporan

### POST /api/laporan

```json
{
  "tempatId": "7b1e0c1a-8a3f-4d5e-9f2b-1c2d3e4f5a6b",
  "kodeFitur": "ramp",
  "status": "tersedia",
  "nilaiNumerik": null,
  "catatan": "Ramp di pintu samping, agak curam di ujung",
  "foto": [
    { "path": "3f2a.../9c1b....jpg", "namaBerkas": "IMG_2031.jpg", "ukuranByte": 1843200 }
  ]
}
```

Aturan validasi:

- `status` tidak boleh `tidak_diketahui`.
- `nilaiNumerik` wajib untuk `akses_masuk` (0 sampai 100) dan `lebar_pintu` (30 sampai 300), selain itu harus `null`.
- `foto` berisi 0 sampai 5 item. Setiap `path` harus diawali ID pengguna yang login dan filenya harus benar-benar ada di bucket.

Respons 201:

```json
{
  "id": "0d6f...",
  "statusModerasi": "aktif",
  "foto": [
    {
      "id": "a91c...",
      "statusDeteksi": "selesai",
      "deteksi": [
        { "label": "ramp", "keyakinan": 0.92, "bbox": { "x": 0.21, "y": 0.44, "w": 0.35, "h": 0.30 } }
      ]
    }
  ]
}
```

Urutan proses di server:

1. Validasi, lalu simpan `reports` dan `photos`.
2. Panggil layanan AI untuk semua foto secara paralel dengan batas waktu 20 detik per foto.
3. Simpan hasil ke `ai_detections` dan ubah `status_deteksi` foto menjadi `selesai` atau `gagal`.
4. Kembalikan respons. `statusModerasi` di respons sudah mencerminkan hasil pemeriksaan kecocokan deteksi oleh trigger.

Kegagalan layanan AI tidak menggagalkan permintaan. Laporan tetap tersimpan dan foto berstatus `gagal`.

### POST /api/laporan/{id}/deteksi-ulang

Hanya pemilik laporan atau moderator. Menjalankan ulang langkah 2 dan 3 untuk foto berstatus `gagal` atau `menunggu`. Respons 200 sama dengan bagian `foto` pada respons `POST /api/laporan`.

### POST dan DELETE /api/laporan/{id}/verifikasi

Body POST:

```json
{ "jenis": "setuju" }
```

| Respons | Kondisi |
|---|---|
| 201 | Verifikasi tersimpan |
| 403 `TIDAK_DIIZINKAN` | Memverifikasi laporan milik sendiri |
| 409 `KONFLIK` | Sudah pernah memverifikasi laporan ini |

Respons 201 dan DELETE 200:

```json
{ "verifikasi": { "setuju": 4, "sanggah": 0, "milikSaya": "setuju" } }
```

DELETE membatalkan verifikasi milik pengguna, sehingga pengguna dapat mengganti pilihan dengan DELETE lalu POST.

### POST /api/laporan/{id}/tanda

```json
{ "alasan": "Ramp ini sudah dibongkar sejak renovasi" }
```

Respons 201. Laporan otomatis berubah menjadi `perlu_tinjau`. Galat `409 KONFLIK` jika pengguna sudah pernah menandai laporan yang sama.

## Endpoint moderasi

### GET /api/moderasi/laporan

| Nama | Wajib | Aturan |
|---|---|---|
| `status` | tidak | Bawaan `perlu_tinjau` |
| `halaman` | tidak | 20 item per halaman |

Setiap item berisi data laporan seperti di `/api/tempat/{id}/bukti`, ditambah `tempat`, `fitur`, `alasanTinjau` (`deteksi_bertentangan`, `ditandai_pengguna`, atau keduanya), dan daftar `tanda`.

### PATCH /api/moderasi/laporan/{id}

```json
{ "keputusan": "ditolak" }
```

`keputusan` bernilai `disetujui` atau `ditolak`. Tanda terbuka pada laporan tersebut otomatis berubah menjadi `ditindaklanjuti`.

### PATCH /api/moderasi/tanda/{id}

```json
{ "status": "diabaikan" }
```

### PATCH /api/moderasi/tempat/{id}

```json
{ "nama": "Perpustakaan Pusat UGM", "kategori": "library", "alamat": "Jl. Tri Dharma, Sleman" }
```

Semua field opsional, minimal satu harus ada.

## Layanan deteksi AI

Base URL diambil dari `AI_SERVICE_URL`. Hanya dipanggil oleh server aplikasi web.

### GET /kesehatan

Tanpa autentikasi. Dipakai Railway untuk health check.

```json
{ "status": "ok", "mode": "vision_api", "versiModel": "vision-api:nama-model" }
```

### POST /deteksi

Header wajib `X-Api-Key` bernilai sama dengan `API_KEY`.

```json
{ "urlFoto": "https://<proyek>.supabase.co/storage/v1/object/public/foto-laporan/..." }
```

Respons 200:

```json
{
  "versiModel": "yolo11n-aksesin-v1",
  "lebarFoto": 1920,
  "tinggiFoto": 1080,
  "deteksi": [
    { "label": "ramp", "keyakinan": 0.92, "bbox": { "x": 0.21, "y": 0.44, "w": 0.35, "h": 0.30 } },
    { "label": "pintu", "keyakinan": 0.87, "bbox": { "x": 0.60, "y": 0.10, "w": 0.25, "h": 0.70 } }
  ]
}
```

| Respons | Kondisi |
|---|---|
| 401 | `X-Api-Key` tidak ada atau salah |
| 400 `FOTO_TIDAK_DAPAT_DIUNDUH` | URL tidak dapat diunduh atau bukan gambar |
| 413 `FOTO_TERLALU_BESAR` | Ukuran lebih dari 5 MB |
| 504 `DETEKSI_MELEWATI_BATAS_WAKTU` | Detektor tidak selesai dalam 15 detik |

Aturan:

- `label` hanya salah satu dari `ramp`, `tangga`, `pintu`, `toilet_aksesibel`.
- Hanya deteksi dengan keyakinan minimal `AMBANG_KEYAKINAN` yang dikembalikan.
- `deteksi` berupa array kosong jika tidak ada objek, bukan galat.
- Kedua mode detektor wajib menghasilkan bentuk respons yang sama persis. Pada mode vision API, `bbox` wajib tetap diisi. Jika penyedia tidak mengembalikan kotak pembatas, deteksi itu dibuang.
- Format galat layanan AI sama dengan format galat aplikasi web.

## Kriteria penerimaan

### #13 Mengimplementasikan pendaftaran, login, dan logout

- [ ] Pengguna dapat mendaftar dengan email dan kata sandi minimal 8 karakter, lalu otomatis login.
- [ ] Email yang sudah terdaftar menampilkan pesan galat yang jelas, bukan galat mentah dari Supabase.
- [ ] Sesi bertahan setelah halaman dimuat ulang dan setelah browser ditutup lalu dibuka kembali.
- [ ] Logout menghapus sesi dan mengarahkan ke beranda.
- [ ] Halaman yang butuh login mengarahkan pengguna tanpa sesi ke halaman login, lalu kembali ke halaman semula setelah berhasil login.
- [ ] Route handler bertanda "Login: ya" mengembalikan `401 TIDAK_TERAUTENTIKASI` tanpa sesi.

### #16 Mengintegrasikan sumber data tempat dari OpenStreetMap

- [ ] `GET /api/tempat/cari` mengembalikan hasil lokal dan hasil Nominatim sesuai aturan di dokumen ini.
- [ ] Mencari kata kunci yang sama dua kali dalam 24 jam tidak memanggil Nominatim untuk kedua kalinya.
- [ ] Setiap panggilan Nominatim dan Overpass mengirim header `User-Agent` dari `NOMINATIM_USER_AGENT`.
- [ ] `POST /api/tempat/impor` untuk tempat yang sama dua kali tidak membuat baris ganda dan mengembalikan 200 pada panggilan kedua.
- [ ] Tempat hasil impor selalu punya tepat tujuh baris `place_features`.
- [ ] Pemetaan tag diuji dengan pengujian unit memakai contoh respons Overpass yang disimpan sebagai fixture, bukan panggilan jaringan sungguhan.
- [ ] `GET /api/tempat/{id}` mengembalikan bentuk respons sesuai dokumen ini.

### #18 Menambahkan pencarian berbasis lokasi serta penyaringan dan pengurutan hasil

- [ ] `GET /api/tempat/terdekat` memakai indeks `places_lokasi_idx`, dibuktikan dengan `explain` yang menunjukkan index scan.
- [ ] Radius di luar rentang 100 sampai 5000 menghasilkan `400 VALIDASI_GAGAL`.
- [ ] Filter `kategori` hanya mengembalikan tempat yang fasilitas terkait berstatus `tersedia` atau `terbatas`.
- [ ] `urutkan=skor` menempatkan tempat berkategori `tidak_sesuai` dan `belum_cukup_data` di urutan paling bawah.

### #21 Mengimplementasikan verifikasi setuju dan sanggah

- [ ] Seluruh respons verifikasi sesuai tabel kondisi di dokumen ini.
- [ ] Setelah verifikasi masuk atau dibatalkan, `confidence_efektif` fasilitas terkait berubah tanpa perlu memanggil endpoint lain.
- [ ] `GET /api/tempat/{id}/bukti` mengembalikan jumlah verifikasi dan `milikSaya` yang benar.

### #23 Membangun halaman moderasi untuk laporan bermasalah

- [ ] Seluruh endpoint moderasi mengembalikan `403 TIDAK_DIIZINKAN` untuk pengguna biasa.
- [ ] Laporan yang ditolak hilang dari `/api/tempat/{id}/bukti` dan tidak lagi memengaruhi status fasilitas.
- [ ] Menandai laporan mengubahnya menjadi `perlu_tinjau` dan laporan itu muncul di antrean moderasi.
- [ ] Halaman moderasi menampilkan foto beserta kotak hasil deteksi AI di atasnya.

### #27 Mengintegrasikan hasil deteksi ke alur unggah foto

- [ ] `POST /api/laporan` memanggil layanan AI dan menyimpan hasilnya sesuai urutan proses di dokumen ini.
- [ ] Mematikan layanan AI tidak menggagalkan pengiriman laporan. Foto berstatus `gagal`.
- [ ] `POST /api/laporan/{id}/deteksi-ulang` berhasil mendeteksi foto berstatus `gagal` setelah layanan AI hidup kembali.
- [ ] `AI_SERVICE_API_KEY` tidak pernah muncul di bundle JavaScript browser.
- [ ] Laporan berstatus `tersedia` untuk `ramp` dengan foto tanpa deteksi ramp berubah menjadi `perlu_tinjau`.
