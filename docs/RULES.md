# RULES — HYDRO-MON

Aturan bisnis, RBAC, dan konvensi kode yang berlaku di project ini.

## 1. Aturan Bisnis Umum

### 1.1 Input data
- Semua data diinput manual oleh operator. Sistem tidak mengasumsikan sensor terhubung.
- Backend memvalidasi setiap nilai numerik parameter terhadap rentang wajar (lihat SCHEMA.md §4). Nilai di luar rentang menghasilkan error 422 dengan pesan spesifik per parameter.
- Satuan parameter harus konsisten di seluruh sistem (lihat SCHEMA.md §4).

### 1.2 Entri logbook
- Sistem hanya menerima satu entri logbook per unit per tanggal per shift. Duplikasi ditolak dengan error 409.
- Operator hanya dapat membuat entri untuk unit yang ditugaskan kepada mereka.
- Operator dapat mengubah entri dalam 24 jam setelah shift. Setelah itu hanya Supervisor.
- Setiap perubahan entri logbook dicatat dalam audit trail (siapa, kapan, dari nilai apa ke apa).
- Menghapus entri logbook adalah soft delete (kolom deleted_at terisi). Data tidak hilang dari database.

### 1.3 Alur status Gangguan
`OPEN → PROCESS → CLOSED`

- OPEN: laporan baru dibuat oleh operator
- PROCESS: sedang ditangani (operator bisa ubah ke PROCESS; Supervisor bisa ubah ke PROCESS atau CLOSED)
- CLOSED: gangguan selesai ditangani (hanya Supervisor)
- Perubahan status balik (mis. CLOSED → PROCESS) hanya oleh Supervisor dengan alasan tercatat.
- Setiap perubahan status dicatat di tabel incident_status_histories.

### 1.4 Alur status Maintenance
`PLAN → PROCESS → COMPLETE`

- PLAN: rencana maintenance dibuat
- PROCESS: maintenance sedang berjalan
- COMPLETE: maintenance selesai
- Hanya Supervisor yang dapat mengubah status maintenance.
- Setiap perubahan status dicatat di tabel maintenance_status_histories.

### 1.5 Foto dan lampiran
- Foto tidak disimpan di database. Database hanya menyimpan metadata (path, tipe, ukuran, pengunggah, waktu).
- Whitelist tipe file: JPEG, PNG, WebP. Validasi berdasarkan isi file (magic bytes), bukan hanya ekstensi.
- Batas ukuran file: 5 MB per lampiran.
- Foto tidak dapat diakses langsung dari URL publik. Harus melalui endpoint terautentikasi.
- Nama file disimpan dengan UUID acak untuk menghindari collision dan mencegah enumerasi.

### 1.6 Retensi foto
- Job harian menghapus file foto yang berumur lebih dari 3 bulan.
- Pengecualian: foto terkait gangguan berstatus OPEN atau PROCESS tidak dihapus.
- Penghapusan hanya menghapus file fisik; record metadata di tabel attachments tetap ada dengan status DELETED_BY_RETENTION dan deleted_at terisi.
- Antarmuka menampilkan keterangan 'Foto telah dihapus sesuai kebijakan retensi' (bukan broken image).
- Job mendukung mode dry-run untuk verifikasi sebelum eksekusi nyata.
- Setiap eksekusi job dicatat (berapa file diperiksa, berapa dihapus, berapa dikecualikan, berapa gagal).
- Data teks (logbook, gangguan, maintenance) tidak ikut dihapus oleh job retensi.

## 2. Matriks Hak Akses RBAC

Tabel:
| Aksi | OPERATOR | SUPERVISOR | MANAGEMENT | ADMIN |
|---|---|---|---|---|
| Login | ✅ | ✅ | ✅ | ✅ |
| Buat entri logbook | ✅ | ✅ | ❌ | ❌ |
| Lihat histori logbook | ✅ | ✅ | ✅ | ✅ |
| Ubah entri logbook | Terbatas* | ✅ | ❌ | ❌ |
| Buat laporan gangguan | ✅ | ✅ | ❌ | ❌ |
| Lihat daftar gangguan | ✅ | ✅ | ✅ | ✅ |
| Ubah status gangguan | Terbatas** | ✅ | ❌ | ❌ |
| Buat/ubah rencana maintenance | ✅ | ✅ | ❌ | ❌ |
| Lihat daftar maintenance | ✅ | ✅ | ✅ | ✅ |
| Ubah status maintenance | ❌ | ✅ | ❌ | ❌ |
| Upload foto | ✅ | ✅ | ❌ | ❌ |
| Lihat foto | ✅ | ✅ | ✅ | ✅ |
| Lihat dashboard web | ❌ | ✅ | ✅ | ✅ |
| Export laporan (XLSX/CSV) | ❌ | ✅ | ✅ | ✅ |
| Kelola pengguna | ❌ | ❌ | ❌ | ✅ |
| Kelola unit/plant | ❌ | ❌ | ❌ | ✅ |

