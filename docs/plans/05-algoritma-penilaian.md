# Algoritma Penilaian

Dokumen ini mendefinisikan dua perhitungan yang menjadi keunggulan utama Aksesin: **skor kesesuaian**, yaitu seberapa cocok suatu tempat dengan kebutuhan seorang pengguna, dan **Accessibility Confidence**, yaitu seberapa layak data suatu fasilitas dipercaya.

Semua angka pada kasus uji di dokumen ini sudah dihitung dan wajib dipakai sebagai pengujian unit.

Issue terkait: #29 dan #30 (Gilbert), #31 (Nayla, untuk tampilan rincian).

## Skor kesesuaian

### Prinsip

1. **Kebutuhan wajib adalah gerbang.** Tempat yang terbukti tidak memenuhi satu kebutuhan wajib tidak boleh dinilai sesuai, setinggi apa pun skor kebutuhan lain. Tempat tanpa ramp tidak bisa dimasuki pengguna yang wajib ramp.
2. **Data yang belum ada bukan kegagalan.** Fasilitas yang belum diketahui tidak memicu gerbang, tetapi tidak menyumbang skor dan menurunkan kelengkapan.
3. **Hasil harus dapat dijelaskan.** Setiap skor disertai rincian per kebutuhan, sehingga pengguna tahu alasan sebuah tempat dinilai demikian.

### Kebutuhan yang dinilai

Kebutuhan yang dinilai untuk seorang pengguna terdiri atas dua kebutuhan yang selalu berlaku, ditambah fasilitas yang dicentang di profilnya.

| Kode fitur | Berlaku jika | Bobot |
|---|---|---|
| `akses_masuk` | Selalu | 3 |
| `lebar_pintu` | Selalu | 3 |
| `ramp` | `butuhRamp` | 2 |
| `jalur_bebas_tangga` | `butuhJalurBebasTangga` | 2 |
| `toilet_aksesibel` | `butuhToiletAksesibel` | 2 |
| `lift` | `butuhLift` | 1 |
| `parkir_aksesibel` | `butuhParkirAksesibel` | 1 |

Bobot mencerminkan dampak kegagalan. Pengguna yang tidak bisa melewati pintu masuk tidak bisa memakai tempat itu sama sekali, sedangkan ketiadaan parkir aksesibel masih bisa disiasati.

### Menilai satu kebutuhan

Setiap kebutuhan menghasilkan salah satu dari empat hasil, dengan nilai:

| Hasil | Nilai |
|---|---|
| `terpenuhi` | 1 |
| `sebagian` | 0,5 |
| `tidak_terpenuhi` | 0 |
| `tidak_diketahui` | 0, dan tidak dihitung dalam kelengkapan |

Aturan penilaian, diperiksa berurutan dan berhenti di aturan pertama yang cocok:

| Urutan | Kondisi | Hasil |
|---|---|---|
| 1 | `confidence_efektif` fasilitas kurang dari 0,25 | `tidak_diketahui`, dengan penanda `kepercayaanRendah` |
| 2 | Status `tidak_diketahui` | `tidak_diketahui` |
| 3 | Status `tidak_tersedia` | `tidak_terpenuhi` |
| 4 | `akses_masuk` dengan `nilaiNumerik` terisi | `terpenuhi` jika nilai ≤ `tinggiUndakanMaksCm`, selain itu `tidak_terpenuhi` |
| 5 | `lebar_pintu` dengan `nilaiNumerik` kosong | `tidak_diketahui` |
| 6 | `lebar_pintu` dengan `nilaiNumerik` terisi | `terpenuhi` jika nilai ≥ `lebarPintuMinCm`, selain itu `tidak_terpenuhi` |
| 7 | Status `tersedia` | `terpenuhi` |
| 8 | Status `terbatas` | `sebagian` |

Aturan 1 mencegah satu laporan yang sudah banyak disanggah menjatuhkan skor sebuah tempat.

### Menghitung skor dan kategori

```
bobotTotal     = jumlah bobot semua kebutuhan yang berlaku
bobotDiketahui = jumlah bobot kebutuhan yang hasilnya bukan tidak_diketahui
kelengkapan    = bobotDiketahui / bobotTotal
skorMentah     = 100 × Σ(bobot × nilai) / bobotTotal
skor           = skorMentah dibulatkan ke bilangan bulat terdekat, 0,5 dibulatkan ke atas
```

Kategori ditentukan berurutan:

| Urutan | Kondisi | Kategori | Skor yang ditampilkan |
|---|---|---|---|
| 1 | Ada kebutuhan `tidak_terpenuhi` | `tidak_sesuai` | Nilai terkecil antara `skor` dan 39 |
| 2 | `kelengkapan` kurang dari 0,5 | `belum_cukup_data` | Kosong |
| 3 | `skor` ≥ 80 dan `kelengkapan` = 1 | `sesuai` | `skor` |
| 4 | `skor` ≥ 50 | `sebagian_sesuai` | `skor` |
| 5 | Selain itu | `kurang_sesuai` | `skor` |

