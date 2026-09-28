# HYDRO-MON (Hydro Power Digital Monitoring & Performance System)

## Gambaran Umum
HYDRO-MON merupakan platform terintegrasi untuk digitalisasi pencatatan operasional (*Logbook*) dan pemantauan kinerja PLTMH. Sistem ini dirancang untuk memfasilitasi pencatatan data secara komprehensif, mendigitalisasi proses kerja, serta menyediakan instrumen pengawasan dan analisis metrik operasional terpusat bagi pihak manajemen.

## Arsitektur Sistem
Sistem mengadopsi arsitektur *monorepo* yang terdiri dari tiga komponen utama:
1. **Backend API**: Layanan REST API berbasis Node.js, Express, TypeScript, dan Prisma ORM.
2. **Klien Web (Dashboard)**: Antarmuka pemantauan berbasis React, TypeScript, dan Vite untuk *supervisor* dan manajemen.
3. **Klien Mobile**: Aplikasi seluler berbasis Flutter untuk sarana masukan data oleh operator lapangan.

## Struktur Repositori
```text
hydro-mon/                    
├── backend/            # Layanan API Server & manajemen database
├── web/                # Antarmuka web dashboard
├── mobile/             # Aplikasi seluler operator
├── api-spec/           # Spesifikasi OpenAPI 3
└── docs/               # Dokumentasi teknis sistem
```

## Persyaratan Lingkungan
- **Node.js**: Versi 18 atau lebih tinggi
- **PostgreSQL**: Versi 14 atau lebih tinggi
- **Flutter SDK**: Versi 3.x
- **Docker & Docker Compose**: Untuk keperluan *deployment*

## Referensi Dokumentasi
Seluruh rincian spesifikasi teknis dan aturan bisnis didokumentasikan pada direktori `docs/`:
- `ARCHITECTURE.md` — Rancangan arsitektur, lapisan sistem, dan keputusan teknis.
- `CONTEXT.md` — Latar belakang, sasaran, dan ruang lingkup pengembangan.
- `DESIGN_SYSTEM.md` — Standarisasi komponen antarmuka, warna, dan prinsip tipografi.
- `SCHEMA.md` — Definisi struktur tabel, relasi, dan rincian tipe data.
- `SRS.md` — *Software Requirements Specification* (Kebutuhan fungsional & non-fungsional).
- `CHANGELOG.md` — Riwayat perubahan dan jejak rilis.

