# Panduan untuk asisten AI

Berlaku untuk semua asisten AI dan alat bantu kode yang bekerja di repositori ini.

## Tentang proyek

Aksesin membantu penyandang disabilitas menemukan tempat yang sesuai dengan kebutuhan aksesibilitasnya. Skor kesesuaian dihitung dari profil kebutuhan pengguna dan laporan fasilitas yang diverifikasi, dibantu deteksi AI pada foto.

- `web/`: aplikasi Next.js, Tailwind CSS 4, dan Supabase. Pakai `npm`, dijalankan dari dalam `web/`.
- `ai-service/`: layanan deteksi fasilitas berbasis Python.
- `docs/plans/`: rencana, kontrak API, dan aturan kerja. Baca dokumen yang relevan sebelum mengubah perilaku.

## Sumber kebenaran desain

1. `docs/desain/aksesin-ui.pen`: rancangan hi-fi di pen.dev.
2. `docs/desain/ekspor/`: ekspor gambar setiap frame. `00-daftar-halaman.png` memetakan setiap route ke frame desktop, HP, dan keadaannya.
3. `docs/plans/07-panduan-antarmuka.md`: token, aturan aksesibilitas, dan kriteria penerimaan. Jika rancangan bertentangan dengan dokumen ini, dokumen ini yang berlaku.

Sebelum membangun halaman, buka frame yang sesuai di `docs/desain/ekspor/` dan ikuti tata letaknya.

## Aturan antarmuka wajib

- Pakai hanya token dari `web/src/app/globals.css` (warna, ukuran teks, radius, font). Palet bawaan Tailwind sengaja dikosongkan.
- Pakai komponen dari `web/src/components/ui/` (`Tombol`, `KolomIsian`, `Chip`, `AppBar`, `GambarTempat`). Jangan membuat tombol, kolom isian, atau chip baru. Jika butuh varian, tambahkan ke komponen yang ada.
- Jangan pernah menulis warna hex, `rgb()`, `hsl()`, atau kelas warna arbitrer seperti `bg-[#...]`. CI menjalankan `npm run cek:warna` dan akan gagal.
- `sinyal` hanya untuk latar dan fokus, tidak pernah untuk warna teks.
- Status selalu ikon dan teks, tidak pernah warna saja.
- Setiap kolom punya `<label>` yang terlihat. Placeholder bukan label.
- Target sentuh minimal 44 x 44 px.
- Cincin fokus diatur global. Jangan menghapus atau menimpa `outline`.
- Setiap halaman punya tepat satu `<h1>`, heading tidak melompat tingkat, dan `<html lang="id">`.
- Setiap halaman yang memuat data punya keadaan memuat, kosong, dan galat yang dirancang.
- Ukuran dan angka terukur memakai `font-angka`.

## Konvensi kerja

Mengikuti `docs/plans/02-konvensi-kerja.md`:

- Pesan commit bahasa Indonesia, diawali `Menambahkan`, `Memperbaiki`, `Mengubah`, `Menghapus`, atau `Memindahkan`, maksimal 72 karakter, tanpa titik.
- Pesan commit hanya berisi deskripsi perubahan, tanpa baris trailer apa pun, termasuk `Co-Authored-By`.
- Author commit adalah identitas Git anggota yang mengerjakan. Jangan mengubah `git config`.
- Satu pull request untuk satu issue, dari branch NIU ke `main`. Jangan push langsung ke `main`, jangan force-push.
- Komentar kode hanya untuk hal yang tidak terbaca dari kode.
- Jangan menambah dependensi tanpa menyebutkannya di deskripsi pull request.

## Sebelum membuka pull request

Jalankan dari `web/`:

```
npm run cek:warna
npm run lint
npm test
npm run build
```
