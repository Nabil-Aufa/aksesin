# Panduan Antarmuka

Dokumen ini menetapkan standar visual dan aksesibilitas antarmuka Aksesin. Karena pengguna utama Aksesin adalah penyandang disabilitas, aksesibilitas antarmuka bukan fitur tambahan melainkan syarat dasar. Produk yang menilai aksesibilitas tempat tetapi antarmukanya sendiri tidak aksesibel akan kehilangan kredibilitas.

Standar yang dipakai: **WCAG 2.1 level AA**.

Issue terkait: #8, #14, #17, #19, #20, #22, #31, #33 (Nayla), #13 untuk halaman autentikasi (Gilbert).

Sumber rancangan hi-fi adalah file pen.dev [`docs/desain/aksesin-ui.pen`](../desain/aksesin-ui.pen) beserta ekspor gambarnya di [`docs/desain/ekspor/`](../desain/ekspor/). Gambar [`00-daftar-halaman.png`](../desain/ekspor/00-daftar-halaman.png) memetakan setiap route ke frame desktop, frame HP, dan frame keadaannya. Jika rancangan dan dokumen ini berbeda, aturan aksesibilitas di dokumen ini yang berlaku, lalu rancangannya diperbaiki.

Rancangan lo-fi lama tetap tersedia sebagai [wireframe lo-fi](../assets/wireframe-lofi.png) untuk riwayat, tetapi tidak lagi menjadi acuan visual.

## Prinsip

1. **Warna tidak pernah menjadi satu-satunya penanda.** Setiap status selalu disertai teks dan ikon.
2. **Semua dapat dioperasikan dengan keyboard dan pembaca layar.** Termasuk peta, yang wajib punya padanan berupa daftar.
3. **Mobile-first.** Kontribusi dilakukan di lokasi, jadi rancangan dimulai dari layar 360 px lalu diperlebar.
4. **Jelaskan, jangan hanya menilai.** Setiap skor dan status selalu bisa dibuka untuk melihat alasannya.

## Warna

Rasio kontras di bawah sudah dihitung dengan rumus WCAG. Syarat AA: minimal 4,5:1 untuk teks biasa, 3:1 untuk teks besar dan batas komponen interaktif.

### Warna dasar

| Token | Hex | Dipakai untuk | Kontras |
|---|---|---|---|
| `tinta` | `#0B1F33` | Teks utama dan judul | 16,69:1 terhadap putih |
| `primer` | `#1F5BD6` | Tombol utama, tautan | 5,96:1 terhadap putih |
| `primer-tua` | `#163E9C` | Hover tombol utama, latar gelap | Teks putih di atasnya 9,53:1 |
| `primer-muda` | `#EEF4FF` | Latar chip aksen, item navigasi aktif, kotak info | Teks `primer` di atasnya 5,39:1 |
| `sinyal` | `#FFD43B` | Latar kartu skor, halo cincin fokus | Teks `tinta` di atasnya 11,71:1. **Tidak pernah dipakai sebagai warna teks** |
| `teks-sekunder` | `#4F5A6B` | Keterangan, label pendukung | 6,98:1 terhadap putih, 6,45:1 terhadap `permukaan` |
| `permukaan` | `#F3F6FB` | Latar halaman dan area sekunder | - |
| `garis-kontrol` | `#7A8599` | Batas kolom isian, radio, checkbox | 3,72:1 terhadap putih |
| `garis-dekoratif` | `#DCE3EE` | Pemisah dan batas kartu yang tidak interaktif | Tidak untuk komponen interaktif |
| `latar` | `#FFFFFF` | Latar kartu dan kolom isian | - |

Token didefinisikan sekali di `web/src/app/globals.css`. Komponen tidak boleh menulis nilai hex, `rgb()`, `hsl()`, atau kelas warna arbitrer Tailwind seperti `bg-[#...]`. Aturan ini diperiksa di CI lewat `npm run cek:warna`.

**Perbedaan dari wireframe lo-fi:** wireframe memakai `#BAC0C7` untuk batas kolom isian, radio, dan checkbox. Warna itu hanya 1,83:1 terhadap putih dan **gagal** syarat 3:1 untuk batas komponen interaktif. Pada rancangan hi-fi dan implementasi, semua batas komponen interaktif wajib memakai `garis-kontrol`.

### Warna status

| Token | Teks | Latar | Kontras teks di atas latar | Kontras teks di atas putih |
|---|---|---|---|---|
| `sukses` | `#1E7A3C` | `#E6F4EA` | 4,74:1 | 5,38:1 |
| `peringatan` | `#8A5A00` | `#FDF3DC` | 5,37:1 | 5,93:1 |
| `bahaya` | `#B42318` | `#FDECEA` | 5,75:1 | 6,57:1 |

### Fokus

