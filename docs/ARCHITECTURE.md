# Arsitektur HYDRO-MON

## 1. Gambaran Umum

HYDRO-MON terdiri dari dua klien dan satu backend:
- Klien Mobile (Flutter) → REST API (Express/Node)
- Klien Web (React) → REST API (Express/Node)
- Backend (Express) → Prisma → PostgreSQL
- Backend → StorageService → Disk VPS
- Reverse Proxy (Caddy) → Backend
- Backup → Object storage eksternal (Cloudflare R2 atau S3-compatible)

## 2. Diagram Arsitektur

```text
+----------+       +---------------+       +------------------+
| Operator | ----> | Flutter App   | ----> |                  |
+----------+       +---------------+       |                  |
                                           |  Internet/HTTPS  |
+------------------------+                 |                  |
| Supervisor/Manajemen   | --------------> |                  |
+------------------------+                 +------------------+
                                                    |
                                                    v
                                           +------------------+
                                           | Caddy Reverse    |
                                           | Proxy / TLS      |
                                           +------------------+
                                                    |
                                                    v
                                           +------------------+
                                           | Express API      |
                                           | Server           |
                                           +------------------+
                                           /                  \
                                          /                    \
                        +------------------+             +-------------------+
                        | Prisma ORM       |             | StorageService    |
                        +------------------+             +-------------------+
                                |                                  |
                                v                                  v
                        +------------------+             +-------------------+
                        | PostgreSQL       |             | Docker Volume:    |
                        | Container        |             | foto              |
                        +------------------+             +-------------------+
                                |                                  |
                                +----------------------------------+
                                                 |
                                                 v
                                           +------------------+
                                           | Backup Berkala   |
                                           +------------------+
                                                 |
                                                 v
                                           +-------------------------------+
                                           | Object Storage Eksternal      |
                                           | (Cloudflare R2/S3-compatible) |
                                           +-------------------------------+
```

## 3. Lapisan (Layers)

### 3.1 Mobile (Flutter)
- Digunakan oleh Operator.
- Menggunakan Dio dengan interceptor untuk mekanisme refresh token (token dikirim via body request).
- Menggunakan Riverpod untuk state management.
- Menggunakan flutter_secure_storage untuk penyimpanan token.
- Menggunakan image_picker dan flutter_image_compress untuk pengambilan serta kompresi foto (maksimal 5 MB per file).
- Menggunakan go_router untuk navigasi antar layar.
- Menggunakan fl_chart untuk grafik dashboard.

### 3.2 Web (React + Vite)
- Dashboard bagi Supervisor, Manajemen, dan Admin.
- Input logbook di web masuk ke Fase 2 (MVP hanya di mobile).
- Menggunakan TanStack Query untuk data fetching, caching, dan polling.
- Menggunakan React Hook Form dan Zod untuk manajemen form.
- Menggunakan Recharts untuk visualisasi grafik.
- Menggunakan Tailwind CSS untuk styling.
- Menggunakan Axios dengan interceptor untuk refresh token (disimpan di cookie httpOnly dengan SameSite=Strict).

### 3.3 Backend (Node.js + Express + TypeScript)
- Menyediakan REST API dengan prefix `/api/v1/`.
- Middleware mencakup autentikasi JWT (access token 15 menit, refresh token 7 hari), RBAC (OPERATOR, SUPERVISOR, MANAGEMENT, ADMIN), Zod validation, Helmet, CORS, rate-limit, dan multer.
- Menyimpan refresh token di database dan di-hash dengan bcrypt.
- Prisma ORM untuk operasi database.
- Antarmuka `StorageService` mengatur unggahan.
- `node-cron` untuk job latar belakang (seperti retensi foto harian).
- `exceljs` dan CSV digunakan untuk export laporan (XLSX dan CSV).

### 3.4 Database (PostgreSQL)
- Berjalan di container terpisah.
- Memiliki constraint unik pada logbook: 1 entri per unit per tanggal per shift.
- Menerapkan soft delete untuk logbook, gangguan, dan maintenance.
- Nilai kapasitas terpasang, debit desain, dan head desain dikonfigurasi saat setup awal pada entitas unit.