Pembatasan skor maksimal 39 untuk kategori `tidak_sesuai` memastikan angka dan kategori tidak pernah saling bertentangan di mata pengguna. Syarat `kelengkapan = 1` untuk kategori `sesuai` memastikan tempat tidak dinyatakan sesuai jika masih ada kebutuhan yang belum diketahui.

Label yang ditampilkan ke pengguna:

| Kategori | Label |
|---|---|
| `sesuai` | Sesuai |
| `sebagian_sesuai` | Sebagian sesuai |
| `kurang_sesuai` | Kurang sesuai |
| `tidak_sesuai` | Tidak sesuai |
| `belum_cukup_data` | Belum cukup data |

### Bentuk hasil

```ts
type HasilKriteria = 'terpenuhi' | 'sebagian' | 'tidak_terpenuhi' | 'tidak_diketahui'

type RincianKriteria = {
  kode: KodeFitur
  nama: string
  bobot: number
  hasil: HasilKriteria
  syarat: string
  kondisiTempat: string
  kepercayaanRendah: boolean
}

type HasilPenilaian = {
  skor: number | null
  kategori: KategoriKesesuaian
  kelengkapan: number
  jumlahKebutuhan: number
  jumlahTerpenuhi: number
  kriteria: RincianKriteria[]
  dihitungPada: string
}
```

Contoh isi `syarat` dan `kondisiTempat`:

| Kode | `syarat` | `kondisiTempat` |
|---|---|---|
| `akses_masuk` | `Undakan maksimal 3 cm` | `Undakan 5 cm`, `Tanpa undakan`, `Terbatas`, `Belum diketahui` |
| `lebar_pintu` | `Lebar pintu minimal 80 cm` | `Lebar pintu 78 cm`, `Belum diketahui` |
| Lainnya | `Wajib tersedia` | `Tersedia`, `Terbatas`, `Tidak tersedia`, `Belum diketahui` |

`jumlahTerpenuhi` hanya menghitung hasil `terpenuhi`. Nilai ini dipakai untuk kalimat "5 dari 6 kebutuhan terpenuhi" di halaman detail.

### Letak implementasi

- Fungsi murni `hitungKesesuaian(profil, fasilitas): HasilPenilaian` di `web/src/lib/penilaian/skor-kesesuaian.ts`.
- Fungsi tidak membaca waktu, basis data, atau jaringan. `dihitungPada` diisi oleh pemanggil.
- Konstanta bobot dan ambang ditulis sekali di file yang sama dan tidak diulang di tempat lain.

### Kasus uji skor kesesuaian

Profil untuk kasus K1 sampai K8: kursi roda manual, undakan maksimal 3 cm, pintu minimal 80 cm, wajib ramp, jalur bebas tangga, toilet aksesibel, dan parkir aksesibel. Enam kebutuhan berlaku, `bobotTotal` = 13.

Confidence semua fasilitas 0,80, kecuali disebutkan lain.

| Kasus | Kondisi fasilitas | Skor mentah | Skor | Kategori | Kelengkapan | Terpenuhi |
|---|---|---|---|---|---|---|
| K1 | Semua tersedia, undakan 0 cm, pintu 90 cm | 100,00 | 100 | `sesuai` | 1,00 | 6 dari 6 |
| K2 | Seperti K1, tetapi toilet `tidak_tersedia` dengan confidence 0,60 | 84,62 | 39 | `tidak_sesuai` | 1,00 | 5 dari 6 |
| K3 | Seperti K1, tetapi toilet `tidak_diketahui` dan parkir `terbatas` | 80,77 | 81 | `sebagian_sesuai` | 0,85 | 4 dari 6 |
| K4 | Seperti K1, tetapi undakan 5 cm | 76,92 | 39 | `tidak_sesuai` | 1,00 | 5 dari 6 |
| K5 | Seperti K2, tetapi confidence toilet 0,20 | 84,62 | 85 | `sebagian_sesuai` | 0,85 | 5 dari 6 |
| K6 | Hanya akses masuk (0 cm) dan pintu (90 cm) yang diketahui | 46,15 | kosong | `belum_cukup_data` | 0,46 | 2 dari 6 |
| K7 | Akses masuk `terbatas` tanpa nilai, pintu 85 cm, ramp `terbatas`, parkir `terbatas`, sisanya `tidak_diketahui` | 46,15 | 46 | `kurang_sesuai` | 0,69 | 1 dari 6 |
| K8 | Seperti K1, tetapi pintu 78 cm | 76,92 | 39 | `tidak_sesuai` | 1,00 | 5 dari 6 |

