## b. Nama Produk

**Nama Produk:** Aksesin

**Tagline:** Navigate Without Barriers

## c. Permasalahan yang Dipecahkan

### Latar Belakang

Penyandang disabilitas, khususnya pengguna kursi roda, menghadapi berbagai hambatan ketika mengakses fasilitas umum. Informasi mengenai aksesibilitas suatu tempat, seperti keberadaan ramp, tangga, toilet aksesibel, atau jalur tanpa hambatan, sering tidak tersedia secara lengkap dan akurat.

Aplikasi peta digital yang sudah ada menyediakan sebagian informasi terkait aksesibilitas, tapi data itu belum tentu lengkap atau sesuai kebutuhan spesifik tiap pengguna. Sebuah tempat mungkin tercatat memiliki ramp dan akses masuk untuk kursi roda, tapi pengguna tetap tidak tahu apakah jalur menuju tempat itu punya hambatan lain, atau apakah toiletnya juga bisa dipakai.

Data aksesibilitas juga berubah seiring waktu, karena fasilitas rusak, direnovasi, atau tertutup sementara. Karena itu, dibutuhkan platform yang menampilkan informasi aksesibilitas suatu tempat, membantu pengguna menilai kesesuaian tempat itu dengan kebutuhannya, dan membuka ruang bagi masyarakat untuk memperbarui informasi tersebut.

Aksesin adalah platform berbasis web yang menggabungkan data tempat, laporan komunitas, penyimpanan berbasis cloud, dan AI berbasis computer vision untuk mengidentifikasi bukti fasilitas aksesibilitas dari foto. Pengguna mendapat informasi yang lebih personal dan transparan sebelum mengunjungi suatu tempat.

### Rumusan Permasalahan

1. Bagaimana menyediakan informasi aksesibilitas tempat yang lebih lengkap dan mudah diakses oleh pengguna, khususnya pengguna kursi roda?
2. Bagaimana membantu pengguna menentukan apakah suatu tempat sesuai dengan kebutuhan aksesibilitas mereka, bukan hanya memberikan status umum "accessible" atau "not accessible"?
3. Bagaimana memanfaatkan AI untuk mengidentifikasi bukti fasilitas aksesibilitas, seperti ramp, tangga, dan pintu, dari foto yang diunggah pengguna?
4. Bagaimana membangun sistem berbasis komunitas yang memungkinkan informasi aksesibilitas terus diperbarui dan diverifikasi?
5. Bagaimana mengintegrasikan jaringan komputer, komputasi awan, dan AI ke dalam sistem yang bisa dikerjakan dalam satu semester?

### Daftar Pustaka

**Statistik & regulasi disabilitas Indonesia**

1. Fajriani, F., & Wicaksono, F. (2023). Pengaruh tingkat keparahan dan penggunaan internet terhadap status bekerja penyandang disabilitas di Indonesia. *INKLUSI: Journal of Disability Studies, 10*(2), 237–256. https://doi.org/10.14421/ijds.100206
2. Republik Indonesia. (2016). *Undang-Undang Nomor 8 Tahun 2016 tentang Penyandang Disabilitas*. https://peraturan.bpk.go.id/Details/37251/uu-no-8-tahun-2016
3. Kementerian Pekerjaan Umum dan Perumahan Rakyat. (2017). *Peraturan Menteri PUPR Nomor 14/PRT/M/2017 tentang Persyaratan Kemudahan Bangunan Gedung*. https://peraturan.bpk.go.id/Details/104477/permen-pupr-no-14prtm2017-tahun-2017

**Dokumentasi Google Maps/Places terkait accessibility**

4. Google Maps Platform. (2023). *Introducing the new Places API with access to EV, accessibility features, and more*. https://mapsplatform.google.com/resources/blog/introducing-the-new-places-api-with-access-to-new-ev-accessibility-features-and-more/
5. Google. (n.d.). *Accessibility in Google Maps*. Google Maps Help. Diakses 28 Agustus 2026, dari https://support.google.com/maps/answer/9882117

**Referensi OpenStreetMap accessibility tagging**

6. OpenStreetMap Wiki. (n.d.). *Key:wheelchair*. Diakses 28 Agustus 2026, dari https://wiki.openstreetmap.org/wiki/Key:wheelchair
7. OpenStreetMap Wiki. (n.d.). *How to map for the needs of people with disabilities*. Diakses 28 Agustus 2026, dari https://wiki.openstreetmap.org/wiki/How_to_map_for_the_needs_of_people_with_disabilities

