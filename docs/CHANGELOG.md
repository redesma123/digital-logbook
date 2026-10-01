# CHANGELOG — HYDRO-MON

Format: [Keep a Changelog](https://keepachangelog.com/).
Versi mengikuti [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Dokumentasi
-  Seluruh dokumentasi proyek ditulis ulang untuk produk **HYDRO-MON
  (Digital PLTMH Logbook & Performance Dashboard)**
  dari CV. Rekayasa Desain Manufaktur (REDESMA).
- Dokumentasi ini menjadi acuan definitif (Single Source of Truth) untuk implementasi sistem, menetapkan arsitektur monorepo, spesifikasi API, aturan bisnis, dan komponen UI.
- Semua ambiguitas diselesaikan dengan spesifikasi yang tegas (tidak ada asumsi atau open question yang menggantung).
- Menambahkan `hour_meter_start`, `hour_meter_end`, dan `running_hours` pada skema database `logbook_entries`, spesifikasi API endpoint `/logbook`, serta penambahan endpoint `GET /logbook/latest-counter` untuk mendukung alur operan shift antar operator.
- Menstandarisasi seluruh format response API dengan envelope JSON terpadu yang selalu menyertakan `statusCode`, `success`, `message`, dan `data` (atau `error` + `details`).
- Menghapus ketergantungan Docker dan beralih ke arsitektur deployment Native OS (PM2 + PostgreSQL native + Caddy) untuk efisiensi memori pada server/VPS 1 GB RAM atau PC kantor.

### Status Implementasi
- Tahap spesifikasi dokumentasi selesai. Implementasi kode belum dimulai.

---

