# Product Requirements Document (PRD) — HYDRO-MON

## 1. Ringkasan Produk
**HYDRO-MON (Hydro Power Digital Monitoring & Performance System)** adalah sistem Digital PLTMH Logbook & Performance Dashboard berbasis web dan mobile untuk mendigitalisasi logsheet operasional, menyediakan dashboard monitoring, serta melakukan analisis kinerja PLTMH.

Sistem terdiri dari tiga komponen utama:
1. **Mobile Application (Flutter)**: Aplikasi Android bagi operator untuk mencatat logsheet, melaporkan gangguan, dan mencatat pemeliharaan dari lapangan.
2. **Backend API (Node.js/Express/PostgreSQL/Prisma)**: Server utama penyedia layanan data, logika bisnis, dan autentikasi.
3. **Web Dashboard (React+TS+Vite)**: Antarmuka web bagi supervisor dan manajemen untuk memonitor kondisi pembangkit, melihat grafik performa, dan mengunduh laporan.

## 2. Latar Belakang & Masalah
Sistem operasional saat ini memiliki kendala yang diselesaikan melalui HYDRO-MON:
1. **Data tidak terpusat**: Logsheet berbasis kertas menyulitkan pelacakan.
2. **Risiko data hilang**: Pencatatan manual rentan *human error* dan kehilangan fisik.
3. **Rekapitulasi lambat**: Rekap data membutuhkan waktu berjam-jam.
4. **Analisis historis sulit**: Data terpisah tidak memungkinkan analisis tren operasi secara cepat.
5. **Degradasi performa sulit dideteksi**: Tanpa visualisasi, penurunan performa sulit diketahui secara dini.
6. **Kondisi unit tidak real-time**: Pembaruan status mesin di lapangan lambat.
7. **Informasi ke manajemen tertunda**: Birokrasi manual menunda aliran informasi krusial.

## 3. Target Pengguna
Sistem menggunakan Role-Based Access Control (RBAC) dengan empat peran resmi:

- **Operator**: Pengguna lapangan yang bekerja dalam *shift*. Menggunakan Mobile App untuk memasukkan parameter operasional, melaporkan masalah, mengubah status, serta mengunggah foto.
- **Supervisor**: Menggunakan Mobile atau Web untuk mengelola status laporan gangguan/maintenance dan mengekspor data laporan.
- **Manajemen**: Menggunakan Web Dashboard untuk memantau performa, melihat grafik tren, ketersediaan mesin, produksi energi, dan mengunduh laporan tanpa akses input data.
- **Admin**: Mengelola akun pengguna, mengatur master data unit, dan melakukan konfigurasi dasar sistem.

## 4. Tujuan (Goals)
1. Mendigitalisasi proses pencatatan logsheet PLTMH secara penuh.
2. Menyediakan database operasi yang terpusat.
3. Mempermudah operator mencatat logsheet melalui smartphone.
4. Menyediakan dashboard monitoring kondisi dan kinerja unit.
5. Menyediakan histori data operasi untuk pelacakan dan perbandingan.
6. Mempercepat pembuatan laporan dengan otomatisasi format siap *export*.
7. Mengidentifikasi penurunan performa melalui grafik analitik.
8. Menyediakan data historis gangguan dan perawatan untuk dasar pengambilan keputusan maintenance.

## 5. Manfaat per Peran
| Peran | Manfaat Utama |
|---|---|
| **Operator** | Pencatatan cepat dan terstruktur, histori operasional mudah dilihat saat operan *shift*. |
| **Supervisor** | Pelacakan penanganan gangguan mudah, rekap laporan efisien, monitoring unit jarak jauh. |
| **Manajemen** | Pemantauan performa instan melalui KPI tanpa menunggu laporan manual. |
| **Admin** | Manajemen akses pengguna dan konfigurasi sistem secara terpusat dan aman. |

## 6. Novelty (Kebaruan)
1. **Integrated Digital Logbook**: Data operasional harian, insiden, dan pemeliharaan terpusat dalam satu database.
2. **Informasi Manajemen Instan**: Transisi informasi langsung dari operator ke dashboard manajemen.
3. **Performance Analytics**: Penyediaan analitik lanjutan meliputi metrik *Availability*, *Capacity Factor*, *Energy Production*, *Water Utilization*, dan *Performance Trend*.
4. **Digital History per unit**: Rekam jejak individu setiap unit pembangkit untuk kemudahan audit.