**Jurnal dengan rumusan masalah serupa (crowdsourcing + AI/computer vision untuk data aksesibilitas)**

8. Saha, M., Saugstad, M., Maddali, H. T., Zeng, A., Holland, R., Bower, S., Dash, A., Chen, S., Li, A., Hara, K., & Froehlich, J. E. (2019). Project Sidewalk: A web-based crowdsourcing tool for collecting sidewalk accessibility data at scale. *Proceedings of the 2019 CHI Conference on Human Factors in Computing Systems*, 1–14. https://doi.org/10.1145/3290605.3300292
9. Weld, G., Jang, E., Li, A., Zeng, A., Heimerl, K., & Froehlich, J. E. (2019). Deep learning for automatically detecting sidewalk accessibility problems using streetscape imagery. *Proceedings of the 21st International ACM SIGACCESS Conference on Computers and Accessibility*, 196–209. https://doi.org/10.1145/3308561.3353798
10. Hara, K., Sun, J., Moore, R., Jacobs, D., & Froehlich, J. (2014). Tohme: Detecting curb ramps in Google Street View using crowdsourcing, computer vision, and machine learning. *Proceedings of the 27th Annual ACM Symposium on User Interface Software and Technology*, 189–204. https://doi.org/10.1145/2642918.2647403
11. O'Meara, J., Hwang, J., Wang, Z., Saugstad, M., & Froehlich, J. (2025). *RampNet: A two-stage pipeline for bootstrapping curb ramp detection in streetscape images from open government metadata*. arXiv. https://arxiv.org/abs/2508.09415
12. Fadillah, I. M., & Wulandari, S. (2025). Sistem pelaporan fasilitas umum berbasis mobile dan web dengan teknologi geolocation menggunakan metode Waterfall. *Jurnal Informatika Teknologi dan Sains (JINTEKS), 7*(4), 1892–1901. https://www.jurnal.uts.ac.id/JINTEKS/article/download/6854/3044

## d. Ide Solusi yang Diusulkan beserta Rancangan Fitur

### Solusi

Aksesin adalah platform berbasis web yang membantu pengguna menemukan dan mengevaluasi aksesibilitas suatu tempat berdasarkan kebutuhan mereka.

Pada MVP, Aksesin berfokus pada pengguna kursi roda. Pengguna bisa mencari suatu tempat dan melihat informasi mengenai fasilitas seperti akses masuk, ramp, tangga, toilet, dan fasilitas lainnya.

Keunggulan utama Aksesin adalah Compatibility Assessment: penilaian tingkat kesesuaian suatu tempat berdasarkan kebutuhan pengguna dan data aksesibilitas yang tersedia, bukan sekadar label "accessible" atau "not accessible". Sistem menyusun penilaian ini dari kombinasi data tempat, kontribusi komunitas, dan analisis foto menggunakan AI untuk mendeteksi elemen visual yang berkaitan dengan aksesibilitas.

### Rancangan Fitur Solusi

| Nama Fitur | Keterangan |
|---|---|
| Personal Accessibility Profile | Pengguna menentukan kebutuhan aksesibilitasnya, terutama kebutuhan pengguna kursi roda, agar sistem bisa memberi rekomendasi yang lebih personal. |
| Accessibility Place Search | Pengguna mencari tempat dan melihat informasi aksesibilitas yang tersedia. |
| Compatibility Assessment | Sistem menghitung tingkat kesesuaian suatu tempat berdasarkan kebutuhan pengguna dan data fasilitas yang tersedia. |
| AI Accessibility Detection | Pengguna mengunggah foto fasilitas. AI mendeteksi elemen seperti ramp, tangga, atau pintu sebagai bukti informasi aksesibilitas. |
| Community Verification | Pengguna menambahkan, memperbarui, atau memverifikasi informasi aksesibilitas suatu tempat. |
| Accessibility Evidence | Setiap informasi didukung bukti seperti foto, laporan komunitas, dan waktu terakhir informasi diverifikasi. |
| Accessibility Confidence | Sistem menampilkan tingkat kepercayaan terhadap informasi berdasarkan sumber data, jumlah verifikasi, bukti foto, dan waktu pembaruan. |
| Accessible Route Recommendation (opsional/future development jika terlalu berat) | Rekomendasi rute yang mempertimbangkan hambatan aksesibilitas yang tercatat. |

### Catatan Scope

Untuk MVP, fitur yang kita kerjakan:

