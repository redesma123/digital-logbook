# DESIGN — HYDRO-MON

## 1. Prinsip Desain
- Operator lapangan: antarmuka sesederhana mungkin, form cepat diisi, sedikit ketikan.
- Supervisor/Manajemen: informasi padat, mudah dibaca sekilas, grafik informatif.
- Feedback status visual: warna konsisten (Running=hijau, Standby=kuning, Trip=merah, Offline=abu-abu).
- Pesan error dalam Bahasa Indonesia yang jelas.

## 2. Pembagian Scope
- Mobile (Flutter): 12 layar utama untuk operator.
- Web (React): Dashboard untuk supervisor/manajemen dan Panel Admin. Input logbook di web direncanakan untuk Fase 2.

## 3. Alur Pengguna per Peran

### 3.1 Alur Operator (Mobile)
```
Splash → Login → Beranda
                     ├──► Input Logbook → Detail Logbook
                     ├──► Histori Logbook → Detail Logbook
                     ├──► Input Gangguan → Daftar Gangguan
                     ├──► Input Maintenance → Daftar Maintenance
                     ├──► Dashboard Unit
                     └──► Profil & Pengaturan → Logout
```

### 3.2 Alur Supervisor (Web)
```
Login Web → Dashboard (status + tabel + grafik)
              ├──► Filter periode → update grafik
              ├──► Daftar gangguan → detail → ubah status
              ├──► Daftar maintenance → detail → ubah status
              ├──► Analytics → Availability, Capacity Factor, dll.
              └──► Export → download XLSX/CSV
```

### 3.3 Alur Manajemen (Web)
```
Login Web → Dashboard read-only
              ├──► Lihat status + parameter terkini
              ├──► Lihat grafik produksi energi
              ├──► Lihat analytics kinerja
              └──► Export laporan
```

### 3.4 Alur Admin (Web)
```
Login Web → Panel Admin
              ├──► Kelola pengguna (tambah, nonaktifkan, ubah peran)
              └──► Kelola unit/plant (tambah, ubah kapasitas/parameter desain)
```

## 4. Dokumentasi 12 Layar Mockup (Mobile Flutter)

### Layar 1: Splash Screen
- **Tujuan:** Loading awal, validasi token tersimpan.
- **Aksi:** Redirect ke Beranda jika token valid, ke Login jika tidak.

### Layar 2: Login
- **Tujuan:** Autentikasi.
- **Elemen:** Username, password, tombol Login. Akun dibuat oleh Admin.

### Layar 3: Beranda
- **Tujuan:** Hub utama operator.
- **Elemen:** Status unit, menu cepat (Logbook, Gangguan, Maintenance, Histori), ringkasan kondisi, navigasi bawah.

### Layar 4: Input Logbook
- **Tujuan:** Formulir logsheet shift.
- **Elemen:** Pemilihan waktu & status, input Electrical, Mechanical, Hydraulic, Operational. Foto dan catatan.

### Layar 5: Detail Logbook
- **Tujuan:** Melihat entri logbook lengkap.
- **Elemen:** Data parameter, galeri foto. Tombol Edit tersedia jika dalam batas waktu 24 jam.

### Layar 6: Histori Logbook
- **Tujuan:** Daftar logbook dengan filter.
- **Elemen:** Filter tanggal, shift, status. Daftar entri ringkas.

### Layar 7: Input Gangguan
- **Tujuan:** Laporan gangguan baru.
- **Elemen:** Waktu, peralatan, jenis gangguan, deskripsi, tindakan.

### Layar 8: Daftar Gangguan
- **Tujuan:** Daftar gangguan.
- **Elemen:** Filter status (OPEN, PROCESS, CLOSED).

### Layar 9: Input Maintenance
- **Tujuan:** Formulir maintenance.
- **Elemen:** Peralatan, jenis pekerjaan, pelaksana, tanggal.

### Layar 10: Daftar Maintenance
- **Tujuan:** Rekaman maintenance.
- **Elemen:** Filter status (PLAN, PROCESS, COMPLETE).

### Layar 11: Dashboard Unit
- **Tujuan:** Ringkasan kinerja di mobile.
- **Elemen:** Parameter utama dan grafik ringkas.

### Layar 12: Profil & Pengaturan
- **Tujuan:** Info akun dan logout.
- **Elemen:** Data user, versi aplikasi, tombol Logout.

## 5. Web Dashboard & Panel Admin

### 5.1 Layout Umum
- Header: Nama sistem, profil pengguna.
- Navigasi: Dashboard, Gangguan, Maintenance, Analytics, Export, Admin (khusus ADMIN).

### 5.2 Dashboard Utama
- Status unit terkini dan waktu update terakhir.
- Tabel parameter: Power, Voltage, Frequency, Flow, Water Level, Energy.
- Grafik: Tren parameter dan produksi energi.
- Filter periode dan Export (XLSX/CSV).

### 5.3 Analytics
- KPI: Availability (%), Capacity Factor (%), Total Energi (kWh), Water Utilization (%).
- Grafik trend: Perbandingan antar periode.

### 5.4 Panel Admin
- Kelola Pengguna: Tambah, edit, ubah peran, nonaktifkan akun.
- Kelola Unit: Konfigurasi kapasitas terpasang, debit desain, head desain, dan parameter teknis lainnya.
