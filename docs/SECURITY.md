# SECURITY — HYDRO-MON

## 1. Threat Model Singkat

| Aset | Ancaman | Mitigasi |
| --- | --- | --- |
| Data logbook operasional | Akses tidak sah, manipulasi data | RBAC + JWT + validasi server |
| Kredensial pengguna | Brute force, credential leak | bcrypt, rate limiting, HTTPS |
| File foto | Akses publik tanpa izin, upload berbahaya | Endpoint terautentikasi, validasi magic bytes |
| Database | SQL injection, akses langsung dari luar | Prisma ORM, DB terisolasi dari internet |
| VPS | Akses tidak sah ke server | SSH key, firewall, update rutin |
| Token JWT | Pencurian token | HTTPS, token berumur pendek, refresh token di DB |

## 2. Autentikasi
- **Access Token (JWT)**: Berlaku 15 menit.
- **Refresh Token**: Berlaku 7 hari, disimpan di database untuk memungkinkan pencabutan (revoke) dan force logout.
- **Password Hashing**: Menggunakan bcrypt dengan 12 salt rounds.
- **Klien Web**: Refresh token disimpan di cookie `httpOnly` dengan atribut `SameSite=Strict`. Perlindungan CSRF ditangani oleh kombinasi `SameSite=Strict` dan CORS.
- **Klien Mobile (Flutter)**: Refresh token disimpan di `flutter_secure_storage` dan dikirim melalui body request.
- **Logout**: Endpoint logout menghapus refresh token dari database klien yang bersangkutan.

## 3. Otorisasi (RBAC)
- Middleware RBAC dieksekusi setelah middleware validasi JWT.
- Setiap endpoint mendefinisikan secara tegas peran yang diizinkan (OPERATOR, SUPERVISOR, MANAGEMENT, ADMIN).

## 4. Keamanan Upload Foto
- **Validasi**: Berdasarkan isi file (magic bytes). Whitelist format yang didukung: JPEG, PNG, WebP.
- **Batas Ukuran**: 5 MB per file.
- **Penyimpanan**: Disimpan dengan nama UUID acak agar tidak dapat ditebak. File tidak diakses melalui URL publik atau folder statis.
- **Akses**: Endpoint GET foto memverifikasi JWT dan hak akses sebelum melakukan streaming file. Backend bertindak sebagai proxy dari disk ke klien.

## 5. Keamanan HTTP
- **Security Headers**: Diimplementasikan menggunakan Helmet (X-Frame-Options, X-Content-Type-Options, CSP, dll.).
- **Rate Limiting**:
  - Endpoint login: 5 request / 15 menit per IP.
  - Endpoint upload: 20 request / menit per pengguna.
  - API umum: 100 request / menit per pengguna.
- **CORS**: Mengizinkan origin spesifik secara ketat.
- **Body Size Limit**: 10 MB untuk endpoint upload, 1 MB untuk endpoint lainnya.

## 6. Audit dan Log
- **Riwayat Perubahan**: Setiap perubahan status gangguan dicatat di `incident_status_histories` dan status maintenance di `maintenance_status_histories`.
- **Logbook Audit**: Perubahan entri logbook dicatat pada tabel `audit_logs`.
- **Aktivitas Sistem**: Job retensi foto mencatat setiap file yang dihapus secara terstruktur.
- **API Access Log**: Setiap request API dicatat (minimal memuat method, path, status code, dan durasi).

## 7. Hardening VPS
- **Akses Server**: SSH hanya menggunakan autentikasi kunci (password dinonaktifkan).
- **Firewall**: Menggunakan UFW, hanya port 80, 443, dan port SSH kustom yang terbuka.
- **Isolasi Database**: PostgreSQL berjalan secara lokal (127.0.0.1:5432) dan hanya menerima koneksi internal dari backend lokal, tidak terekspos ke port publik/internet.
- **Proses Non-Root**: Backend Express dijalankan oleh PM2 di bawah akun user sistem non-root (hydroapp), membatasi hak akses pada sistem operasi.
- **Reverse Proxy**: Caddy menangani proxy ke backend dengan TLS otomatis dari Let's Encrypt.
- **Manajemen Rahasia**: Environment variables sensitif disimpan dalam file `.env` di server dan tidak di-commit ke repositori.

## 8. Backup dan Retensi
- **Database**: Pencadangan dilakukan via `pg_dump` harian secara otomatis.
- **File Foto**: Disalin secara berkala ke object storage eksternal (S3-compatible).
- **Alur Retensi**: Backup foto dieksekusi sebelum job retensi berjalan, memastikan data historis tercadangkan sebelum dihapus dari disk lokal.
- **Pemantauan Disk**: Alert aktif ketika kapasitas disk mencapai 80%.

## 9. Trade-off Teknis (Risiko yang Dikelola)
- **Single Point of Failure Hardware**: Menggunakan satu VPS. Risiko dikelola melalui backup harian ke object storage eksternal. Arsitektur ini cukup dan memadai untuk beban sistem skala satu PLTMH.
- **Tanpa Web Application Firewall (WAF) Khusus**: Perlindungan difokuskan pada level aplikasi melalui Helmet, rate limiting, validasi input ketat, dan Prisma ORM.