## 7. KPI dan Cara Ukurnya
Target sistem yang akan dicapai:
| KPI | Target | Cara Mengukur |
|---|---|---|
| Digitalisasi logsheet | >95% | Persentase *shift* yang input logsheet hariannya tersimpan dalam sistem. |
| Pengurangan waktu rekap | >70% | Durasi ekspor data web vs rekap manual menggunakan Excel. |
| Data tersimpan digital | 100% | Seluruh *record* operasi dan insiden tersimpan di database. |
| Laporan otomatis | >90% | Persentase laporan yang dihasilkan lewat *export* web tanpa rekap pihak ketiga. |
| Histori gangguan | 100% | Seluruh *incident status* beserta perubahannya terekam akurat. |
| Monitoring performance | Near real-time | *Delay* minimal saat data tersedia di dashboard setelah diinput. |
| Availability tracking | 100% | Ketersediaan pencatatan waktu operasi untuk seluruh unit. |

## 8. Scope MVP (Harus selesai sebelum 9 Oktober 2026)
Ruang lingkup untuk rilis awal:
- **Login dan RBAC**: Backend, Web, Mobile.
- **Input logbook semua parameter**: Mobile (Electrical, Mechanical, Hydraulic, Operational).
- **Histori logbook**: Mobile, Web.
- **Input dan daftar gangguan**: Mobile (status Open, Process, Closed).
- **Input dan daftar maintenance**: Mobile (status Plan, Process, Complete).
- **Upload foto**: Mobile (terkompresi maksimal 5MB per file).
- **Dashboard Web**: Web (status unit, parameter utama, grafik dasar).
- **Export data XLSX+CSV**: Web.
- **Analytics dasar**: Web (Availability, Capacity Factor, Energy Production, Water Utilization, Performance Trend). Rumus baku telah ditetapkan.
- **Job retensi foto**: Backend otomatis menghapus foto berumur lebih dari 3 bulan (kecuali pada gangguan berstatus Open/Process).
- **SOP dan training**: Dokumentasi operasional dan materi pelatihan.

## 9. Fase 2 / Bila Waktu Cukup
- Input logbook melalui Web Dashboard
- Login biometrik di mobile
- Notifikasi *push* (FCM)
- *Checklist* inspeksi spesifik
- Mode *offline-first* di Flutter
- Laporan otomatis terjadwal via email
- Analitik tingkat lanjut

## 10. Non-Goals (Versi Ini)
- Integrasi perangkat sensor fisik atau SCADA.
- Pemantauan berbasis IoT *real-time*.
- Kontrol aktuator peralatan jarak jauh.
- Pembuatan laporan regulasi pihak luar.
- Skalabilitas multi-site.
- Audit keamanan keuangan.

## 11. Timeline
| Tanggal | Milestone |
|---|---|
| 25 Sep 2026 | Kick-off Proyek (Mulai) |
| 26-27 Sep 2026 | Finalisasi dokumen PRD & Arsitektur |
| 28 Sep - 2 Okt 2026 | Implementasi Backend & API |
| 28 Sep - 4 Okt 2026 | Implementasi Mobile App (paralel) |
| 3-7 Okt 2026 | Implementasi Web Dashboard (paralel) |
| 7-8 Okt 2026 | Integrasi End-to-End, testing, bug fixing |
| 9 Okt 2026 | Serah Terima Produk (MVP) |

## 12. Deliverables
Luaran akhir proyek:
1. Website Dashboard siap akses.
2. Aplikasi Android (APK).
3. Draft Standard Operating Procedure (SOP).
4. Materi pelatihan.
5. Dokumen spesifikasi teknis (termasuk PRD ini).

## 13. Risiko Jadwal
Tenggat waktu yang padat (9 Oktober 2026) memerlukan mitigasi tegas:
- Jika waktu tidak memadai, fitur input logbook via web, checklist inspeksi, dan analitik lanjutan dipindah ke Fase 2. Web akan berfokus penuh sebagai *monitoring dashboard*.