Kasus K9 memakai profil lain: undakan maksimal 2 cm, pintu minimal 75 cm, tanpa fasilitas wajib tambahan. Dua kebutuhan berlaku, `bobotTotal` = 6.

| Kasus | Kondisi fasilitas | Skor mentah | Skor | Kategori | Kelengkapan | Terpenuhi |
|---|---|---|---|---|---|---|
| K9 | Akses masuk tersedia 0 cm, pintu `tidak_diketahui` | 50,00 | 50 | `sebagian_sesuai` | 0,50 | 1 dari 2 |

K9 menguji batas: kelengkapan tepat 0,5 tidak termasuk `belum_cukup_data`.

## Accessibility Confidence

Confidence dihitung per fasilitas per tempat, bernilai 0 sampai 1, dan disimpan di `place_features.nilai_confidence`. Perhitungan berjalan di basis data lewat fungsi `sinkronkan_place_feature` setiap kali ada perubahan pada laporan, verifikasi, foto, atau hasil deteksi.

### Agregasi status fasilitas

1. Ambil semua laporan untuk pasangan tempat dan fitur tersebut yang `status_moderasi`-nya bukan `ditolak`. Laporan ini disebut laporan aktif.
2. Jika tidak ada laporan aktif:
   - Jika fasilitas berasal dari impor OpenStreetMap, pertahankan status dan nilainya dengan confidence 0,40.
   - Selain itu, status menjadi `tidak_diketahui` dengan confidence 0.
3. Jika ada laporan aktif, hitung **skor laporan** untuk setiap laporan aktif.
4. Laporan dengan skor laporan tertinggi menjadi **laporan acuan**. Jika seri, pilih yang paling baru.
5. Salin `status_dilaporkan` dan `nilai_numerik` laporan acuan ke `place_features`. `sumber_data` menjadi `moderator` jika laporan acuan berstatus `disetujui`, selain itu `laporan_pengguna`.
6. Hitung confidence akhir, lalu isi `terakhir_diverifikasi` dengan waktu terbaru di antara pembuatan laporan acuan dan verifikasi `setuju` terakhir pada laporan acuan.

### Skor laporan

| Komponen | Nilai |
|---|---|
| Dasar, laporan berstatus `disetujui` | 0,70 |
| Dasar, laporan lain | 0,40 |
| Setiap verifikasi `setuju` | +0,10, maksimal tiga verifikasi yang dihitung |
| Setiap verifikasi `sanggah` | −0,15, tanpa batas |
| Laporan memiliki minimal satu foto | +0,10 |
| Hasil deteksi AI mendukung laporan | +0,10 |
| Hasil deteksi AI bertentangan dengan laporan | −0,10 |

Skor laporan dibatasi ke rentang 0 sampai 1.

### Confidence akhir

```
laporanSepakat = jumlah laporan aktif lain dengan status_dilaporkan sama dengan laporan acuan,
                 ditambah 1 jika data OpenStreetMap menunjukkan status yang sama
confidence     = min(1, skorLaporanAcuan + 0,05 × min(3, laporanSepakat))
```

Laporan dari orang berbeda yang saling sepakat menambah kepercayaan, tetapi dibatasi supaya banyak laporan tanpa bukti tidak bisa menyaingi satu laporan berfoto yang disetujui moderator.

### Penurunan karena umur

Dihitung saat dibaca lewat view `v_place_features`:

```
umur    = jumlah hari sejak terakhir_diverifikasi
faktor  = 1                                  jika umur ≤ 180
faktor  = max(0,5; 1 − (umur − 180) / 365)   jika umur > 180
confidence_efektif = nilai_confidence × faktor, dibulatkan dua desimal
```

Data yang tidak diperbarui lebih dari enam bulan mulai kehilangan kepercayaan secara bertahap, tetapi tidak pernah turun di bawah separuh nilai asalnya. Fasilitas fisik seperti ramp tidak hilang dalam semalam, sehingga data lama tetap berguna walaupun kurang pasti.

### Tingkat kepercayaan

| `confidence_efektif` | Tingkat | Label |
|---|---|---|
| ≥ 0,70 | `tinggi` | Kepercayaan tinggi |
| 0,40 sampai 0,69 | `sedang` | Kepercayaan sedang |
| < 0,40 | `rendah` | Kepercayaan rendah |

### Kecocokan hasil deteksi AI

`maksKeyakinan(label)` adalah keyakinan tertinggi untuk label tersebut di antara semua foto laporan yang `status_deteksi`-nya `selesai`. Jika laporan tidak punya foto berstatus `selesai`, hasilnya netral.

