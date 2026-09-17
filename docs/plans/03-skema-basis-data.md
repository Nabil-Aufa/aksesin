# Skema Basis Data

Dokumen ini adalah acuan implementasi skema di Supabase. Skema diturunkan dari [ERD Lab 2.4](../assets/erd.png) dengan beberapa penyesuaian yang dijelaskan di bagian perbedaan.

Issue terkait: #11 (Nayla, direview Gilbert), #15 (Gilbert), #30 (Gilbert).

## Perbedaan dari ERD

Penyesuaian berikut diperlukan saat ERD diterjemahkan ke Supabase. Semuanya sudah disepakati dan menjadi acuan resmi.

| Tabel | Perubahan | Alasan |
|---|---|---|
| `users` | Kolom `password_hash` dihapus. `user_id` sama dengan `auth.users.id` | Kata sandi dikelola Supabase Auth dan tidak boleh disalin ke tabel lain |
| `accessibility_profiles` | Ditambah `butuh_jalur_bebas_tangga` | Wireframe profil memiliki pilihan jalur bebas tangga yang belum ada di ERD |
| `places` | Ditambah `lokasi` bertipe `geography` yang dihitung otomatis dari koordinat | Pencarian tempat terdekat (FR 27) membutuhkan indeks geospasial |
| `feature_types` | Ditambah `satuan`. Isi awal tujuh jenis fasilitas | Fasilitas di FR 6 dan wireframe detail tempat digabung. Istilah "tangga" diubah menjadi `jalur_bebas_tangga` supaya status `tersedia` selalu bermakna baik |
| `photos` | Ditambah `status_deteksi` | Membedakan foto yang belum dideteksi dari foto yang sudah dideteksi tetapi tidak berisi objek |
| `compatibility_assessments` | Ditambah `kategori`, `skor` boleh kosong, satu baris per pasangan pengguna dan tempat | Tabel berfungsi sebagai cache. Skor kosong untuk kategori Belum Cukup Data |

## Jenis enumerasi

```sql
create extension if not exists postgis;
create extension if not exists pg_trgm;

create type peran_pengguna as enum ('pengguna', 'moderator');
create type jenis_alat_bantu as enum ('kursi_roda_manual', 'kursi_roda_elektrik', 'kruk_alat_bantu_jalan', 'tanpa_alat_bantu');
create type status_fasilitas as enum ('tersedia', 'terbatas', 'tidak_tersedia', 'tidak_diketahui');
create type sumber_data as enum ('osm', 'laporan_pengguna', 'moderator');
create type status_moderasi as enum ('aktif', 'perlu_tinjau', 'disetujui', 'ditolak');
create type status_deteksi as enum ('menunggu', 'selesai', 'gagal');
create type jenis_verifikasi as enum ('setuju', 'sanggah');
create type status_tanda as enum ('terbuka', 'ditindaklanjuti', 'diabaikan');
```

Arti `status_moderasi`:

| Nilai | Arti | Tampil ke publik | Dipakai dalam perhitungan |
|---|---|---|---|
| `aktif` | Laporan baru tanpa masalah | Ya | Ya |
| `perlu_tinjau` | Hasil deteksi AI bertentangan atau laporan ditandai pengguna | Ya, dengan label "Sedang ditinjau" | Ya |
| `disetujui` | Moderator memeriksa dan menyatakan benar | Ya | Ya |
| `ditolak` | Moderator menyatakan salah | Tidak | Tidak |

## Tabel

### users

```sql
create table users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  nama text not null,
  peran peran_pengguna not null default 'pengguna',
  tanggal_daftar timestamptz not null default now()
);
```

### accessibility_profiles

```sql
create table accessibility_profiles (
  profil_id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users (user_id) on delete cascade,
  jenis_alat_bantu jenis_alat_bantu not null,
  tinggi_undakan_maks_cm numeric(5,1) not null check (tinggi_undakan_maks_cm >= 0),
  lebar_pintu_min_cm numeric(5,1) not null check (lebar_pintu_min_cm > 0),
  butuh_ramp boolean not null default false,
  butuh_jalur_bebas_tangga boolean not null default false,
  butuh_toilet_aksesibel boolean not null default false,
  butuh_lift boolean not null default false,
  butuh_parkir_aksesibel boolean not null default false,
  terakhir_diperbarui timestamptz not null default now()
);
```

### places

