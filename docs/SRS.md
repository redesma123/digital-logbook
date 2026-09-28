# SRS — HYDRO-MON

## 1. Pendahuluan

### 1.1 Tujuan dokumen
Dokumen Software Requirements Specification (SRS) ini mendefinisikan seluruh kebutuhan fungsional dan non-fungsional sistem HYDRO-MON (Hydro Power Digital Monitoring & Performance System). Dokumen ini berfungsi sebagai acuan pengembangan dan standar validasi sistem.

### 1.2 Ruang lingkup
HYDRO-MON merupakan platform *Digital PLTMH Logbook & Performance Dashboard* untuk mendigitalisasi pencatatan data dan pemantauan kinerja operasional. Sistem terdiri dari tiga komponen utama:
1. **Mobile Application (Flutter)** untuk operator lapangan.
2. **Cloud/Web Server (Node.js/Express/PostgreSQL/Prisma)** sebagai pusat pengolahan data.
3. **Web Dashboard (React+TS+Vite)** untuk supervisor, manajemen, dan admin.

### 1.3 Definisi & akronim
| Istilah | Definisi |
|---|---|
| **PLTMH** | Pembangkit Listrik Tenaga Mikro Hidro. |
| **RBAC** | *Role-Based Access Control*, pembatasan akses sistem berdasarkan peran pengguna. |
| **JWT** | *JSON Web Token*, standar untuk membuat token akses dalam proses autentikasi. |
| **API** | *Application Programming Interface*, antarmuka untuk komunikasi antar komponen perangkat lunak. |
| **ORM** | *Object-Relational Mapping*, teknik memetakan struktur tabel database ke dalam objek kode. |
| **VPS** | *Virtual Private Server*, server virtual tempat sistem akan dide-deploy. |
| **MVP** | *Minimum Viable Product*, versi produk dengan fitur dasar untuk dirilis awal. |

---

## 2. Kebutuhan Fungsional

### Modul AUTH (F-01 s/d F-06)

| ID | Kebutuhan |
|---|---|
| **F-01** | Pengguna dapat melakukan login menggunakan *username* dan *password*, kemudian sistem menerbitkan *access token* dan *refresh token*. |
| **F-02** | Sistem secara otomatis melakukan *refresh access token* menggunakan *refresh token* tanpa mengharuskan pengguna melakukan *re-login*. |
| **F-03** | Proses logout mencabut (*revoke*) *refresh token* pengguna dari database. |
| **F-04** | Sistem membedakan hak akses berdasarkan peran pengguna: OPERATOR, SUPERVISOR, MANAGEMENT, dan ADMIN. |
| **F-05** | Admin mengelola akun pengguna, meliputi operasi penambahan akun, perubahan peran, dan penonaktifan akun. |
| **F-06** | Admin mengelola data unit/plant pembangkit. |

### Modul LOGBOOK (F-07 s/d F-15)

| ID | Kebutuhan |
|---|---|
| **F-07** | Operator dapat membuat entri *logbook* baru untuk shift PAGI, SIANG, atau MALAM. Terdapat *unique constraint* 1 entri per unit per tanggal per shift. |
| **F-08** | Entri *logbook* memuat parameter *Electrical* (*voltage*, *current*, *frequency*, *active power*, *reactive power*, *power factor*, *energy production*, *generator status*). |
| **F-09** | Entri *logbook* memuat parameter *Mechanical* (*RPM*, *bearing temperature*, *generator temperature*, *turbine temperature*, *vibration*). |
| **F-10** | Entri *logbook* memuat parameter *Hydraulic* (*debit air*, *water level*, *head*, *pressure*, *intake condition*). |
| **F-11** | Entri *logbook* memuat parameter *Operational* (*running hours*, *start/stop*, *trip*, *shutdown*, catatan). |
| **F-12** | Backend memvalidasi rentang nilai parameter. Nilai di luar rentang wajar ditolak atau diberi peringatan sistem. |
| **F-13** | Operator dapat melihat histori *logbook* dengan filter tanggal, shift, dan unit. |
| **F-14** | Operator dan Supervisor dapat melihat detail keseluruhan dari satu entri *logbook*. |
| **F-15** | Operator dapat mengubah entri logbook dalam 24 jam setelah shift. Setelah batas waktu tersebut, hanya Supervisor yang dapat mengubah. |

### Modul GANGGUAN / INSIDEN (F-16 s/d F-22)