### 3.5 Reverse Proxy (Caddy)
- Menangani TLS otomatis melalui Let's Encrypt.
- Bertindak sebagai proxy ke backend Express dan menyajikan file statis web.

## 4. Pemilihan Stack & Alasan

| Lapisan | Teknologi | Alasan Keputusan |
|---|---|---|
| Frontend Web | React + TypeScript + Vite | Standar industri yang solid, TypeScript menjamin keamanan tipe, Vite memberikan waktu build yang cepat. |
| Styling Web | Tailwind CSS | Mempercepat pengembangan UI dengan utility classes. |
| Data Fetching Web | TanStack Query | Optimal untuk dashboard real-time dengan kemudahan polling terintegrasi. |
| Grafik Web | Recharts | Konfigurasi deklaratif yang cocok untuk visualisasi dashboard. |
| Mobile | Flutter (Dart) | Memungkinkan pengembangan cepat UI mobile yang responsif. |
| State Mobile | Riverpod | Aman dari compile-time error dan mudah diuji. |
| HTTP Mobile | Dio | Kaya fitur, mendukung interceptor dan request multipart. |
| Penyimpanan Mobile | flutter_secure_storage | Melindungi token secara aman di keystore/keychain perangkat. |
| Foto Mobile | image_picker + flutter_image_compress | Mengurangi penggunaan bandwidth dan disk server dengan kompresi lokal sebelum upload. |
| Backend | Node.js + Express + TypeScript | Ekosistem sangat besar dan mendukung pengembangan cepat yang type-safe. |
| ORM | Prisma | Type-safe query dan kemudahan penulisan skema dan migrasi. |
| Database | PostgreSQL | Tangguh, handal menjaga integritas data tinggi, dan cocok untuk workload analitik. |
| Autentikasi | JWT + bcrypt | Stateless session mempermudah skalabilitas, bcrypt mengamankan data sensitif. |
| Storage Foto | LocalDiskStorage (VPS) | Hemat biaya awal, penyimpanan difasilitasi oleh Docker volume. |
| Export | exceljs + CSV | Menghasilkan laporan XLSX dan CSV sesuai kebutuhan format pelaporan klien. |
| Deployment | Docker Compose | Orkestrasi container yang portabel dan efisien pada arsitektur server tunggal. |
| Reverse Proxy | Caddy | Mengatur traffic masuk dan memfasilitasi HTTPS dengan otomatisasi Let's Encrypt out-of-the-box. |

## 5. Alur Data Utama

### 5.1 Operator Submit Logbook
1. Operator mengisi form di Flutter. Batas waktu edit logbook adalah 24 jam setelah shift; setelah itu pengeditan hanya dapat dilakukan oleh Supervisor.
2. Flutter memvalidasi input di sisi klien.
3. Dio mengirim `POST /api/v1/logbook` dengan access token.
4. Express memverifikasi JWT dan RBAC.
5. Zod memvalidasi skema payload, termasuk validasi constraint logbook.
6. Prisma menyimpan data secara atomik ke database.
7. Backend mengembalikan status HTTP 201.
8. Aplikasi merender notifikasi keberhasilan.

### 5.2 Dashboard Analytics
1. Klien mengirim request `GET /api/v1/dashboard/summary?unit_id=X`.
2. Express memverifikasi JWT dan RBAC (SUPERVISOR, MANAGEMENT, ADMIN).
3. Backend menghitung metrik analitik:
   - **Availability (%)** = (Running Hours / Jam Periode) × 100
   - **Capacity Factor (%)** = (Energi Aktual kWh / (Kapasitas Terpasang kW × Jam Periode)) × 100
   - **Energy Production** = Σ energy_production_kwh seluruh shift dalam periode
   - **Water Utilization (%)** = (Rata-rata Debit Aktual / Debit Desain) × 100
   - **Performance Trend** = perbandingan metrik bulan berjalan dengan bulan sebelumnya
4. Response JSON dikirim kembali, dan UI memvisualisasikan data pada grafik.