| Fitur | Status dilaporkan | Mendukung jika | Bertentangan jika |
|---|---|---|---|
| `ramp` | `tersedia` atau `terbatas` | `maksKeyakinan(ramp)` ≥ 0,60 | `maksKeyakinan(ramp)` < 0,50 |
| `ramp` | `tidak_tersedia` | Tidak pernah | `maksKeyakinan(ramp)` ≥ 0,70 |
| `toilet_aksesibel` | `tersedia` atau `terbatas` | `maksKeyakinan(toilet_aksesibel)` ≥ 0,60 | `maksKeyakinan(toilet_aksesibel)` < 0,50 |
| `toilet_aksesibel` | `tidak_tersedia` | Tidak pernah | `maksKeyakinan(toilet_aksesibel)` ≥ 0,70 |
| `jalur_bebas_tangga` | `tersedia` | Tidak pernah | `maksKeyakinan(tangga)` ≥ 0,70 |
| `jalur_bebas_tangga` | `tidak_tersedia` | `maksKeyakinan(tangga)` ≥ 0,60 | Tidak pernah |
| `akses_masuk`, `lebar_pintu` | Apa pun | `maksKeyakinan(pintu)` ≥ 0,60 | Tidak pernah |
| `lift`, `parkir_aksesibel` | Apa pun | Tidak pernah | Tidak pernah |

Ketiadaan objek di foto hanya dianggap bukti lemah. Karena itu foto tanpa tangga tidak pernah dianggap mendukung klaim jalur bebas tangga, sedangkan foto yang jelas menunjukkan tangga dianggap bertentangan.

Jika hasilnya bertentangan dan `status_moderasi` laporan masih `aktif`, ubah menjadi `perlu_tinjau`. Laporan berstatus `disetujui` atau `ditolak` tidak diubah, karena keputusan moderator lebih kuat daripada deteksi otomatis.

### Kasus uji confidence

| Kasus | Kondisi laporan acuan | Confidence | Tingkat |
|---|---|---|---|
| C1 | Laporan tunggal, tanpa foto dan verifikasi | 0,40 | `sedang` |
| C2 | Dengan foto, AI mendukung, 3 setuju | 0,90 | `tinggi` |
| C3 | Dengan foto, AI bertentangan, 1 sanggah | 0,25 | `rendah` |
| C4 | Tanpa foto, 2 sanggah | 0,10 | `rendah` |
| C5 | Dengan foto, AI mendukung, 2 laporan lain sepakat | 0,70 | `tinggi` |
| C6 | Disetujui moderator, dengan foto | 0,80 | `tinggi` |
| C7 | Tanpa foto, 5 setuju | 0,70 | `tinggi` |

C7 menguji batas tiga verifikasi yang dihitung.

Kasus uji penurunan karena umur, dengan `nilai_confidence` 0,80:

| Umur | Faktor | `confidence_efektif` | Tingkat |
|---|---|---|---|
| 100 hari | 1,0000 | 0,80 | `tinggi` |
| 270 hari | 0,7534 | 0,60 | `sedang` |
| 365 hari | 0,5000 | 0,40 | `sedang` |
| 600 hari | 0,5000 | 0,40 | `sedang` |

## Kriteria penerimaan

### #29 Merumuskan dan mengimplementasikan algoritma skor kesesuaian

- [ ] `hitungKesesuaian` diimplementasikan sebagai fungsi murni sesuai bagian letak implementasi.
- [ ] Kasus uji K1 sampai K9 ditulis sebagai pengujian unit dan seluruhnya lulus.
- [ ] Pengujian unit dapat dijalankan dengan `npm test` di folder `web/`.
- [ ] `GET /api/tempat/{id}/kesesuaian` mengembalikan `HasilPenilaian` dan menyimpan cache ke `compatibility_assessments`.
- [ ] Mengubah profil kebutuhan langsung mengubah skor yang ditampilkan tanpa perlu memuat ulang cache secara manual.

### #30 Mengimplementasikan perhitungan Accessibility Confidence

- [ ] Fungsi `sinkronkan_place_feature` dan seluruh trigger di [Skema Basis Data](03-skema-basis-data.md#fungsi-dan-trigger) tersimpan sebagai migrasi.
- [ ] Kasus uji C1 sampai C7 dan keempat kasus umur diuji terhadap basis data dan seluruhnya lulus.
- [ ] Laporan yang ditolak moderator tidak lagi memengaruhi status maupun confidence.
- [ ] Aturan kecocokan deteksi AI mengubah `status_moderasi` sesuai tabel, dan tidak mengubah laporan yang sudah `disetujui` atau `ditolak`.
- [ ] Menambah verifikasi pada laporan yang bukan laporan acuan dapat mengganti laporan acuan jika skornya menjadi lebih tinggi.
