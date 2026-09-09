# Aksesin

**Navigate Without Barriers**

## Project Senior Project TI

Departemen Teknik Elektro dan Teknologi Informasi  
Fakultas Teknik  
Universitas Gadjah Mada

## Kelompok Aksesin (15)

| Peran | Nama | NIM |
|---|---|---|
| Ketua Kelompok | Nabil Aufa Danaputra | 24/535223/TK/59357 |
| Anggota 1 | Nayla Thalita | 24/535820/TK/59467 |
| Anggota 2 | Gilbert S. H. Nainggolan | 24/543841/TK/60447 |

## Nama Produk

**Aksesin**

Tagline: *Navigate Without Barriers*

## Jenis Produk

Aplikasi berbasis web (web application) di bidang aksesibilitas dan pemetaan lokasi, yang menggabungkan data tempat, kontribusi komunitas, komputasi awan, dan AI berbasis computer vision.

## Latar Belakang dan Permasalahan

Penyandang disabilitas, khususnya pengguna kursi roda, menghadapi berbagai hambatan ketika mengakses fasilitas umum. Informasi mengenai aksesibilitas suatu tempat, seperti keberadaan ramp, tangga, toilet aksesibel, atau jalur tanpa hambatan, sering tidak tersedia secara lengkap dan akurat.

Aplikasi peta digital yang sudah ada menyediakan sebagian informasi terkait aksesibilitas, tetapi data itu belum tentu lengkap atau sesuai kebutuhan spesifik tiap pengguna. Sebuah tempat mungkin tercatat memiliki ramp dan akses masuk untuk kursi roda, tetapi pengguna tetap tidak tahu apakah jalur menuju tempat itu punya hambatan lain, atau apakah toiletnya juga bisa dipakai.

Data aksesibilitas juga berubah seiring waktu, karena fasilitas rusak, direnovasi, atau tertutup sementara. Karena itu, dibutuhkan platform yang menampilkan informasi aksesibilitas suatu tempat, membantu pengguna menilai kesesuaian tempat itu dengan kebutuhannya, dan membuka ruang bagi masyarakat untuk memperbarui informasi tersebut.

### Rumusan Permasalahan

1. Bagaimana menyediakan informasi aksesibilitas tempat yang lebih lengkap dan mudah diakses oleh pengguna, khususnya pengguna kursi roda?
2. Bagaimana membantu pengguna menentukan apakah suatu tempat sesuai dengan kebutuhan aksesibilitas mereka, bukan hanya memberikan status umum "accessible" atau "not accessible"?
3. Bagaimana memanfaatkan AI untuk mengidentifikasi bukti fasilitas aksesibilitas, seperti ramp, tangga, dan pintu, dari foto yang diunggah pengguna?
4. Bagaimana membangun sistem berbasis komunitas yang memungkinkan informasi aksesibilitas terus diperbarui dan diverifikasi?
5. Bagaimana mengintegrasikan jaringan komputer, komputasi awan, dan AI ke dalam sistem yang bisa dikerjakan dalam satu semester?

## Ide Solusi

Aksesin adalah platform berbasis web yang membantu pengguna menemukan dan mengevaluasi aksesibilitas suatu tempat berdasarkan kebutuhan mereka.

Pada MVP, Aksesin berfokus pada pengguna kursi roda. Pengguna bisa mencari suatu tempat dan melihat informasi mengenai fasilitas seperti akses masuk, ramp, tangga, toilet, dan fasilitas lainnya.

Keunggulan utama Aksesin adalah **Compatibility Assessment**, yaitu penilaian tingkat kesesuaian suatu tempat berdasarkan kebutuhan pengguna dan data aksesibilitas yang tersedia, bukan sekadar label "accessible" atau "not accessible". Sistem menyusun penilaian ini dari kombinasi data tempat, kontribusi komunitas, dan analisis foto menggunakan AI untuk mendeteksi elemen visual yang berkaitan dengan aksesibilitas.

### Rancangan Fitur

| Nama Fitur | Keterangan |
|---|---|
| Personal Accessibility Profile | Pengguna menentukan kebutuhan aksesibilitasnya, terutama kebutuhan pengguna kursi roda, agar sistem bisa memberi rekomendasi yang lebih personal. |
| Accessibility Place Search | Pengguna mencari tempat dan melihat informasi aksesibilitas yang tersedia. |
| Compatibility Assessment | Sistem menghitung tingkat kesesuaian suatu tempat berdasarkan kebutuhan pengguna dan data fasilitas yang tersedia. |
| AI Accessibility Detection | Pengguna mengunggah foto fasilitas. AI mendeteksi elemen seperti ramp, tangga, atau pintu sebagai bukti informasi aksesibilitas. |
| Community Verification | Pengguna menambahkan, memperbarui, atau memverifikasi informasi aksesibilitas suatu tempat. |
| Accessibility Evidence | Setiap informasi didukung bukti seperti foto, laporan komunitas, dan waktu terakhir informasi diverifikasi. |
| Accessibility Confidence | Sistem menampilkan tingkat kepercayaan terhadap informasi berdasarkan sumber data, jumlah verifikasi, bukti foto, dan waktu pembaruan. |
| Accessible Route Recommendation | Rekomendasi rute yang mempertimbangkan hambatan aksesibilitas yang tercatat. Fitur ini masuk sebagai future development. |