Cincin fokus terdiri atas dua lapis yang diatur global lewat `:focus-visible`: cincin `tinta` setebal 3 px menempel pada elemen, dan halo `sinyal` setebal 3 px di luarnya (`outline: 3px solid sinyal; outline-offset: 3px; box-shadow: 0 0 0 3px tinta`). Lapisan gelap memberi kontras di latar terang, lapisan kuning memberi kontras di latar `primer` dan `primer-tua`. Jangan pernah menghapus atau menimpa outline fokus.

## Penanda status

### Kategori kesesuaian

| Kategori | Label | Warna | Ikon |
|---|---|---|---|
| `sesuai` | Sesuai | `sukses` | Centang dalam lingkaran |
| `sebagian_sesuai` | Sebagian sesuai | `peringatan` | Tanda seru dalam lingkaran |
| `kurang_sesuai` | Kurang sesuai | `peringatan` | Tanda seru dalam segitiga |
| `tidak_sesuai` | Tidak sesuai | `bahaya` | Silang dalam lingkaran |
| `belum_cukup_data` | Belum cukup data | `teks-sekunder` di atas `permukaan` | Tanda tanya dalam lingkaran |

### Status fasilitas

| Status | Label | Warna | Ikon |
|---|---|---|---|
| `tersedia` | Tersedia | `sukses` | Centang |
| `terbatas` | Terbatas | `peringatan` | Tanda seru |
| `tidak_tersedia` | Tidak tersedia | `bahaya` | Silang |
| `tidak_diketahui` | Belum ada data | `teks-sekunder` | Tanda tanya |

### Tingkat kepercayaan

| Tingkat | Label | Warna |
|---|---|---|
| `tinggi` | Kepercayaan tinggi | `sukses` |
| `sedang` | Kepercayaan sedang | `peringatan` |
| `rendah` | Kepercayaan rendah | `teks-sekunder` |

Kepercayaan rendah sengaja tidak memakai merah. Data berkepercayaan rendah belum tentu salah, hanya belum cukup bukti.

Ikon memakai pustaka `lucide-react`. Ikon yang bermakna diberi `aria-hidden="true"` karena labelnya sudah tertulis di teks di sebelahnya.

## Tipografi

Tiga font, semuanya dimuat lewat `next/font/google` supaya tidak ada pergeseran tata letak:

| Token font | Font | Ketebalan | Dipakai untuk |
|---|---|---|---|
| `font-judul` | Plus Jakarta Sans | 700, 800 | Semua heading `h1` sampai `h4` dan judul kartu |
| `font-isi` | Atkinson Hyperlegible Next | 400, 700 | Teks isi, label, tombol, chip. Bawaan `body` |
| `font-angka` | JetBrains Mono | 600 | Ukuran dan angka terukur, contoh "90 cm", "1:8" |

Atkinson Hyperlegible dirancang supaya huruf yang mirip seperti I, l, dan 1 mudah dibedakan oleh pembaca dengan penglihatan rendah. Karena hanya memuat ketebalan 400 dan 700, gunakan `font-bold` untuk penekanan, bukan `font-medium` atau `font-semibold`.

| Token | Ukuran dan tinggi baris | Ketebalan | Dipakai untuk |
|---|---|---|---|
| `judul-1` | 28 / 34 px | Extra Bold | Judul halaman |
| `judul-2` | 22 / 28 px | Bold | Judul bagian |
| `judul-3` | 18 / 24 px | Bold | Judul kartu |
| `isi` | 16 / 24 px | Regular | Teks utama, **termasuk isi kolom isian** |
| `kecil` | 14 / 20 px | Regular | Keterangan, chip, label kolom |
| `mini` | 12 / 16 px | Regular | Hanya untuk informasi yang tidak penting |

Aturan:

- Isi kolom isian minimal 16 px. Ukuran lebih kecil membuat browser iOS memperbesar halaman otomatis saat kolom disentuh.
- Semua ukuran memakai satuan `rem`, supaya pengaturan ukuran huruf di browser pengguna tetap berlaku.
- Label bagian berhuruf kapital seperti "RINCIAN FASILITAS" ditulis biasa di HTML lalu dikapitalkan lewat CSS, supaya pembaca layar tidak mengejanya huruf per huruf.

## Tata letak

| Aspek | Aturan |
|---|---|
| Satuan jarak | Kelipatan 4 px: 4, 8, 12, 16, 24, 32, 48 |
| Lebar konten | Maksimal 640 px di tengah untuk halaman formulir dan detail |
| Padding halaman | 16 px di layar kurang dari 640 px, 24 px di atasnya |
| Sudut | `rounded-kontrol` 12 px untuk tombol dan kolom isian, `rounded-kartu` 16 px untuk kartu dan foto, `rounded-full` untuk chip |
| Target sentuh | Minimal 44 x 44 px untuk semua elemen interaktif |
| Titik henti | 360 px sebagai dasar, 640 px, dan 1024 px |

