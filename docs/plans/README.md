# Dokumen Perencanaan Aksesin

Folder ini berisi seluruh rencana teknis pengembangan Aksesin. Setiap anggota wajib membaca dokumen yang relevan sebelum mengambil issue, supaya keputusan desain yang sudah disepakati tidak perlu dibahas ulang dan hasil kerja antaranggota tetap cocok satu sama lain.

Folder ini sengaja dikecualikan dari GitHub Page, sehingga hanya terbaca lewat repositori.

## Daftar dokumen

| No | Dokumen | Isi |
|---|---|---|
| 1 | [Arsitektur Sistem](01-arsitektur.md) | Komponen sistem, alur data, struktur folder, variabel lingkungan, deployment |
| 2 | [Konvensi Kerja](02-konvensi-kerja.md) | Alur Git, penamaan branch, format commit, pull request, definisi selesai, gaya kode |
| 3 | [Skema Basis Data](03-skema-basis-data.md) | Tabel, tipe data, relasi, hak akses baris, penyimpanan foto |
| 4 | [Kontrak API](04-kontrak-api.md) | Endpoint aplikasi web dan layanan deteksi AI beserta format permintaan dan respons |
| 5 | [Algoritma Penilaian](05-algoritma-penilaian.md) | Rumus skor kesesuaian dan Accessibility Confidence beserta kasus uji |
| 6 | [Rencana Sprint](06-rencana-sprint.md) | Jadwal, pembagian issue per sprint, prioritas, dependensi |
| 7 | [Panduan Antarmuka](07-panduan-antarmuka.md) | Warna, tipografi, komponen, standar aksesibilitas antarmuka |
| 8 | [Pipeline AI](08-pipeline-ai.md) | Dataset, anotasi, pelatihan, evaluasi, perbandingan dengan vision API |
| - | [Proposal Aksesin](Aksesin_proposal_edited.md) | Latar belakang, fitur, analisis kompetitor |

## Urutan baca per peran

Semua anggota membaca dokumen 1, 2, dan 6 terlebih dahulu. Setelah itu:

| Anggota | Peran | Dokumen utama |
|---|---|---|
| Nabil Aufa Danaputra | Project manager, AI engineer | 4 (bagian layanan AI), 8 |
| Nayla Thalita | UI/UX, cloud engineer | 3, 7, lalu 4 untuk halaman yang memanggil API |
| Gilbert S. H. Nainggolan | Software engineer | 3, 4, 5 |

## Cara memakai dokumen saat mengerjakan issue

1. Buka issue di papan proyek, lihat nomornya.
2. Cari nomor issue tersebut di [Rencana Sprint](06-rencana-sprint.md) untuk mengetahui sprint, prioritas, dan dependensinya.
3. Buka dokumen modul yang ditunjuk. Setiap issue memiliki bagian kriteria penerimaan.
4. Issue dianggap selesai hanya jika seluruh kriteria penerimaan terpenuhi dan definisi selesai di [Konvensi Kerja](02-konvensi-kerja.md) terpenuhi.

## Catatan keputusan

Keputusan berikut sudah disepakati. Perubahan terhadap salah satunya harus dibahas bersama dan dicatat di tabel ini.

| Tanggal | Keputusan | Alasan |
|---|---|---|
| 10 Sep 2026 | Metodologi Agile dengan sprint dua mingguan | Spesifikasi fitur AI bergantung hasil eksperimen |
| 10 Sep 2026 | Stack Next.js, Supabase, FastAPI | Autentikasi dan penyimpanan tidak perlu dibangun dari nol, backend yang dibangun sendiri difokuskan pada layanan AI |
| 10 Sep 2026 | Strategi AI hybrid: model sendiri dan vision API | Model sendiri menjadi nilai tambah, vision API menjadi cadangan dan pembanding |
| 17 Sep 2026 | Vision API dipasang lebih dahulu, model sendiri menyusul setelah UTS | MVP utuh dapat didemokan sebelum UTS tanpa menunggu pelatihan model |
| 17 Sep 2026 | Pengerjaan di branch NIU masing-masing, satu pull request per issue dengan satu review, merge commit | Kontribusi tiap anggota terkumpul di branch miliknya, dan merge commit mempertahankan riwayat commit setiap anggota |
| 17 Sep 2026 | Skor kesesuaian memakai syarat wajib dan bobot | Tempat yang tidak dapat dimasuki tidak boleh mendapat skor tinggi |
| 17 Sep 2026 | Target pengembangan selesai 15 November 2026 | Menyisakan jeda sekitar tiga minggu sebelum UAS Desember |
| 17 Sep 2026 | Komentar kode hanya untuk hal yang tidak dapat dijelaskan lewat nama | Kode harus terbaca dari penamaan |