**Wajib:**
- Personal Accessibility Profile
- Search Place
- Compatibility Assessment
- AI Accessibility Detection
- Community Verification
- Accessibility Confidence

Accessible Route Recommendation masuk sebagai future development, atau fitur tambahan kalau progres kelompok memungkinkan. Ini menjaga ide kalian tetap realistis dan tidak terlalu besar.

## e. Analisis Kompetitor

Aku sarankan tiga kompetitor. Struktur worksheet meminta minimal tiga kompetitor beserta jenis kompetitor, target customer, kelebihan, kekurangan, dan unique value.

1. Google Maps — indirect competitor
2. Wheelmap — direct competitor
3. AccessNow — direct competitor

### Kompetitor 1: Google Maps

**Jenis Kompetitor:** Indirect Competitor

**Jenis Produk:** Platform digital untuk pencarian lokasi, navigasi, dan informasi tempat.

**Target Customer:** Masyarakat umum yang membutuhkan layanan pencarian lokasi dan navigasi.

**Kelebihan**
- Cakupan data lokasi sangat luas.
- Fitur navigasi dan pencarian tempat.
- Sebagian informasi mengenai fasilitas aksesibilitas.
- Basis pengguna besar, sehingga data terus diperbarui.

**Kekurangan**
- Informasi aksesibilitas belum selalu lengkap untuk setiap tempat.
- Informasi yang tersedia belum tentu sesuai kebutuhan spesifik tiap pengguna.
- Tidak berfokus pada evaluasi kesesuaian aksesibilitas.
- Bukti visual dan tingkat kepercayaan informasi aksesibilitas bukan fokus utama.

**Key Competitive Advantage & Unique Value**

Aksesin berfokus pada personalized accessibility assessment: sistem membantu pengguna memahami apakah suatu tempat sesuai kebutuhan aksesibilitas mereka, didukung laporan komunitas dan bukti visual yang dianalisis AI.

### Kompetitor 2: Wheelmap

**Jenis Kompetitor:** Direct Competitor

**Jenis Produk:** Platform pemetaan berbasis komunitas yang menyediakan informasi aksesibilitas tempat, khususnya untuk pengguna kursi roda.

**Target Customer:** Pengguna kursi roda dan masyarakat yang membutuhkan informasi aksesibilitas suatu tempat.

**Kelebihan**
- Fokus khusus pada aksesibilitas.
- Memanfaatkan kontribusi komunitas.
- Sistem informasi aksesibilitas yang mudah dipahami.
- Membantu pengguna menemukan tempat berdasarkan status aksesibilitas.

**Kekurangan**
- Kelengkapan informasi bergantung pada kontribusi komunitas.
- Belum mempersonalisasi kebutuhan pengguna.
- Evaluasi kesesuaian tempat tidak mempertimbangkan profil kebutuhan pengguna secara spesifik.
- AI untuk menganalisis bukti visual aksesibilitas bukan fokus utama.

**Key Competitive Advantage & Unique Value**

Aksesin memperluas konsep accessibility mapping dengan personal accessibility profile, AI-based photo evidence detection, dan accessibility confidence score. Pengguna melihat kesesuaian tempat dengan kebutuhannya, lengkap dengan tingkat kepercayaan informasinya.

### Kompetitor 3: AccessNow

**Jenis Kompetitor:** Direct Competitor

**Jenis Produk:** Platform digital yang menyediakan informasi aksesibilitas berbagai lokasi berbasis kontribusi komunitas.

**Target Customer:** Penyandang disabilitas, pengguna dengan kebutuhan aksesibilitas tertentu, serta masyarakat umum.

**Kelebihan**
- Fokus pada informasi aksesibilitas.
- Data dan kontribusi dari komunitas.
- Informasi mengenai fasilitas dan aksesibilitas suatu tempat.
- Mendukung kesadaran terhadap lingkungan yang inklusif.

**Kekurangan**
- Kelengkapan data bergantung pada jumlah kontribusi komunitas di suatu wilayah.
- Informasi yang tersedia belum tentu terbaru.
- Tidak memberikan evaluasi personal berdasarkan kebutuhan pengguna.
- Pengguna masih harus menilai sendiri apakah informasi fasilitas sesuai kebutuhannya.

**Key Competitive Advantage & Unique Value**

Aksesin menggabungkan AI, community verification, dan personalized compatibility assessment untuk mengubah data dan bukti visual menjadi informasi yang relevan bagi kebutuhan tiap pengguna.