### 5.3 Upload dan Akses Foto
1. Klien memilih foto, yang dikompres di perangkat hingga batas 2 MB.
2. Klien mengirim file menggunakan `multipart/form-data`.
3. Backend memverifikasi JWT, tipe magic bytes (hanya JPEG, PNG, WebP yang diizinkan), dan batas ukuran.
4. `StorageService` menyimpan file di disk VPS, kemudian Prisma mencatat metadatanya.
5. Untuk akses foto, klien meminta file via API, dan backend melakukan pengecekan RBAC sebelum men-stream file ke klien melalui fungsi `StorageService.stream()`.

### 5.4 Retensi Foto (Job Harian)
1. `node-cron` memicu tugas secara berkala setiap hari.
2. Backend mencari foto yang telah berumur lebih dari 3 bulan.
3. Foto yang ditautkan ke kejadian insiden atau gangguan dengan status `OPEN` atau `PROCESS` akan dikecualikan dari proses ini.
4. Foto kandidat akan dihapus dari disk VPS oleh `StorageService.delete()`, dan status di database diperbarui.

### 5.5 Backup Data
1. Proses pg_dump harian diaktifkan untuk mencadangkan database PostgreSQL.
2. Hasil dump beserta seluruh berkas foto disalin dan diunggah secara otomatis ke object storage eksternal (Cloudflare R2 atau S3-compatible).

## 6. StorageService: Keputusan Arsitektur

Antarmuka `StorageService` mengabstraksi lapisan penyimpanan dari logika aplikasi inti untuk mendukung skalabilitas dan fleksibilitas teknis.

```typescript
interface StorageService {
  save(file: Buffer, mimeType: string): Promise<{ path: string; size: number }>;
  stream(path: string): Promise<NodeJS.ReadableStream>;
  delete(path: string): Promise<void>;
  getUsageBytes(): Promise<number>;
}
```

Implementasi `LocalDiskStorage` ditetapkan sebagai mekanisme penyimpanan baku pada Docker Volume. Pola abstraksi ini menunjang transisi ke penyedia *object storage* seperti `S3Storage` di masa depan tanpa mengubah kode implementasi pada tingkat *controller*.

## 7. Kontrak OpenAPI dan Eksekusi Klien
Spesifikasi teknis API didasarkan pada dokumen OpenAPI 3 YAML yang berperan sebagai *Source of Truth*. Kode client TypeScript untuk web dan Dart untuk mobile dihasilkan secara otomatis (code generation) dari spesifikasi ini untuk memastikan konsistensi tipe dan endpoint.

## 8. Struktur Repositori Monorepo

```text
hydro-mon/                    
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── jobs/
│   │   └── utils/
│   ├── prisma/
│   └── package.json
├── web/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── lib/
│   └── package.json
├── mobile/
│   ├── lib/
│   │   ├── features/
│   │   ├── api/
│   │   └── shared/
│   └── pubspec.yaml
├── api-spec/
│   └── openapi.yaml
└── docs/
```

## 9. Deployment

Sistem berjalan secara terpusat pada satu server VPS menggunakan Docker Compose.
- **Spesifikasi Minimum VPS:** 2 vCPU, RAM 4 GB, dan penyimpanan SSD 60 GB.
- **Layanan Inti:** `backend` (Express), `db` (PostgreSQL), `caddy` (reverse proxy).
- **Volume Data:** `postgres_data` dan `photo_storage` (dipisahkan secara mandiri).
- Jaringan bersifat internal untuk keamanan ekstra, hanya Caddy yang bertindak sebagai pintu masuk publik.

## 10. Batasan Arsitektur Dasar

1. **Titik Kegagalan Tunggal:** Arsitektur *deployment* server VPS tunggal menyebabkan ketergantungan *uptime* mutlak pada instans terkait (tanpa replikasi beban horizontal).
2. **Komunikasi Sinkron Interval:** Pendekatan sinkronisasi status analitik (*near real-time*) difasilitasi oleh metode HTTP *polling* demi menjaga simplisitas jaringan dan lapisan infrastruktur (menghindari kompleksitas WebSocket).
3. **Sentralisasi Penyimpanan Lokal:** File media diamankan secara primer pada blok disk server VPS, sementara strategi *backup* harian ke penyimpanan eksternal berfungsi sebagai mitigasi sekunder untuk memastikan keutuhan data.