```sql
create table places (
  place_id uuid primary key default gen_random_uuid(),
  sumber_eksternal_id text unique,
  nama text not null,
  kategori text,
  alamat text,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  lokasi geography(point, 4326) generated always as
    (st_setsrid(st_makepoint(longitude, latitude), 4326)::geography) stored,
  dibuat_pada timestamptz not null default now()
);

create index places_lokasi_idx on places using gist (lokasi);
create index places_nama_trgm_idx on places using gin (nama gin_trgm_ops);
```

Format `sumber_eksternal_id` untuk tempat dari OpenStreetMap adalah `osm:<tipe>/<id>`, contoh `osm:node/123456789`.

### feature_types

```sql
create table feature_types (
  feature_type_id smallint primary key generated always as identity,
  kode text not null unique,
  nama text not null,
  kategori text not null,
  satuan text
);

insert into feature_types (kode, nama, kategori, satuan) values
  ('akses_masuk', 'Akses masuk tanpa undakan', 'akses', 'cm'),
  ('lebar_pintu', 'Lebar pintu', 'akses', 'cm'),
  ('ramp', 'Ramp atau jalur landai', 'akses', null),
  ('jalur_bebas_tangga', 'Jalur bebas tangga', 'akses', null),
  ('toilet_aksesibel', 'Toilet aksesibel', 'fasilitas', null),
  ('lift', 'Lift', 'fasilitas', null),
  ('parkir_aksesibel', 'Area parkir aksesibel', 'fasilitas', null);
```

Arti `nilai_numerik` per jenis fasilitas:

| Kode | Arti `nilai_numerik` |
|---|---|
| `akses_masuk` | Tinggi undakan tertinggi di jalur masuk, dalam cm. Nilai 0 berarti rata |
| `lebar_pintu` | Lebar bersih pintu masuk tersempit, dalam cm |
| Lainnya | Tidak dipakai, selalu `null` |

### place_features

Status agregat terkini setiap fasilitas di suatu tempat. Tabel ini **tidak pernah diisi langsung dari aplikasi**, selalu dihitung ulang oleh fungsi `sinkronkan_place_feature`, kecuali saat impor awal dari OpenStreetMap.

```sql
create table place_features (
  place_feature_id uuid primary key default gen_random_uuid(),
  place_id uuid not null references places (place_id) on delete cascade,
  feature_type_id smallint not null references feature_types (feature_type_id),
  status status_fasilitas not null default 'tidak_diketahui',
  nilai_numerik numeric(6,1),
  sumber_data sumber_data not null,
  nilai_confidence numeric(3,2) not null default 0 check (nilai_confidence between 0 and 1),
  terakhir_diverifikasi timestamptz not null default now(),
  unique (place_id, feature_type_id)
);
```

### reports

```sql
create table reports (
  report_id uuid primary key default gen_random_uuid(),
  place_id uuid not null references places (place_id) on delete cascade,
  user_id uuid not null references users (user_id) on delete cascade,
  feature_type_id smallint not null references feature_types (feature_type_id),
  status_dilaporkan status_fasilitas not null check (status_dilaporkan <> 'tidak_diketahui'),
  nilai_numerik numeric(6,1),
  catatan text check (char_length(catatan) <= 500),
  status_moderasi status_moderasi not null default 'aktif',
  dibuat_pada timestamptz not null default now()
);

create index reports_tempat_fitur_idx on reports (place_id, feature_type_id);
create index reports_pengguna_idx on reports (user_id, dibuat_pada desc);
```

### photos

```sql
create table photos (
  photo_id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports (report_id) on delete cascade,
  url_penyimpanan text not null unique,
  nama_berkas text not null,
  ukuran_byte integer not null check (ukuran_byte between 1 and 5242880),
  status_deteksi status_deteksi not null default 'menunggu',
  diunggah_pada timestamptz not null default now()
);
```

`url_penyimpanan` berisi path di bucket, contoh `3f2a.../9c1b....jpg`, bukan URL lengkap. URL publik dibentuk di aplikasi supaya tidak rusak jika domain Supabase berubah.

### ai_detections

```sql
create table ai_detections (
  detection_id uuid primary key default gen_random_uuid(),
  photo_id uuid not null references photos (photo_id) on delete cascade,
  label_kelas text not null check (label_kelas in ('ramp', 'tangga', 'pintu', 'toilet_aksesibel')),
  nilai_keyakinan numeric(4,3) not null check (nilai_keyakinan between 0 and 1),
  bbox_x real not null check (bbox_x between 0 and 1),
  bbox_y real not null check (bbox_y between 0 and 1),
  bbox_w real not null check (bbox_w > 0 and bbox_w <= 1),
  bbox_h real not null check (bbox_h > 0 and bbox_h <= 1),
  versi_model text not null,
  diproses_pada timestamptz not null default now()
);

create index ai_detections_foto_idx on ai_detections (photo_id);
```

