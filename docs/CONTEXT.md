# CONTEXT — HYDRO-MON

## 1. Tentang Sistem
HYDRO-MON (Hydro Power Digital Monitoring & Performance System) adalah sistem Digital PLTMH Logbook & Performance Dashboard berbasis web dan mobile. Sistem ini mendigitalisasi pencatatan logsheet operasional PLTMH, menyediakan database terpusat, dan menghadirkan dashboard monitoring kinerja unit bagi supervisor dan manajemen.

## 2. Latar Belakang
Proses pencatatan operasional PLTMH Sampean Baru di masa lalu berjalan sepenuhnya mengandalkan metode manual berbasis kertas dan *spreadsheet*. Pendekatan konvensional tersebut menghasilkan inkonsistensi pendistribusian data, keterlambatan prosedur rekapitulasi, kerumitan audit pencatatan historis, dan ketiadaan instrumen pantau waktu nyata bagi manajemen. Sistem HYDRO-MON diinisiasi secara terpusat untuk mendigitalisasi dan mensistematiskan seluruh siklus operasional tersebut pada sebuah kerangka aplikasi yang terpadu.

## 3. Status Proyek
Tahap spesifikasi. Implementasi kode belum dimulai.

## 4. Arsitektur Repositori
Monorepo dengan tiga bagian:
- `backend/` — API server (Node.js + Express + Prisma)
- `web/` — Dashboard supervisor/manajemen (React + Vite)
- `mobile/` — Aplikasi operator (Flutter)
- `api-spec/` — Kontrak OpenAPI 3
- `docs/` — Dokumentasi teknis

## 5. Stack Teknologi
| Layer | Teknologi |
|---|---|
| Frontend web | React + TypeScript + Vite + Tailwind CSS + TanStack Query + Recharts |
| Mobile | Flutter + Dart + Dio + Riverpod + go_router |
| Backend | Node.js + Express + TypeScript + Prisma + Zod |
| Database | PostgreSQL |
| Autentikasi | JWT + bcrypt + RBAC |
| Kontrak API | OpenAPI 3 |
| Storage foto | Disk VPS via StorageService interface |
| Backup | pg_dump harian + salinan foto ke object storage eksternal |
| Deployment | Docker Compose + Caddy (reverse proxy + TLS) |
| Export | exceljs (XLSX) + CSV |

## 6. Keputusan Desain Utama
| Keputusan | Pilihan |
|---|---|
| Scope mobile | 12 layar untuk operator (input + histori + dashboard ringkas) |
| Scope web | Dashboard monitoring + export; input logbook web di Fase 2 |
| Penyimpanan foto | Disk VPS terpisah dari database (bukan di-blob database) |
| Refresh token web | Cookie httpOnly (SameSite=Strict) |
| Refresh token mobile | Dikirim via body (Flutter tidak menggunakan cookie) |
| Retensi foto | Dihapus otomatis setelah 3 bulan; foto gangguan aktif dikecualikan |
| Soft delete | Logbook, gangguan, maintenance menggunakan soft delete |
| Backup | pg_dump harian + foto ke object storage eksternal |

## 7. Relasi dengan Sistem Lain
HYDRO-MON berdiri mandiri. Tidak ada integrasi sensor atau SCADA. Seluruh data diinput manual oleh operator.
