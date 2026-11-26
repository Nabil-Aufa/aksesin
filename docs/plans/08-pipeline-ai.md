# Pipeline AI

Dokumen ini menjelaskan komponen AI Aksesin dari pengumpulan foto sampai model berjalan di produksi. Strateginya hybrid: detektor berbasis vision API dipasang lebih dahulu supaya MVP utuh sebelum UTS, lalu model YOLO hasil pelatihan sendiri menyusul di Sprint 2 dan dibandingkan secara terukur.

Issue terkait: #39, #40, #24, #25, #26, #28 (Nabil), #27 (Gilbert dan Nabil).

## Kelas deteksi

Model mendeteksi empat kelas. Nama kelas sama persis dengan nilai `label_kelas` di basis data.

| Kelas | Dipakai untuk memeriksa fitur |
|---|---|
| `ramp` | `ramp` |
| `tangga` | `jalur_bebas_tangga` |
| `pintu` | `akses_masuk`, `lebar_pintu` |
| `toilet_aksesibel` | `toilet_aksesibel` |

Cara hasil deteksi memengaruhi laporan dijelaskan di [Algoritma Penilaian](05-algoritma-penilaian.md#kecocokan-hasil-deteksi-ai).

## Pedoman anotasi

Pedoman ini wajib diikuti semua orang yang menganotasi. Label yang tidak konsisten antarpenganotasi merusak model lebih parah daripada jumlah data yang sedikit.

| Kelas | Diberi label | Tidak diberi label | Batas kotak |
|---|---|---|---|
| `ramp` | Permukaan landai untuk pejalan kaki dan kursi roda yang menghubungkan dua ketinggian, termasuk ramp portabel dan landaian trotoar | Jalur miring khusus kendaraan, tangga berjalan, permukaan landai alami tanpa perkerasan | Seluruh permukaan landai yang terlihat, termasuk pegangan tangan jika menempel |
| `tangga` | Satu atau lebih anak tangga, termasuk undakan tunggal yang terlihat jelas dan tangga berjalan | Tepi trotoar tanpa perbedaan tinggi, pola lantai yang menyerupai garis anak tangga | Seluruh rangkaian anak tangga yang terlihat dalam satu kotak |
| `pintu` | Pintu masuk bangunan atau ruangan, dalam keadaan terbuka maupun tertutup | Jendela, pintu lemari, pintu kendaraan, gerbang pagar | Kusen pintu bagian luar |
| `toilet_aksesibel` | Kloset yang memiliki pegangan tangan di sampingnya, atau pintu toilet dengan simbol kursi roda | Kloset biasa tanpa pegangan | Kloset beserta pegangannya, atau simbol beserta pintunya |

Aturan tambahan:

- Objek yang terpotong tepi foto tetap diberi label jika lebih dari separuhnya terlihat.
- Objek yang tertutup benda lain lebih dari separuhnya tidak diberi label.
- Satu foto boleh berisi banyak kotak dari kelas yang sama.
- Sekitar 10% dataset berupa foto tanpa objek apa pun, misalnya lorong atau halaman kosong, supaya model belajar tidak mendeteksi secara berlebihan.
- Jika ragu, jangan diberi label, lalu catat nama filenya untuk dibahas.

## Dataset

### Sumber

Sejak 10 Oktober 2026, dataset disusun dari tiga dataset publik berlisensi terbuka, tidak lagi dari foto yang diambil sendiri. Pengumpulan dan pelabelan foto sendiri terlalu lama untuk jadwal proyek, sedangkan dataset publik berikut sudah berlabel dan lisensinya mengizinkan pemakaian ulang dengan atribusi.

| Dataset | Isi yang dipakai | Lisensi | Kelas |
|---|---|---|---|
| [Image Dataset of Accessibility Barriers](https://zenodo.org/records/6382090) (Zenodo) | Foto pintu masuk bangunan dari Wheelmap beserta kotak ramp, tangga, dan undakan yang dilabeli manusia | CC BY 4.0 | `ramp`, `tangga` |
| [Open Images V7](https://storage.googleapis.com/openimages/web/index.html) | Bagian validasi dan uji yang memuat kelas Door, Stairs, dan Toilet | Label CC BY 4.0, foto CC BY 2.0 | `pintu`, `tangga` |
| [Wikimedia Commons](https://commons.wikimedia.org/wiki/Category:Accessible_toilets), kategori Accessible toilets | Foto toilet yang diperiksa satu per satu oleh tim | CC BY, CC BY-SA, CC0, sesuai tiap foto | `toilet_aksesibel` |

Foto sendiri tetap boleh ditambahkan kemudian. Jika itu dilakukan, wajah dan plat nomor wajib dikaburkan, foto toilet hanya diambil saat kosong, dan tempat yang bukan area publik memerlukan izin pengelola.

### Komposisi

Total 1.536 foto: 754 dari Zenodo, 630 dari Open Images, dan 152 dari Wikimedia Commons.

| Kelas | Foto berisi objek | Foto tanpa objek | Kotak pembatas |
|---|---|---|---|
| `ramp` | 129 | 625 | 143 |
| `tangga` | 781 | 600 | 1.150 |
| `pintu` | 329 | 240 | 444 |
| `toilet_aksesibel` | 60 | 1.386 | 0 |

### Pelabelan

Setiap foto memiliki label tingkat foto untuk keempat kelas dengan nilai `1` (ada), `0` (tidak ada), atau `null` (tidak diketahui karena sumbernya tidak melabeli kelas tersebut). Foto dengan label `null` tidak dipakai untuk melatih maupun mengevaluasi kelas itu.

| Sumber | Aturan pemetaan label |
|---|---|
| Zenodo | `ramp` dari label ramp. `tangga` dari label stair dan step setinggi 3 cm atau lebih. Foto yang hanya berisi step di bawah 3 cm diberi `null` untuk `tangga`, karena undakan serendah itu tidak termasuk definisi tangga di pedoman anotasi. `pintu` selalu `null` karena pintu tidak dilabeli. `toilet_aksesibel` selalu `0` karena seluruh fotonya bagian luar bangunan |
| Open Images | `pintu` dari kelas Door, kecuali kotak yang lebih dari separuhnya berada di dalam kotak kendaraan atau lemari, karena pedoman anotasi tidak menganggap pintu kendaraan dan lemari sebagai pintu. `tangga` dari kelas Stairs. Foto yang memuat kelas Toilet diberi `null` untuk `toilet_aksesibel`, karena labelnya tidak membedakan kloset biasa dan kloset berpegangan |
| Wikimedia Commons | `toilet_aksesibel` diperiksa visual satu per satu terhadap pedoman anotasi. Foto yang meragukan, seperti gambar ilustrasi, papan petunjuk tanpa pintu, atau kloset yang pegangannya tidak terlihat, tidak dipakai |

Kotak pembatas berasal dari label sumber dan dipakai untuk melatih penilaian per bagian foto. Kelas `toilet_aksesibel` tidak memiliki kotak.

### Pembagian data

Dataset dibagi ke lima lipatan untuk validasi silang, dicatat di field `lipatan`. Foto yang hampir identik, yaitu yang nilai *difference hash*-nya berbeda paling banyak 6 bit, selalu ditempatkan di lipatan yang sama. Dengan begitu, foto yang sama dengan sudut sedikit berbeda tidak muncul sekaligus di data latih dan data uji.

Pembagian per lokasi seperti rencana awal tidak bisa dilakukan, karena dataset publik tidak menyertakan identitas lokasi. Hal ini dicatat sebagai keterbatasan.

### Penyimpanan

- `ai-service/dataset/anotasi.jsonl` menyimpan satu baris per foto: nama berkas, sumber, identitas foto di sumber, label tingkat foto, kotak pembatas ternormalisasi, lipatan, tautan asli, lisensi, dan pembuat.
- Foto tidak disimpan di repositori. Foto diunduh ulang dari sumber aslinya ke folder di luar repositori:

```bash
cd ai-service
pip install -r dataset/requirements.txt
python dataset/unduh.py ../../aksesin-dataset/dataset-2026-10-10
```

- Setiap versi anotasi diberi nama tanggal di nama folder unduhan, contoh `dataset-2026-10-10`, dan versi lama tidak pernah ditimpa.

### Keterbatasan

- Sebagian besar foto berasal dari Eropa, sehingga bentuk ramp, pintu, dan toilet bisa berbeda dari kondisi di Indonesia.
- Contoh ramp hanya 129 foto dan banyak di antaranya memperlihatkan ramp kecil di kejauhan, sehingga kelas ini paling sulit dikenali.
- Contoh toilet aksesibel hanya 60 foto.
- Beberapa foto Zenodo bisa berasal dari tempat yang sama dengan sudut yang berbeda jauh, sehingga tidak terdeteksi sebagai foto yang hampir identik.

## Pelatihan

| Aspek | Pilihan | Alasan |
|---|---|---|
| Arsitektur | YOLO varian nano dari Ultralytics, bobot awal pralatih COCO | Cukup ringan untuk inferensi CPU di hosting murah |
| Ukuran gambar | 640 px | Bawaan dan seimbang antara akurasi dan kecepatan |
| Epoch | Maksimal 150 dengan penghentian dini kesabaran 30 | Mencegah overfitting pada dataset kecil |
| Augmentasi | Bawaan Ultralytics | Flip horizontal aman karena keempat kelas simetris secara makna |
| Lingkungan | GPU gratis Google Colab atau Kaggle | Tidak butuh perangkat khusus |

Catatan lisensi: pustaka Ultralytics berlisensi AGPL-3.0. Pemakaian untuk proyek akademik yang kodenya terbuka di GitHub sesuai dengan lisensi tersebut.

Penamaan versi model: `yolo11n-aksesin-v<nomor>`, contoh `yolo11n-aksesin-v1`. Nilai ini dikirim di field `versiModel` dan tersimpan di `ai_detections.versi_model`, sehingga setiap hasil deteksi dapat ditelusuri ke model yang menghasilkannya.

Bobot model tidak disimpan di repositori. Unggah sebagai aset GitHub Release dengan tag yang sama dengan nama versinya, lalu isi `MODEL_URL` dengan tautan unduhan aset tersebut.

Setiap putaran pelatihan dicatat di tabel log berikut, di komentar issue #25:

| Versi | Tanggal | Versi dataset | Perubahan dari versi sebelumnya | mAP50 | mAP50-95 | Recall `ramp` |
|---|---|---|---|---|---|---|

## Evaluasi

Metrik dihitung pada bagian **uji**, yang tidak pernah dipakai selama pelatihan maupun pemilihan model.

| Metrik | Target awal |
|---|---|
| mAP50 seluruh kelas | ≥ 0,60 |
| Recall kelas `ramp` | ≥ 0,70 |
| Recall kelas `tangga` | ≥ 0,70 |
| Waktu inferensi p95 di hosting produksi | < 3 detik per foto |

Recall `ramp` dan `tangga` diberi target tersendiri karena kedua kelas itu paling menentukan apakah pengguna kursi roda bisa masuk ke suatu tempat. Target ini adalah titik awal, dan boleh direvisi setelah putaran pelatihan pertama jika terbukti tidak realistis untuk ukuran dataset yang ada, dengan alasan dicatat di log.

## Layanan deteksi

### Struktur

```
ai-service/app/
├── main.py
├── konfigurasi.py
├── skema.py
└── detektor/
    ├── dasar.py
    ├── vision_api.py
    └── yolo.py
```

- `dasar.py` mendefinisikan antarmuka detektor: menerima gambar dan mengembalikan daftar deteksi dengan label, keyakinan, dan kotak pembatas ternormalisasi.
- `vision_api.py` dan `yolo.py` masing-masing mengimplementasikan antarmuka itu.
- `main.py` memilih detektor sekali saat aplikasi mulai berdasarkan `MODE_DETEKSI`, lalu menyediakan endpoint sesuai [Kontrak API](04-kontrak-api.md#layanan-deteksi-ai).

### Detektor vision API

- Meminta penyedia mengembalikan JSON berisi label dari empat kelas, keyakinan, dan kotak pembatas ternormalisasi.
- Respons divalidasi dengan skema Pydantic. Item dengan label di luar empat kelas, tanpa kotak pembatas, atau dengan koordinat di luar rentang 0 sampai 1 dibuang.
- Nilai keyakinan dari vision API tidak terkalibrasi seperti keyakinan model deteksi. Hal ini dicatat sebagai keterbatasan dalam perbandingan #28.

### Detektor YOLO

- Bobot diunduh dari `MODEL_URL` sekali saat layanan mulai dan disimpan di memori.
- Inferensi berjalan di CPU. Image Docker memasang PyTorch versi CPU supaya ukurannya jauh lebih kecil.

## Perbandingan model sendiri dan vision API

Issue #28 menjawab pertanyaan: apakah model buatan sendiri layak menggantikan vision API di produksi?

### Metode

1. Kedua detektor dijalankan pada **bagian uji yang sama**.
2. Karena kotak pembatas dari vision API kurang dapat diandalkan, perbandingan utama dilakukan di tingkat foto: untuk setiap kelas, apakah detektor menyatakan objek itu ada di foto, dibandingkan dengan label sebenarnya.
3. Hitung precision, recall, dan F1 per kelas untuk kedua detektor pada tingkat foto.
4. Hitung mAP50 untuk detektor YOLO saja.
5. Ukur waktu respons p50 dan p95 lewat endpoint `/deteksi` di hosting produksi, bukan di laptop.
6. Hitung perkiraan biaya per 1000 foto untuk kedua pendekatan.
7. Pilih minimal lima contoh foto di mana kedua detektor berbeda pendapat, lalu analisis penyebabnya.

### Aturan keputusan mode produksi

`MODE_DETEKSI=yolo` dipakai di produksi jika **ketiga** syarat terpenuhi:

- F1 tingkat foto untuk `ramp` dan `tangga` tidak lebih rendah dari vision API dikurangi 0,05.
- Waktu respons p95 memenuhi target di bagian evaluasi.
- Tidak ada kelas dengan recall tingkat foto di bawah 0,50.

Jika tidak, produksi tetap memakai vision API dan model sendiri dilaporkan sebagai hasil eksperimen beserta analisis kekurangannya. Kedua hasil sama-sama sah untuk laporan akhir, asalkan keputusannya berbasis data.

## Kriteria penerimaan

### #39 Menyiapkan kerangka layanan deteksi AI

- [ ] Aplikasi FastAPI di `ai-service/` dengan struktur sesuai dokumen ini.
- [ ] `GET /kesehatan` dan `POST /deteksi` tersedia sesuai kontrak, dengan detektor sementara yang selalu mengembalikan daftar deteksi kosong.
- [ ] `POST /deteksi` tanpa atau dengan `X-Api-Key` yang salah mengembalikan 401.
- [ ] Field JSON memakai `camelCase` lewat alias Pydantic.
- [ ] `requirements.txt`, `Dockerfile`, dan `.env.example` tersedia.
- [ ] Minimal satu pengujian di `ai-service/tests/`, sehingga `pytest` tidak berhenti dengan kode keluar 5.
- [ ] `ruff check .` bersih dan job CI layanan AI hijau dengan langkah lint dan uji benar-benar berjalan.

### #40 Mengimplementasikan detektor berbasis vision API

- [ ] Penyedia vision API dipilih, dengan alasan pemilihan dan perkiraan biaya dicatat di komentar issue.
- [ ] Detektor mengembalikan bentuk respons yang sama persis dengan kontrak.
- [ ] Item tidak valid dibuang sesuai aturan detektor vision API.
- [ ] Batas waktu 15 detik menghasilkan `504 DETEKSI_MELEWATI_BATAS_WAKTU`.
- [ ] Pengujian unit memakai respons penyedia tiruan, tanpa memanggil layanan sungguhan.
- [ ] Uji coba manual pada 20 foto contoh dicatat di komentar issue: jumlah deteksi benar, salah, dan terlewat per kelas.
- [ ] `VISION_API_KEY` hanya ada di layanan AI dan tidak pernah dikirim ke aplikasi web.

### #24 Mengumpulkan dan menganotasi dataset foto fasilitas aksesibilitas

- [ ] Anotasi tersimpan di `ai-service/dataset/anotasi.jsonl` dengan aturan pemetaan label sesuai bagian Pelabelan.
- [ ] Sumber, tautan asli, lisensi, dan pembuat setiap foto tercatat di anotasi.
- [ ] Seluruh foto dapat diunduh ulang dari sumber aslinya dengan `ai-service/dataset/unduh.py`.
- [ ] Label `toilet_aksesibel` dari Wikimedia Commons diperiksa visual terhadap pedoman anotasi.
- [ ] Foto yang hampir identik selalu berada di lipatan yang sama.
- [ ] Komposisi dataset per kelas tercatat di dokumen ini.

### #25 Melatih model deteksi menggunakan transfer learning

- [ ] Skrip pelatihan di `ai-service/pelatihan/` dapat dijalankan ulang dan menghasilkan model dengan konfigurasi yang sama.
- [ ] Log pelatihan diisi untuk setiap putaran.
- [ ] Metrik akhir pada bagian uji dilaporkan per kelas, beserta confusion matrix.
- [ ] Bobot model final diunggah sebagai aset GitHub Release dengan nama versi yang benar.

### #26 Membungkus model ke dalam layanan FastAPI

- [ ] Detektor YOLO mengimplementasikan antarmuka yang sama dengan detektor vision API.
- [ ] Mengganti `MODE_DETEKSI` dari `vision_api` ke `yolo` di Railway tidak memerlukan perubahan apa pun di aplikasi web.
- [ ] `GET /kesehatan` menampilkan mode dan versi model yang sedang aktif.
- [ ] Waktu respons p95 memenuhi target di bagian evaluasi, diukur di Railway.
- [ ] Pengujian unit memakai model tiruan dan tidak mengunduh bobot sungguhan.

### #28 Membandingkan akurasi model sendiri dengan layanan vision API

- [ ] Seluruh langkah metode perbandingan dijalankan.
- [ ] Hasil disusun dalam dokumen perbandingan berisi tabel metrik kedua detektor, waktu respons, biaya, dan analisis contoh foto.
- [ ] Keputusan mode produksi diambil berdasarkan aturan keputusan dan dicatat di [README dokumen](README.md#catatan-keputusan).