Koordinat kotak pembatas dinormalisasi ke rentang 0 sampai 1 terhadap lebar dan tinggi foto, dengan titik (0, 0) di pojok kiri atas.

### verifications

```sql
create table verifications (
  verification_id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports (report_id) on delete cascade,
  user_id uuid not null references users (user_id) on delete cascade,
  jenis_verifikasi jenis_verifikasi not null,
  dibuat_pada timestamptz not null default now(),
  unique (report_id, user_id)
);
```

### flags

```sql
create table flags (
  flag_id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports (report_id) on delete cascade,
  user_id uuid not null references users (user_id) on delete cascade,
  alasan text not null check (char_length(alasan) between 5 and 500),
  status status_tanda not null default 'terbuka',
  dibuat_pada timestamptz not null default now(),
  unique (report_id, user_id)
);
```

### compatibility_assessments

```sql
create table compatibility_assessments (
  assessment_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (user_id) on delete cascade,
  place_id uuid not null references places (place_id) on delete cascade,
  skor smallint check (skor between 0 and 100),
  kategori text not null,
  rincian_penilaian jsonb not null,
  dihitung_pada timestamptz not null default now(),
  unique (user_id, place_id)
);
```

Struktur `rincian_penilaian` mengikuti tipe `HasilPenilaian` di [Algoritma Penilaian](05-algoritma-penilaian.md).

## Fungsi dan trigger

### Pengguna baru

Setiap akun baru di Supabase Auth otomatis dibuatkan baris di `users`.

```sql
create function buat_pengguna_baru() returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into users (user_id, email, nama)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'nama', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger saat_pengguna_mendaftar
after insert on auth.users
for each row execute function buat_pengguna_baru();
```

### Pemeriksaan peran moderator

```sql
create function adalah_moderator() returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from users where user_id = auth.uid() and peran = 'moderator');
$$;
```

### Sinkronisasi status fasilitas