## Komponen

Komponen dasar ada di `web/src/components/ui/` dan mengikuti komponen pada `docs/desain/aksesin-ui.pen`. Halaman wajib memakai komponen ini, bukan membuat tombol, kolom isian, atau chip baru.

| Komponen React | Keadaan yang wajib ada |
|---|---|
| `AppBar` | Dengan dan tanpa tombol kembali |
| `Tombol` | Primer, sekunder, teks, ukuran normal 52 px dan ringkas 44 px, hover, fokus, nonaktif, memuat |
| `KolomIsian` | Kosong, terisi, fokus, galat dengan ikon, nonaktif |
| `Chip` | Varian untuk setiap penanda status di atas, selalu ikon dan teks |
| `GambarTempat` | Memuat, gagal dimuat, dengan kotak deteksi AI |
| `KartuSkorKesesuaian` | Kelima kategori, belum login, belum punya profil |
| `BarisFasilitas` | Keempat status, dengan tingkat kepercayaan |

Aturan komponen:

- `Tombol` primer berlatar `primer` dengan teks putih dan berubah ke `primer-tua` saat hover. `Tombol` sekunder berlatar putih dengan garis `primer` 2 px.
- `Tombol` saat memuat tetap mempertahankan lebarnya, menampilkan indikator, dan memberi `aria-busy="true"`.
- `KolomIsian` selalu punya `<label>` yang terlihat. Placeholder bukan pengganti label.
- Pesan galat kolom ditampilkan di bawah kolom dengan ikon dan warna `bahaya`, dihubungkan lewat `aria-describedby`, dan kolom diberi `aria-invalid="true"`.
- `GambarTempat` dengan kotak deteksi AI menampilkan label dan persentase keyakinan di setiap kotak, dan menyediakan ringkasan teks deteksi untuk pembaca layar.

## Halaman

Frame desain setiap route tercantum di [`00-daftar-halaman.png`](../desain/ekspor/00-daftar-halaman.png).

| Route | Layar wireframe | Login | Issue |
|---|---|---|---|
| `/` | 1. Beranda dan Pencarian | Tidak | #17 |
| `/masuk`, `/daftar` | - | Tidak | #13 |
| `/profil-kebutuhan` | 2. Profil Kebutuhan Aksesibilitas | Ya | #14 |
| `/cari` | 3. Hasil Pencarian | Tidak | #17, #18 |
| `/tempat/[id]` | 4. Detail Aksesibilitas Tempat | Tidak | #19, #31 |
| `/tempat/[id]/bukti` | - | Tidak | #21 |
| `/tempat/[id]/lapor` | 5. Tambah Laporan dan Deteksi AI | Ya | #20 |
| `/saya` | 6. Profil dan Riwayat Kontribusi | Ya | #22 |
| `/moderasi` | - | Moderator | #23 |

Aturan umum halaman:

- `<html lang="id">`.
- Setiap halaman punya tepat satu `<h1>` dan struktur heading yang tidak melompat tingkat.
- Tautan "Lewati ke konten utama" menjadi elemen pertama yang menerima fokus.
- Judul tab browser berbeda untuk setiap halaman, contoh `Perpustakaan UGM | Aksesin`.
- Setiap halaman yang memuat data punya keadaan memuat, kosong, dan galat yang dirancang, bukan halaman putih.
- Animasi dinonaktifkan jika pengguna mengaktifkan `prefers-reduced-motion`.

## Kriteria penerimaan

### #8 Menyusun panduan visual dan komponen antarmuka

- [ ] File `docs/desain/aksesin-ui.pen` berisi seluruh token warna, tipografi, dan jarak di dokumen ini sebagai variabel.
- [ ] Komponen di file pen.dev sudah hi-fi dengan seluruh keadaan di tabel komponen, dan setiap halaman diekspor ke `docs/desain/ekspor/`.
- [ ] Token yang sama didefinisikan sekali di konfigurasi Tailwind di `web/`, dan tidak ada nilai warna hex yang ditulis langsung di komponen.
- [ ] Rasio kontras setiap pasangan warna yang dipakai dicocokkan ulang dengan pemeriksa kontras dan sesuai tabel di dokumen ini.

### #14 Membuat formulir profil kebutuhan aksesibilitas

- [ ] Formulir sesuai layar 2 wireframe dan kontrak `PUT /api/saya/profil-kebutuhan`.
- [ ] Jika profil sudah ada, formulir terisi dengan nilai tersimpan.
- [ ] Pilihan alat bantu memakai grup radio dengan `<fieldset>` dan `<legend>`, fasilitas wajib memakai grup checkbox dengan cara yang sama.
- [ ] Validasi di browser memakai skema `zod` yang sama dengan server, dan pesan galat sesuai aturan komponen.
- [ ] Setelah tersimpan, pengguna kembali ke halaman asal dan melihat pesan konfirmasi yang diumumkan ke pembaca layar lewat `aria-live`.

