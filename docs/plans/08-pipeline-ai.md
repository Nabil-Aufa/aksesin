# Pipeline AI

Dokumen ini menjelaskan komponen AI Aksesin dari pengumpulan foto sampai model berjalan di produksi. Strateginya *transfer learning*: dua model visi sumber terbuka yang sudah dilatih pada data berskala besar dipakai sebagai pengekstrak fitur yang dibekukan, lalu kepala klasifikasi kecil dilatih sendiri di atasnya memakai dataset Aksesin. Pendekatan ini tidak memerlukan GPU, tidak memakai layanan berbayar, dan dapat dilatih ulang di laptop.

Rencana awal yang memakai vision API berbayar dan YOLO yang dilatih dari awal diganti pada 10 Oktober 2026. Alasannya dicatat di [README dokumen](README.md#catatan-keputusan).

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

### Arsitektur detektor

Detektor `gabungan` menilai keempat kelas pada setiap foto dalam tiga langkah.

1. **Pengekstrak fitur yang dibekukan.** Bobot kedua model tidak diubah.
   - [DINOv2-base](https://huggingface.co/facebook/dinov2-base) (lisensi Apache 2.0) menghasilkan satu vektor untuk seluruh foto. Foto diperkecil ke 224 x 224 piksel, lalu token kelas dan rata-rata token bagian digabung menjadi vektor 1.536 dimensi.
   - [OWL-ViT base patch32](https://huggingface.co/google/owlvit-base-patch32) (lisensi Apache 2.0) membagi foto menjadi 576 bagian. Setiap bagian memiliki vektor 512 dimensi dan perkiraan kotak pembatas.
2. **Kepala klasifikasi yang dilatih sendiri.** Kepala klasifikasi berupa regresi logistik dengan bobot kelas seimbang.
   - Kepala global menilai vektor seluruh foto.
   - Kepala bagian menilai setiap bagian foto, lalu nilai tertinggi diambil. Kepala ini dilatih dari kotak pembatas di anotasi: bagian dengan IoU minimal 0,4 terhadap kotak acuan menjadi contoh positif, dan 40 bagian acak dengan IoU di bawah 0,1 dari setiap foto menjadi contoh negatif. Kelas `toilet_aksesibel` tidak memiliki kepala bagian karena datasetnya tidak berisi kotak.
3. **Penggabung.** Regresi logistik kecil menggabungkan nilai kedua kepala menjadi peluang yang terkalibrasi. Penggabung dilatih dari nilai kedua kepala pada foto yang tidak mereka lihat saat dilatih (*out-of-fold*). Karena bobot kelasnya seimbang, peluang 0,5 berarti bukti ada dan tidak adanya objek sama kuat.

Kotak pembatas yang dikembalikan berasal dari bagian dengan nilai kepala bagian tertinggi. Untuk `toilet_aksesibel`, kotak berasal dari bagian yang paling cocok dengan kueri teks OWL-ViT "a toilet with grab bars" dan "a wheelchair accessible toilet".

Model pralatih diunduh dari Hugging Face Hub saat image Docker dibangun. Bobot kepala klasifikasi hanya sekitar 80 KB, sehingga disimpan langsung di `ai-service/app/detektor/bobot_kepala.json`.

### Menjalankan pelatihan

```bash
cd ai-service
pip install torch --index-url https://download.pytorch.org/whl/cpu
pip install -r pelatihan/requirements.txt
python -m pelatihan.latih_kepala ../../aksesin-dataset/dataset-2026-10-10
```

Skrip mengekstrak fitur setiap foto dan menyimpannya di subfolder `fitur`, supaya pelatihan ulang tidak perlu mengekstrak lagi. Setelah itu skrip menjalankan validasi silang lima lipatan, lalu melatih kepala akhir dengan seluruh data. Hasilnya ditulis ke `app/detektor/bobot_kepala.json` dan `pelatihan/metrik.json`. Ekstraksi fitur 1.536 foto memakan waktu sekitar 1,5 jam di CPU laptop.

Penamaan versi model: `aksesin-gabungan-v<nomor>`. Nilai ini dikirim di field `versiModel` dan tersimpan di `ai_detections.versi_model`, sehingga setiap hasil deteksi dapat ditelusuri ke versi kepala klasifikasi yang menghasilkannya.

Setiap putaran pelatihan dicatat di tabel berikut:

| Versi | Tanggal | Versi dataset | Perubahan | AUC `ramp` | AUC `tangga` | AUC `pintu` | AUC `toilet_aksesibel` |
|---|---|---|---|---|---|---|---|
| `aksesin-gabungan-v1` | 12 Okt 2026 | `dataset-2026-10-10` | Versi pertama | 0,82 | 0,95 | 0,98 | 0,98 |

## Evaluasi

Metrik dihitung dengan validasi silang lima lipatan sesuai field `lipatan`. Setiap foto dinilai oleh kepala klasifikasi yang tidak pernah melihat foto itu saat dilatih. Hanya foto yang label kelasnya bukan `null` yang dihitung.

### Hasil `aksesin-gabungan-v1`

| Kelas | Foto | Berisi objek | AUC | Presisi pada 0,6 | Recall pada 0,6 | Presisi pada 0,7 | Recall pada 0,7 |
|---|---|---|---|---|---|---|---|
| `ramp` | 754 | 129 | 0,82 | 0,47 | 0,65 | 0,60 | 0,50 |
| `tangga` | 1.381 | 781 | 0,95 | 0,92 | 0,85 | 0,93 | 0,79 |
| `pintu` | 569 | 329 | 0,98 | 0,97 | 0,93 | 0,97 | 0,90 |
| `toilet_aksesibel` | 1.446 | 60 | 0,98 | 0,62 | 0,93 | 0,71 | 0,92 |

Ambang 0,6 dan 0,7 dipakai karena keduanya menjadi batas mendukung dan bertentangan di [Algoritma Penilaian](05-algoritma-penilaian.md#kecocokan-hasil-deteksi-ai). Matriks konfusi lengkap setiap kelas ada di `ai-service/pelatihan/metrik.json`.

Cara membaca hasil:

- `pintu` dan `tangga` dapat diandalkan, baik untuk mendukung maupun membantah laporan.
- Presisi `toilet_aksesibel` terlihat rendah karena data uji berisi 24 foto tanpa toilet aksesibel untuk setiap satu foto yang berisi. Pada laporan sungguhan, foto toilet biasanya memang memotret toilet, sehingga perbandingannya jauh lebih seimbang. Recall-nya tinggi, sehingga toilet aksesibel jarang terlewat.
- `ramp` adalah kelas terlemah. Ramp di foto pintu masuk sering kecil, jauh, atau warnanya menyatu dengan lantai. Karena itu, keyakinan rendah untuk `ramp` tidak dipakai untuk membantah laporan pengguna.

### Pembanding tanpa kepala klasifikasi

Sebelum kepala klasifikasi dilatih, model siap pakai dicoba langsung dengan kueri teks (*zero-shot*) pada subset 521 foto. AUC yang diperoleh:

| Kelas | CLIP ViT-B/32 | OWL-ViT base patch32 | `aksesin-gabungan-v1` |
|---|---|---|---|
| `ramp` | 0,61 | 0,58 | 0,82 |
| `tangga` | 0,65 | 0,79 | 0,95 |
| `pintu` | 0,66 | 0,96 | 0,98 |
| `toilet_aksesibel` | 0,98 | 0,95 | 0,98 |

Kepala klasifikasi yang dilatih sendiri menaikkan AUC `ramp` dan `tangga` secara berarti, yaitu dua kelas yang paling menentukan apakah pengguna kursi roda dapat masuk ke suatu tempat. Perbandingan lengkap disusun di #28.

### Target

| Metrik | Target | Hasil v1 |
|---|---|---|
| AUC `tangga` | ≥ 0,90 | 0,95 |
| AUC `pintu` | ≥ 0,90 | 0,98 |
| AUC `toilet_aksesibel` | ≥ 0,90 | 0,98 |
| AUC `ramp` | ≥ 0,80 | 0,82 |
| Waktu deteksi per foto di laptop pengembang (Intel Core i5-13420H) | < 3 detik | Sekitar 1,2 detik |
| Waktu respons p95 di hosting produksi | < 3 detik | Diukur setelah hosting tersedia, lihat #26 |

## Layanan deteksi

### Struktur

```
ai-service/
├── requirements.txt
├── requirements-model.txt
├── app/
│   ├── main.py
│   ├── konfigurasi.py
│   ├── skema.py
│   └── detektor/
│       ├── dasar.py
│       ├── sementara.py
│       ├── gabungan.py
│       ├── fitur.py
│       ├── kepala.py
│       └── bobot_kepala.json
├── dataset/
└── pelatihan/
```

- `dasar.py` mendefinisikan antarmuka detektor: menerima gambar dan mengembalikan daftar deteksi dengan label, keyakinan, dan kotak pembatas ternormalisasi.
- `sementara.py` selalu mengembalikan daftar kosong, dipakai saat mengembangkan aplikasi web tanpa memuat model.
- `gabungan.py` adalah detektor sungguhan. Deteksi yang tidak selesai dalam 15 detik menghasilkan `504 DETEKSI_MELEWATI_BATAS_WAKTU`.
- `fitur.py` memuat DINOv2 dan OWL-ViT, sedangkan `kepala.py` menghitung peluang dari fitur dengan numpy saja.
- `main.py` memilih detektor sekali saat aplikasi mulai berdasarkan `MODE_DETEKSI`, lalu menyediakan endpoint sesuai [Kontrak API](04-kontrak-api.md#layanan-deteksi-ai).

### Dependensi

- `requirements.txt` berisi dependensi layanan tanpa PyTorch. CI hanya memasang berkas ini, karena pengujian unit memakai pengekstrak fitur tiruan.
- `requirements-model.txt` berisi PyTorch dan Transformers. Image Docker memasang PyTorch versi CPU dari indeks resmi PyTorch supaya ukurannya jauh lebih kecil, mengunduh kedua model pralatih saat image dibangun, lalu menyalakan `HF_HUB_OFFLINE=1` sehingga layanan tidak mengunduh apa pun saat berjalan.
- Layanan memerlukan sekitar 1,5 GB memori. Hosting disarankan memakai minimal 2 vCPU dan 4 GiB memori.

## Pengembangan berikutnya

- Menambah contoh ramp, misalnya dari [RampNet](https://huggingface.co/datasets/projectsidewalk/rampnet-dataset) (lisensi MIT) atau dari foto laporan pengguna yang sudah diverifikasi, lalu melatih ulang kepala klasifikasi.
- Menambah foto dari Indonesia supaya bentuk fasilitas setempat ikut terwakili.

## Kriteria penerimaan

### #39 Menyiapkan kerangka layanan deteksi AI

- [ ] Aplikasi FastAPI di `ai-service/` dengan struktur sesuai dokumen ini.
- [ ] `GET /kesehatan` dan `POST /deteksi` tersedia sesuai kontrak, dengan detektor sementara yang selalu mengembalikan daftar deteksi kosong.
- [ ] `POST /deteksi` tanpa atau dengan `X-Api-Key` yang salah mengembalikan 401.
- [ ] Field JSON memakai `camelCase` lewat alias Pydantic.
- [ ] `requirements.txt`, `Dockerfile`, dan `.env.example` tersedia.
- [ ] Minimal satu pengujian di `ai-service/tests/`, sehingga `pytest` tidak berhenti dengan kode keluar 5.
- [ ] `ruff check .` bersih dan job CI layanan AI hijau dengan langkah lint dan uji benar-benar berjalan.

### #40 Mengimplementasikan detektor berbasis model sumber terbuka

- [ ] Detektor `gabungan` mengembalikan bentuk respons yang sama persis dengan kontrak, termasuk `bbox` untuk setiap deteksi.
- [ ] Batas waktu 15 detik menghasilkan `504 DETEKSI_MELEWATI_BATAS_WAKTU`.
- [ ] Pengujian unit memakai pengekstrak fitur tiruan, sehingga CI tidak memasang PyTorch dan tidak mengunduh model.
- [ ] Image Docker memuat model pralatih saat dibangun, dan `GET /kesehatan` menampilkan mode `gabungan` beserta versi kepala klasifikasi.
- [ ] Uji coba manual `POST /deteksi` dengan foto sungguhan berhasil di laptop pengembang.

### #24 Mengumpulkan dan menganotasi dataset foto fasilitas aksesibilitas

- [ ] Anotasi tersimpan di `ai-service/dataset/anotasi.jsonl` dengan aturan pemetaan label sesuai bagian Pelabelan.
- [ ] Sumber, tautan asli, lisensi, dan pembuat setiap foto tercatat di anotasi.
- [ ] Seluruh foto dapat diunduh ulang dari sumber aslinya dengan `ai-service/dataset/unduh.py`.
- [ ] Label `toilet_aksesibel` dari Wikimedia Commons diperiksa visual terhadap pedoman anotasi.
- [ ] Foto yang hampir identik selalu berada di lipatan yang sama.
- [ ] Komposisi dataset per kelas tercatat di dokumen ini.

### #25 Melatih model deteksi menggunakan transfer learning

- [ ] Skrip `ai-service/pelatihan/latih_kepala.py` dapat dijalankan ulang dan menghasilkan bobot kepala klasifikasi dengan konfigurasi yang sama.
- [ ] Log pelatihan di dokumen ini diisi untuk setiap putaran.
- [ ] Metrik validasi silang dilaporkan per kelas beserta matriks konfusi di `ai-service/pelatihan/metrik.json`.
- [ ] Bobot kepala klasifikasi tersimpan di `ai-service/app/detektor/bobot_kepala.json` dengan nama versi yang benar.

### #26 Membungkus model ke dalam layanan FastAPI

- [ ] Detektor `gabungan` mengimplementasikan antarmuka yang sama dengan detektor `sementara`.
- [ ] Mengganti `MODE_DETEKSI` di hosting layanan AI tidak memerlukan perubahan apa pun di aplikasi web.
- [ ] `GET /kesehatan` menampilkan mode dan versi model yang sedang aktif.
- [ ] Waktu respons p95 memenuhi target di bagian evaluasi, diukur di hosting produksi.
- [ ] Pengujian unit memakai model tiruan dan tidak mengunduh bobot sungguhan.

### #28 Membandingkan akurasi model siap pakai dengan model hasil transfer learning

- [ ] Model siap pakai (CLIP dan OWL-ViT dengan kueri teks) dan `aksesin-gabungan-v1` dievaluasi pada foto dan lipatan yang sama.
- [ ] Hasil disusun dalam dokumen perbandingan berisi AUC, presisi, dan recall per kelas, waktu respons, kebutuhan memori, dan analisis minimal lima contoh foto yang dinilai berbeda.
- [ ] Keputusan model produksi dicatat di [README dokumen](README.md#catatan-keputusan).