Fungsi `sinkronkan_place_feature(p_place_id uuid, p_feature_type_id smallint)` menghitung ulang satu baris `place_features`. Langkah perhitungannya dijelaskan di [Algoritma Penilaian](05-algoritma-penilaian.md#accessibility-confidence), bagian agregasi.

Fungsi dipanggil oleh trigger berikut:

| Trigger pada tabel | Peristiwa | Menghitung ulang |
|---|---|---|
| `reports` | insert, update `status_moderasi` | Fasilitas yang dilaporkan |
| `verifications` | insert, delete | Fasilitas dari laporan yang diverifikasi |
| `photos` | insert | Fasilitas dari laporan pemilik foto |
| `ai_detections` | insert | Fasilitas dari laporan pemilik foto |

Setelah sinkronisasi, fungsi yang sama memeriksa kecocokan deteksi AI dan mengubah `status_moderasi` laporan menjadi `perlu_tinjau` jika perlu. Aturannya ada di dokumen algoritma.

### Confidence efektif

Confidence yang tersimpan belum memperhitungkan umur data. Penurunan karena umur dihitung saat dibaca lewat view berikut, sehingga tidak butuh tugas terjadwal.

```sql
create view v_place_features with (security_invoker = true) as
select
  pf.*,
  round((pf.nilai_confidence * case
    when now() - pf.terakhir_diverifikasi <= interval '180 days' then 1
    else greatest(0.5, 1 - (extract(epoch from now() - pf.terakhir_diverifikasi) / 86400 - 180) / 365)
  end)::numeric, 2) as confidence_efektif
from place_features pf;
```

Aplikasi selalu membaca `v_place_features`, bukan `place_features`.

## Hak akses baris

Semua tabel mengaktifkan row level security. Server aplikasi web yang memakai `SUPABASE_SERVICE_ROLE_KEY` melewati aturan ini, jadi kunci tersebut hanya dipakai untuk operasi yang memang tidak boleh dilakukan pengguna langsung.

| Tabel | Baca | Tambah | Ubah | Hapus |
|---|---|---|---|---|
| `users` | Semua pengguna login | Trigger saja | Diri sendiri, kecuali kolom `peran` | Tidak ada |
| `accessibility_profiles` | Diri sendiri | Diri sendiri | Diri sendiri | Diri sendiri |
| `places` | Publik | Server | Moderator | Tidak ada |
| `feature_types` | Publik | Tidak ada | Tidak ada | Tidak ada |
| `place_features` | Publik | Server dan trigger | Trigger dan moderator | Tidak ada |
| `reports` | Publik, kecuali `ditolak`. Moderator melihat semua | Pengguna login untuk dirinya | Moderator, kolom `status_moderasi` saja | Tidak ada |
| `photos` | Publik jika laporannya terlihat | Pemilik laporan | Server | Tidak ada |
| `ai_detections` | Publik jika fotonya terlihat | Server | Tidak ada | Tidak ada |
| `verifications` | Publik | Pengguna login, bukan pemilik laporan, sekali per laporan | Tidak ada | Diri sendiri |
| `flags` | Pembuatnya dan moderator | Pengguna login | Moderator | Tidak ada |
| `compatibility_assessments` | Diri sendiri | Server | Server | Diri sendiri |

Contoh kebijakan untuk dua tabel yang aturannya paling rawan salah:

```sql
alter table verifications enable row level security;

create policy verifikasi_baca_publik on verifications
for select using (true);

create policy verifikasi_tambah_bukan_pemilik on verifications
for insert to authenticated
with check (
  user_id = auth.uid()
  and not exists (
    select 1 from reports r
    where r.report_id = verifications.report_id and r.user_id = auth.uid()
  )
);

create policy verifikasi_hapus_milik_sendiri on verifications
for delete to authenticated using (user_id = auth.uid());

alter table reports enable row level security;

create policy laporan_baca on reports
for select using (status_moderasi <> 'ditolak' or adalah_moderator());

create policy laporan_tambah on reports
for insert to authenticated with check (user_id = auth.uid());

create policy laporan_moderasi on reports
for update to authenticated using (adalah_moderator()) with check (adalah_moderator());
```

Pembatasan "hanya kolom `status_moderasi`" untuk moderator dan "kecuali kolom `peran`" untuk pengguna tidak bisa diatur lewat kebijakan baris. Keduanya diatur dengan `revoke update` pada tabel lalu `grant update (kolom)` untuk kolom yang diizinkan.

## Penyimpanan foto

| Pengaturan | Nilai |
|---|---|
| Nama bucket | `foto-laporan` |
| Publik | Ya |
| Ukuran maksimum | 5 MB |
| Format diizinkan | `image/jpeg`, `image/png`, `image/webp` |
| Path | `{user_id}/{uuid}.{ext}` |

Kebijakan unggah:

```sql
create policy foto_unggah_folder_sendiri on storage.objects
for insert to authenticated
with check (
  bucket_id = 'foto-laporan'
  and (storage.foldername(name))[1] = auth.uid()::text
);
```

## Kriteria penerimaan

### #11 Membuat proyek Supabase dan menerapkan skema basis data

- [ ] Proyek Supabase dibuat di region Singapura, ketiga anggota punya akses ke dashboard.
- [ ] Seluruh enumerasi, tabel, indeks, dan view di dokumen ini tersimpan sebagai file di `supabase/migrations/`.
- [ ] Menjalankan seluruh migrasi dari basis data kosong berhasil tanpa galat.
- [ ] `feature_types` berisi tepat tujuh baris sesuai isi awal.
- [ ] Mendaftar akun baru lewat Supabase Auth otomatis membuat baris di `users`.
- [ ] Bucket `foto-laporan` menolak file berukuran 6 MB dan file berformat `image/gif`.
- [ ] `.env.example` di `web/` berisi seluruh variabel Supabase tanpa nilai.

### #15 Menerapkan pembedaan hak akses antar peran

- [ ] Row level security aktif di semua tabel pada skema `public`.
- [ ] Pengguna tanpa login dapat membaca `places`, `v_place_features`, dan laporan yang tidak ditolak, tetapi gagal menambah laporan.
- [ ] Pengguna A tidak dapat membaca atau mengubah profil kebutuhan pengguna B.
- [ ] Pengguna gagal memverifikasi laporan miliknya sendiri, dan gagal memverifikasi laporan yang sama dua kali.
- [ ] Pengguna biasa gagal mengubah `status_moderasi` dan gagal mengubah kolom `peran` miliknya sendiri.
- [ ] Moderator berhasil mengubah `status_moderasi` dan dapat melihat laporan berstatus `ditolak`.
- [ ] Pengguna gagal mengunggah foto ke folder milik pengguna lain.
- [ ] Setiap poin di atas dibuktikan dengan pengujian yang dapat dijalankan ulang, bukan pengecekan manual lewat dashboard.

### #30 Mengimplementasikan perhitungan Accessibility Confidence

Kriteria penerimaan ada di [Algoritma Penilaian](05-algoritma-penilaian.md#kriteria-penerimaan).