### #17 Membangun halaman pencarian beserta peta interaktif

- [ ] Beranda dan halaman hasil sesuai layar 1 dan 3 wireframe.
- [ ] Pencarian baru dikirim setelah minimal 3 karakter dan 500 ms setelah pengguna berhenti mengetik.
- [ ] Tab "Daftar" menjadi bawaan. Daftar memuat seluruh informasi yang ada di peta, sehingga peta tidak wajib dipakai.
- [ ] Penanda di peta dapat dipilih dengan keyboard dan membuka ringkasan tempat.
- [ ] Atribusi OpenStreetMap tampil di peta.
- [ ] Tombol "Gunakan lokasi saya" meminta izin lokasi hanya saat diklik, dan menampilkan pesan yang jelas jika izin ditolak.
- [ ] Hasil pencarian menampilkan chip kategori kesesuaian untuk pengguna yang login dan punya profil.

### #19 Membangun halaman detail aksesibilitas tempat

- [ ] Halaman sesuai layar 4 wireframe dan kontrak `GET /api/tempat/{id}`.
- [ ] Ketujuh fasilitas tampil memakai `BarisFasilitas` dengan penanda status dan tingkat kepercayaan sesuai dokumen ini.
- [ ] Setiap fasilitas dapat dibuka menuju halaman bukti untuk fasilitas tersebut.
- [ ] Pengunjung tanpa login melihat ajakan masuk di posisi kartu skor, dan pengguna tanpa profil melihat ajakan mengisi profil.
- [ ] Tempat yang belum diimpor diimpor otomatis saat halaman dibuka, dengan keadaan memuat yang jelas.

### #20 Membuat formulir laporan fasilitas beserta unggah foto

- [ ] Formulir sesuai layar 5 wireframe dan kontrak `POST /api/laporan`.
- [ ] Kolom nilai numerik hanya muncul untuk akses masuk dan lebar pintu, dengan satuan cm tertulis jelas.
- [ ] Unggah foto menerima maksimal 5 foto dan dapat membuka kamera belakang di ponsel.
- [ ] Setiap foto diperkecil di browser sebelum diunggah, sisi terpanjang maksimal 1600 px dalam format JPEG kualitas 0,8.
- [ ] Setiap foto menampilkan kemajuan unggah dan dapat dihapus sebelum laporan dikirim.
- [ ] Setelah dikirim, hasil deteksi AI tampil sesuai layar 5. Jika deteksi gagal, tampil keterangan bahwa laporan tetap tersimpan.

### #22 Membangun halaman riwayat kontribusi pengguna

- [ ] Halaman sesuai layar 6 wireframe dan kontrak `GET /api/saya/riwayat`.
- [ ] Status verifikasi setiap laporan tampil dengan label dan ikon, bukan warna saja.
- [ ] Riwayat lebih dari 10 item dapat dibuka per halaman.
- [ ] Ringkasan profil kebutuhan memiliki tautan ke halaman ubah profil.

### #31 Menampilkan rincian penilaian pada antarmuka

- [ ] `KartuSkorKesesuaian` menampilkan skor, label kategori, ikon, dan kalimat "`jumlahTerpenuhi` dari `jumlahKebutuhan` kebutuhan terpenuhi".
- [ ] Kategori `belum_cukup_data` tidak menampilkan angka skor.
- [ ] Rincian per kebutuhan menampilkan `syarat` dan `kondisiTempat` berdampingan, sehingga pengguna langsung melihat mengapa kebutuhan terpenuhi atau tidak.
- [ ] Kebutuhan dengan `kepercayaanRendah` diberi keterangan bahwa datanya diabaikan karena kurang dapat dipercaya.
- [ ] Jika `kelengkapan` kurang dari 1, tampil keterangan bahwa sebagian data belum tersedia beserta ajakan menambah laporan.

### #33 Melakukan audit aksesibilitas antarmuka

- [ ] Setiap halaman di tabel halaman diperiksa dengan axe DevTools tanpa pelanggaran berlevel serius atau kritis.
- [ ] Skor aksesibilitas Lighthouse setiap halaman minimal 95.
- [ ] Seluruh alur skenario demo MVP diselesaikan hanya dengan keyboard.
- [ ] Seluruh alur skenario demo MVP diselesaikan dengan NVDA di Windows dan TalkBack di Android.
- [ ] Setiap halaman tetap dapat dipakai tanpa konten terpotong pada zoom 200% dan lebar 320 px.
- [ ] Temuan dicatat dalam dokumen audit berisi halaman, masalah, kriteria WCAG yang dilanggar, dan tingkat keparahan, lalu setiap temuan dijadikan issue perbaikan di Sprint 3.