### Ruang Lingkup MVP

Fitur yang dikerjakan pada MVP:

- Personal Accessibility Profile
- Accessibility Place Search
- Compatibility Assessment
- AI Accessibility Detection
- Community Verification
- Accessibility Confidence

Accessible Route Recommendation dijadikan future development, atau fitur tambahan apabila progres kelompok memungkinkan.

## Analisis Kompetitor

### 1. Google Maps

**Jenis Kompetitor:** Indirect Competitor

**Jenis Produk:** Platform digital untuk pencarian lokasi, navigasi, dan informasi tempat.

**Target Customer:** Masyarakat umum yang membutuhkan layanan pencarian lokasi dan navigasi.

**Kelebihan:**

- Cakupan data lokasi sangat luas.
- Fitur navigasi dan pencarian tempat.
- Sebagian informasi mengenai fasilitas aksesibilitas.
- Basis pengguna besar, sehingga data terus diperbarui.

**Kekurangan:**

- Informasi aksesibilitas belum selalu lengkap untuk setiap tempat.
- Informasi yang tersedia belum tentu sesuai kebutuhan spesifik tiap pengguna.
- Tidak berfokus pada evaluasi kesesuaian aksesibilitas.
- Bukti visual dan tingkat kepercayaan informasi aksesibilitas bukan fokus utama.

**Key Competitive Advantage dan Unique Value:**

Aksesin berfokus pada personalized accessibility assessment. Sistem membantu pengguna memahami apakah suatu tempat sesuai kebutuhan aksesibilitas mereka, didukung laporan komunitas dan bukti visual yang dianalisis AI.

### 2. Wheelmap

**Jenis Kompetitor:** Direct Competitor

**Jenis Produk:** Platform pemetaan berbasis komunitas yang menyediakan informasi aksesibilitas tempat, khususnya untuk pengguna kursi roda.

**Target Customer:** Pengguna kursi roda dan masyarakat yang membutuhkan informasi aksesibilitas suatu tempat.

**Kelebihan:**

- Fokus khusus pada aksesibilitas.
- Memanfaatkan kontribusi komunitas.
- Sistem informasi aksesibilitas yang mudah dipahami.
- Membantu pengguna menemukan tempat berdasarkan status aksesibilitas.

**Kekurangan:**

- Kelengkapan informasi bergantung pada kontribusi komunitas.
- Belum mempersonalisasi kebutuhan pengguna.
- Evaluasi kesesuaian tempat tidak mempertimbangkan profil kebutuhan pengguna secara spesifik.
- AI untuk menganalisis bukti visual aksesibilitas bukan fokus utama.

**Key Competitive Advantage dan Unique Value:**

Aksesin memperluas konsep accessibility mapping dengan personal accessibility profile, AI-based photo evidence detection, dan accessibility confidence score. Pengguna melihat kesesuaian tempat dengan kebutuhannya, lengkap dengan tingkat kepercayaan informasinya.

### 3. AccessNow

**Jenis Kompetitor:** Direct Competitor

**Jenis Produk:** Platform digital yang menyediakan informasi aksesibilitas berbagai lokasi berbasis kontribusi komunitas.

**Target Customer:** Penyandang disabilitas, pengguna dengan kebutuhan aksesibilitas tertentu, serta masyarakat umum.

**Kelebihan:**

- Fokus pada informasi aksesibilitas.
- Data dan kontribusi dari komunitas.
- Informasi mengenai fasilitas dan aksesibilitas suatu tempat.
- Mendukung kesadaran terhadap lingkungan yang inklusif.

**Kekurangan:**

- Kelengkapan data bergantung pada jumlah kontribusi komunitas di suatu wilayah.
- Informasi yang tersedia belum tentu terbaru.
- Tidak memberikan evaluasi personal berdasarkan kebutuhan pengguna.
- Pengguna masih harus menilai sendiri apakah informasi fasilitas sesuai kebutuhannya.

**Key Competitive Advantage dan Unique Value:**

Aksesin menggabungkan AI, community verification, dan personalized compatibility assessment untuk mengubah data dan bukti visual menjadi informasi yang relevan bagi kebutuhan tiap pengguna.