| ID | Kebutuhan |
|---|---|
| **F-16** | Operator membuat laporan gangguan operasional unit. |
| **F-17** | Laporan gangguan memuat waktu kejadian, peralatan terdampak, jenis gangguan, deskripsi, dan tindakan awal. |
| **F-18** | Status gangguan dikelola dengan alur: OPEN → PROCESS → CLOSED. |
| **F-19** | Operator dapat mengubah status gangguan miliknya ke PROCESS. Supervisor mengubah status ke CLOSED atau mengembalikannya. |
| **F-20** | Operator dan Supervisor melihat daftar gangguan menggunakan filter status dan rentang tanggal. |
| **F-21** | Sistem mencatat riwayat perubahan status gangguan untuk *audit trail*. |
| **F-22** | Pengguna dapat melampirkan foto pada laporan gangguan. |

### Modul MAINTENANCE (F-23 s/d F-29)

| ID | Kebutuhan |
|---|---|
| **F-23** | Operator dan Supervisor membuat rencana pekerjaan *maintenance*. |
| **F-24** | Rekaman *maintenance* memuat peralatan, jenis pekerjaan, deskripsi, teknisi, dan jadwal. |
| **F-25** | Status *maintenance* dikelola dengan alur: PLAN → PROCESS → COMPLETE. |
| **F-26** | Supervisor memiliki wewenang mengubah status *maintenance*. |
| **F-27** | Operator dan Supervisor melihat daftar *maintenance* dengan filter status dan rentang tanggal. |
| **F-28** | Sistem mencatat riwayat perubahan status *maintenance* untuk *audit trail*. |
| **F-29** | Pengguna dapat melampirkan foto pada rekaman *maintenance*. |

### Modul UPLOAD FOTO (F-30 s/d F-36)

| ID | Kebutuhan |
|---|---|
| **F-30** | Operator mengunggah foto melalui kamera atau galeri untuk *logbook*, gangguan, dan *maintenance*. |
| **F-31** | Aplikasi seluler mengompres foto sebelum dikirim ke server (sisi terpanjang ≤1280 px, kualitas 70-80%). |
| **F-32** | Backend memvalidasi tipe file melalui *magic bytes* dengan format yang diterima: JPEG, PNG, dan WebP. |
| **F-33** | Backend membatasi ukuran foto maksimal 5 MB per file setelah dikompresi. |
| **F-34** | Foto disimpan dengan nama acak (UUID) dan tidak dapat diakses publik tanpa token autentikasi. |
| **F-35** | Sistem membuat *thumbnail* untuk halaman daftar histori. |
| **F-36** | Aplikasi seluler menjalankan mekanisme *retry* otomatis jika koneksi terputus saat proses unggah. |

### Modul DASHBOARD WEB (F-37 s/d F-44)

| ID | Kebutuhan |
|---|---|
| **F-37** | Halaman *dashboard* menampilkan status unit (RUNNING / STANDBY / TRIP / OFFLINE) dengan skema warna sesuai. |
| **F-38** | Tabel parameter utama menampilkan nilai terbaru: *Power*, *Voltage*, *Frequency*, *Flow*, *Water Level*, dan *Energy Today*. |
| **F-39** | *Dashboard* memuat grafik analitik: *Power vs Time*, *Voltage vs Time*, *Frequency vs Time*, *Flow vs Time*, *Water Level vs Time*, dan *Energy Production*. |
| **F-40** | Grafik pada *dashboard* dapat difilter berdasarkan rentang waktu. |
| **F-41** | *Dashboard* menampilkan matriks kinerja: *Availability*, *Capacity Factor*, *Energy Production*, *Water Utilization*, dan *Performance Trend*. |
| **F-42** | Data pada *dashboard* diperbarui secara *near real-time* saat aplikasi mendapat fokus. |
| **F-43** | Supervisor dan Manajemen melihat daftar gangguan dan *maintenance* aktif pada *dashboard*. |
| **F-44** | Admin mengelola pengguna dan unit secara penuh dari antarmuka web. |

### Modul EXPORT & LAPORAN (F-45 s/d F-48)

| ID | Kebutuhan |
|---|---|
| **F-45** | Supervisor dan Manajemen mengunduh data histori *logbook* dalam format XLSX dan CSV. |
| **F-46** | Ekspor data dilengkapi opsi filter rentang tanggal, *shift*, dan unit. |
| **F-47** | Proses pembuatan file ekspor dilakukan di sisi backend. |
| **F-48** | **[Fase 2]** Sistem mengirimkan laporan otomatis terjadwal melalui email. |

### Modul RETENSI FOTO (F-49 s/d F-52)

| ID | Kebutuhan |
|---|---|
| **F-49** | Proses latar belakang harian menghapus foto berumur lebih dari 3 bulan. |
| **F-50** | Foto pada gangguan berstatus OPEN atau PROCESS dikecualikan dari penghapusan otomatis. |
| **F-51** | *Record* metadata foto di basis data tidak dihapus, statusnya diubah menjadi `DELETED_BY_RETENTION`. Data teks tetap utuh. |
| **F-52** | Antarmuka menampilkan keterangan "foto telah dihapus sesuai kebijakan retensi" sebagai pengganti gambar rusak. |

