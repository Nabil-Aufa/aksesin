# Panduan Penyiapan Azure

Dokumen ini dipakai untuk memeriksa langganan Azure yang tersedia bagi kelompok, lalu menyiapkan wadah resource proyek Aksesin. Hasil pemeriksaan menentukan pilihan layanan yang dipakai, sehingga dokumen arsitektur, skema basis data, dan kontrak API baru dapat disesuaikan setelah laporan di bagian akhir terisi.

Penanggung jawab: Nayla, sebagai cloud engineer. Perkiraan waktu 20 sampai 30 menit.

**Pada tahap ini jangan membuat layanan berbayar apa pun.** Tahap ini hanya memeriksa dan menyiapkan wadah. Pilihan layanan diputuskan bersama setelah hasil pemeriksaan diketahui.

## Istilah

| Istilah | Arti |
|---|---|
| Subscription | Wadah tempat seluruh layanan Azure berdiri, sekaligus dasar penagihan biaya |
| Resource group | Kelompok atau folder untuk layanan yang saling berkaitan |
| Resource | Layanannya sendiri, misalnya basis data, virtual machine, atau tempat penyimpanan berkas |
| IAM | Pengaturan siapa boleh melakukan apa pada suatu subscription atau resource group |
| Region | Lokasi fisik pusat data, misalnya East US atau Southeast Asia |

## A. Memeriksa subscription