*Operator dapat mengubah entri logbook dalam 24 jam setelah shift.
**Operator dapat mengubah status gangguan ke PROCESS saja.

## 3. Rumus Analytics
 
### 3.1 Availability & Running Hours
- `Running Hours (Shift) = hour_meter_end - hour_meter_start` (maksimal 8.0 jam per shift).
- `Availability (%) = (Σ Running Hours dalam Periode / Jam Periode) × 100`.
- *Catatan Pergantian Shift:* Setiap operator memiliki akun unik. Saat membuka form input, nilai `hour_meter_start` ditarik otomatis dari `hour_meter_end` entri shift terakhir pada unit tersebut.

### 3.2 Capacity Factor
`Capacity Factor (%) = (Energi Aktual / (Kapasitas Terpasang × Jam Periode)) × 100`

### 3.3 Energy Production
`Energy Production = Σ energy_production_kwh dalam periode`

### 3.4 Water Utilization
`Water Utilization (%) = (Rata-rata Debit Aktual / Debit Desain) × 100`

### 3.5 Performance Trend
`Performance Trend = perbandingan KPI bulan berjalan vs bulan sebelumnya`

Catatan: Kapasitas terpasang dan debit desain diambil dari tabel plants/units yang dikonfigurasi saat setup awal.

## 4. Konvensi Kode

### 4.1 Backend
- Setiap route mengembalikan response JSON dengan envelope standar: `{ statusCode, success, message, data }` untuk sukses (2xx) atau `{ statusCode, success, error, message, details }` untuk gagal (4xx/5xx).
- Validasi input dengan Zod di middleware.
- Akses database melalui Prisma ORM.
- Setiap endpoint yang membutuhkan autentikasi menggunakan middleware JWT.
- Penamaan endpoint: REST standar.
- Semua file upload melewati multer → validasi magic bytes.

### 4.2 Frontend Web
- State management dan data fetching dengan TanStack Query.
- Form dengan React Hook Form + Zod.
- Interceptor axios/fetch menangani silent refresh token.

### 4.3 Mobile
- State management dengan Riverpod.
- HTTP dengan Dio + interceptor untuk refresh token otomatis.
- Token disimpan di flutter_secure_storage.
- Navigasi dengan go_router.
- Foto dikompres dengan flutter_image_compress sebelum dikirim.

### 4.4 Kontrak API
- OpenAPI 3 adalah sumber kebenaran untuk kontrak API.
- Klien Dart dan TypeScript dibuat otomatis dari spec.
- Refresh token dikirim via body untuk kompatibilitas Flutter.

### 4.5 Struktur repositori
```
hydro-mon/
├── backend/          # Node.js + Express + Prisma
├── web/              # React + Vite (dashboard supervisor/manajemen)
├── mobile/           # Flutter (aplikasi operator)
├── api-spec/         # OpenAPI 3 YAML/JSON (sumber kebenaran kontrak)
└── docs/             # Dokumentasi teknis
```

## 5. Standar Pengujian & CI/CD Gate (Quality Gate)

Untuk menjaga stabilitas aplikasi di setiap platform, berlaku prinsip **"No Test, No Merge"**.

### 5.1 Kewajiban Pengujian Tiap Platform
- **Backend (`backend/`)**:
  - Wajib lulus TypeScript Typecheck (`npx tsc --noEmit`).
  - Setiap endpoint baru atau perubahan logika wajib disertai **Unit Test** atau **Integration Test** menggunakan Vitest + Supertest.
  - Pengujian integrasi database wajib memverifikasi migrasi Prisma & seed data.
  - Wajib lolos build check (`npm run build`).
- **Web Frontend (`web/`)**:
  - Wajib lulus TypeScript Typecheck & Vite build (`npm run build`).
  - Form transaksi & validasi input wajib memiliki pengujian komponen untuk mencegah submit ganda dan input tidak valid.
- **Mobile Client (`mobile/`)**:
  - Wajib lolos analisis kode statis (`flutter analyze`) tanpa error atau peringatan kritis.
  - Pengujian logika state management dan serialisasi JSON model (`flutter test`).

### 5.2 Kebijakan Branch & Merge
- Setiap pengembang bebas membuat feature branch atau sub-branch (misal `feat/*`, `bugfix/*`).
- Setiap `git push` atau pembuatan Pull Request (PR) ke branch tujuan manapun secara otomatis memicu **GitHub Actions CI**.
- PR hanya boleh di-merge jika seluruh job CI pada platform terkait berstatus **HIJAU (PASSED)**.