---

## 3. Kebutuhan Non-Fungsional

### Performa
| ID | Kebutuhan |
|---|---|
| **NF-01** | Respons API untuk operasi CRUD maksimal 500 ms pada beban normal. |
| **NF-02** | Halaman utama *dashboard* selesai dimuat kurang dari 3 detik dengan jaringan 4G. |
| **NF-03** | Komponen grafik rentang 30 hari selesai dimuat kurang dari 2 detik. |

### Keamanan
| ID | Kebutuhan |
|---|---|
| **NF-04** | Seluruh komunikasi data dienkripsi menggunakan HTTPS (TLS). |
| **NF-05** | *Password* di-hash dengan algoritma *bcrypt*. |
| **NF-06** | *Access token* berlaku 15 menit, *refresh token* berlaku 7 hari. Pada web, *refresh token* disimpan dalam *cookie httpOnly (SameSite=Strict)*. Pada *mobile*, dikirim via *body*. |
| **NF-07** | *Endpoint* media foto membutuhkan *token* autentikasi valid. |
| **NF-08** | Hak unggah dibatasi untuk pengguna terautentikasi dengan peran yang tepat. |
| **NF-09** | *Endpoint login* dilindungi *rate limit* maksimal 5 *request* per 15 menit per IP. |

### Kompatibilitas
| ID | Kebutuhan |
|---|---|
| **NF-10** | Aplikasi *mobile* berjalan pada Android 8.0 (API Level 26) ke atas. |
| **NF-11** | Antarmuka web kompetibel dengan Chrome, Firefox, dan Edge versi stabil terbaru. |
| **NF-12** | Antarmuka *dashboard* responsif untuk layar minimal 1024 piksel. |

### Usability
| ID | Kebutuhan |
|---|---|
| **NF-13** | Pengisian *logbook* membutuhkan waktu kurang dari 5 menit per laporan. |
| **NF-14** | Label dan pesan *error* menggunakan Bahasa Indonesia. |
| **NF-15** | Aplikasi menampilkan *feedback* visual yang jelas saat unggah foto. |

### Ketersediaan & Keandalan
| ID | Kebutuhan |
|---|---|
| **NF-16** | Target ketersediaan (*uptime*) sebesar 99%. |
| **NF-17** | Sistem menjalankan *backup* basis data otomatis setiap hari menggunakan *pg_dump*. |
| **NF-18** | Sistem melakukan salinan foto ke *object storage* eksternal (Cloudflare R2 atau S3-compatible). |
| **NF-19** | Peringatan otomatis terpicu jika penggunaan kapasitas VPS mencapai 80%. |

### Maintainability
| ID | Kebutuhan |
|---|---|
| **NF-20** | Kontrak API dengan OpenAPI 3 menjadi sumber kebenaran utama. |
| **NF-21** | Perubahan skema basis data diproses menggunakan Prisma Migrate. |
| **NF-22** | Dokumentasi pada `SCHEMA.md` dan `CHANGELOG.md` diperbarui setiap ada modifikasi skema. |

---

## 4. Kebutuhan Data

Detail spesifik data dirancang dalam dokumen `SCHEMA.md`. Ringkasan entitas utama meliputi:
* `users`
* `refresh_tokens`
* `plants`
* `units`
* `logbook_entries`
* `parameter_electrical`
* `parameter_mechanical`
* `parameter_hydraulic`
* `parameter_operational`
* `incidents`
* `maintenance_records`
* `attachments`
* `inspection_checklists` (**[Fase 2]**)

---

## 5. Antarmuka Eksternal

* **Antarmuka pengguna (UI):** Aplikasi seluler berbasis Flutter untuk Operator; Antarmuka web berbasis React+TS+Vite untuk Supervisor, Manajemen, dan Admin. Input *logbook* di web dilakukan pada Fase 2.
* **Antarmuka API:** *Backend* mengekspos REST API seragam berdasarkan OpenAPI 3 (`API.md`).
* **Antarmuka database:** PostgreSQL diabstraksi melalui Prisma ORM.
* **Antarmuka storage:** Abstraksi penyimpanan foto di *disk* dengan *backup* berkala ke *object storage* eksternal.

---

## 6. Batasan

* Sistem tidak terhubung ke jaringan sensor fisik pembangkit. Data murni dari masukan manual.
* Kapasitas terpasang, debit desain, dan *head* desain dikonfigurasi saat setup awal sebagai data referensi sistem.
* Semua entitas (*logbook*, gangguan, *maintenance*) memiliki fitur *soft delete* untuk menjaga integritas data historis.