1. Buka [portal.azure.com](https://portal.azure.com), masuk dengan akun Microsoft 365 UGM.
2. Pada kolom pencarian di bagian atas, ketik **Subscriptions**, lalu buka menunya.
3. Catat setiap subscription yang muncul beserta namanya dan statusnya.
4. Buka salah satu subscription, lalu pilih **Access control (IAM)** di menu kiri.
5. Buka tab **Check access**, klik **View my access**, lalu catat peran yang tertera:

| Peran | Kemampuan |
|---|---|
| Owner | Membuat, menghapus, dan mengundang anggota lain |
| Contributor | Membuat dan menghapus layanan, tetapi tidak dapat mengundang anggota |
| Reader | Hanya dapat melihat |

## B. Memeriksa tagihan dan kredit

1. Pada kolom pencarian, ketik **Cost Management + Billing**.
2. Buka **Cost analysis**, lalu catat biaya yang sudah berjalan pada bulan ini.
3. Jika tersedia menu **Credits** atau **Payment methods**, catat apakah kelompok memiliki kredit gratis, atau biaya ditagihkan ke departemen.

Informasi ini menentukan seberapa ketat pemilihan tier layanan nantinya.

## C. Memeriksa layanan yang diizinkan

Subscription untuk mahasiswa atau organisasi kadang membatasi jenis layanan dan region. Pemeriksaan berikut dilakukan tanpa membuat resource apa pun.

1. Klik **Create a resource** pada halaman depan portal.
2. Cari setiap layanan berikut, klik **Create**, lalu **cukup amati formulirnya** tanpa menekan tombol Create di akhir:
   - Container Apps
   - App Service, yaitu Web App
   - Azure Database for PostgreSQL flexible server
   - Storage account
   - Container Registry
   - Virtual machine
3. Untuk setiap layanan, catat:
   - Formulir dapat dibuka, atau muncul pemberitahuan bahwa layanan tidak diizinkan
   - Region yang tersedia, khususnya apakah Southeast Asia termasuk di dalamnya
   - Azure Database for PostgreSQL: apakah ukuran **Burstable B1ms** tersedia
   - App Service: apakah tier **Free F1** tersedia
   - Virtual machine: apakah ukuran **B1s** tersedia
4. Tutup formulir tanpa membuat resource.

## D. Membuat resource group proyek

Resource group tidak dikenai biaya karena hanya berupa wadah, sehingga aman dibuat pada tahap ini.

1. Pada kolom pencarian, ketik **Resource groups**, lalu klik **Create**.
2. Isi kolom berikut:
   - **Subscription**: subscription yang ditemukan pada bagian A
   - **Resource group**: `rg-aksesin`
   - **Region**: pilih Southeast Asia jika tersedia karena paling dekat dengan pengguna, jika tidak tersedia pilih East US sesuai modul praktikum
3. Buka tab **Tags**, lalu tambahkan:

| Name | Value |
|---|---|
| `proyek` | `aksesin` |
| `jangan-hapus` | `ya` |

4. Klik **Review + create**, lalu **Create**.

Resource group ini berbeda dari resource group yang dipakai pada praktikum. Modul praktikum mewajibkan penghapusan resource setiap selesai lab, sedangkan `rg-aksesin` tidak boleh dihapus karena berisi resource proyek.

## E. Memberi akses kepada anggota lain

Langkah ini hanya dapat dilakukan jika peran pada bagian A adalah **Owner**. Jika perannya Contributor, lewati bagian ini dan catat sebagai kendala.

1. Buka **Resource groups**, lalu pilih `rg-aksesin`.
2. Pilih **Access control (IAM)** di menu kiri.
3. Klik **Add**, lalu **Add role assignment**.
4. Pada tab **Role**, pilih **Contributor**, lalu klik Next.
5. Pada tab **Members**, klik **Select members**, cari alamat Microsoft 365 UGM milik Nabil dan Gilbert, lalu pilih keduanya.
6. Klik **Review + assign**.

Jika alamat mereka tidak ditemukan, akun mereka belum berada pada organisasi yang sama. Catat hal ini sebagai kendala.

## F. Laporan hasil

Salin daftar berikut, isi jawabannya, lalu bagikan ke anggota kelompok.

```
1. Nama subscription yang tersedia:
2. Peran saya pada subscription tersebut (Owner, Contributor, atau Reader):
3. Kredit gratis beserta jumlahnya, atau penagihan ke departemen:
4. Region yang tersedia, termasuk Southeast Asia atau tidak:
5. Layanan yang dapat dibuat:
   - Container Apps        : dapat / tidak
   - App Service           : dapat / tidak, tier Free F1 tersedia?
   - PostgreSQL flexible   : dapat / tidak, Burstable B1ms tersedia?
   - Storage account       : dapat / tidak
   - Container Registry    : dapat / tidak
   - Virtual machine       : dapat / tidak, ukuran B1s tersedia?
6. Resource group rg-aksesin sudah dibuat, pada region apa:
7. Nabil dan Gilbert sudah diberi akses, berhasil atau tidak:
8. Kendala lain:
```

## Larangan

- Jangan membuat layanan berbayar sebelum pilihan layanan disepakati bersama.
- Jangan memilih tier selain yang paling murah atau gratis.
- Jangan menghapus `rg-aksesin` ketika membersihkan resource praktikum.
- Jangan menyimpan kata sandi, connection string, atau kunci akses ke dalam repositori. Nilai rahasia dibagikan lewat jalur pribadi dan diisi langsung pada pengaturan layanan.

## Tindak lanjut

Setelah laporan pada bagian F terisi, kelompok menentukan kombinasi layanan berdasarkan dua kemungkinan berikut.

| Kondisi | Arah penyiapan |
|---|---|
| Layanan terkelola tersedia | Aplikasi web dan layanan AI memakai Container Apps atau App Service, basis data memakai Azure Database for PostgreSQL, foto memakai Storage account |
| Layanan terkelola dibatasi | Seluruh komponen dijalankan pada satu virtual machine memakai kontainer, mengikuti pola Modul 4 |

Setelah arah penyiapan ditentukan, [Arsitektur Sistem](01-arsitektur.md), [Skema Basis Data](03-skema-basis-data.md), dan [Kontrak API](04-kontrak-api.md) diperbarui, dan isi issue #11, #12, #13, serta #15 disesuaikan.
