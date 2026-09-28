# Spesifikasi Skema Database HYDRO-MON

Dokumen ini mendefinisikan skema database untuk sistem HYDRO-MON (Hydro Power Digital Monitoring & Performance System). Database yang digunakan adalah PostgreSQL dan dikelola menggunakan Prisma ORM.

## 1. ERD (Entity Relationship Diagram)

Berikut adalah ilustrasi relasi antar entitas dalam database:

```text
+-----------------------+       +-------------------+
|        plants         | 1---* |       units       |
+-----------------------+       +-------------------+
                                          | 1
                                          |
          +-------------------------------+-------------------------------+
        * |                             * |                             * |
+-------------------+             +---------------+           +-----------------------+
|  logbook_entries  |             |   incidents   |           |  maintenance_records  |
+-------------------+             +---------------+           +-----------------------+
  | 1       | * (FK operator)       | 1     | * (FK reporter)   | 1     | * (created_by)
  |         |                       |       |                   |       |
  |         +---------+   +---------+       |       +-----------+       |
  |                   |   |                 |       |                   |
  | 1               * |   | *             * |       | *               * |
  +-[params_electrical]   |         +-------+-------+                   |
  | 1                     |         |                                   |
  +-[params_mechanical]   +-----[users] 1---* [refresh_tokens]          |
  | 1                     |         |                                   |
  +-[params_hydraulic]    |         | * (FK uploaded_by_id)             |
                          |         |                                   |
                          +---------|-----------------------------------+
                                  * |
                          +-------------------+
                          |    attachments    | (Polymorphic: opsional FK ke logbook/incident/maintenance)
                          +-------------------+
```

## 2. Skema Prisma Lengkap

Berikut adalah skema Prisma sistem:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ENUMERATIONS
enum Role {
  OPERATOR
  SUPERVISOR
  MANAGEMENT
  ADMIN
}

enum UnitStatus {
  RUNNING
  STANDBY
  TRIP
  OFFLINE
}

enum Shift {
  PAGI
  SIANG
  MALAM
}

enum IncidentStatus {
  OPEN
  PROCESS
  CLOSED
}

enum MaintenanceStatus {
  PLAN
  PROCESS
  COMPLETE
}

enum AttachmentStatus {
  ACTIVE
  DELETED_BY_RETENTION
}

enum AttachmentRelatedTo {
  LOGBOOK
  INCIDENT
  MAINTENANCE
}

// MODELS

model users {
  id            Int       @id @default(autoincrement())
  username      String    @unique
  password_hash String
  full_name     String
  role          Role
  is_active     Boolean   @default(true)
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt

  // Relations
  refresh_tokens               refresh_tokens[]
  logbook_entries              logbook_entries[]
  reported_incidents           incidents[]                    @relation("IncidentReporter")
  incident_status_histories    incident_status_histories[]    @relation("IncidentStatusChanger")
  created_maintenance_records  maintenance_records[]          @relation("MaintenanceCreator")
  maintenance_status_histories maintenance_status_histories[] @relation("MaintenanceStatusChanger")
  attachments                  attachments[]
}

model refresh_tokens {
  id         Int      @id @default(autoincrement())
  token      String   @unique
  user_id    Int
  expires_at DateTime
  created_at DateTime @default(now())

  user users @relation(fields: [user_id], references: [id], onDelete: Cascade)
}

model plants {
  id               Int      @id @default(autoincrement())
  name             String
  location         String
  capacity_kw      Float?
  design_flow_m3s  Float?
  design_head_m    Float?
  created_at       DateTime @default(now())
  updated_at       DateTime @updatedAt

  units units[]
}

model units {
  id             Int        @id @default(autoincrement())
  plant_id       Int
  unit_code      String
  name           String
  current_status UnitStatus @default(STANDBY)
  created_at     DateTime   @default(now())
  updated_at     DateTime   @updatedAt

  plant               plants                @relation(fields: [plant_id], references: [id])
  logbook_entries     logbook_entries[]
  incidents           incidents[]
  maintenance_records maintenance_records[]
}

model logbook_entries {
  id          Int        @id @default(autoincrement())
  unit_id     Int
  operator_id Int
  date        DateTime   @db.Date
  shift       Shift
  unit_status UnitStatus
  notes       String?
  created_at  DateTime   @default(now())
  updated_at  DateTime   @updatedAt
  deleted_at  DateTime?

  // Relations
  unit              units              @relation(fields: [unit_id], references: [id])
  operator          users              @relation(fields: [operator_id], references: [id])
  params_electrical params_electrical?
  params_mechanical params_mechanical?
  params_hydraulic  params_hydraulic?
  attachments       attachments[]

  @@unique([unit_id, date, shift])
}

model params_electrical {
  id                    Int     @id @default(autoincrement())
  logbook_id            Int     @unique
  voltage_v             Float?
  current_a             Float?
  frequency_hz          Float?
  active_power_kw       Float?
  reactive_power_kvar   Float?
  power_factor          Float?
  energy_production_kwh Float?
  generator_status      String?

  logbook logbook_entries @relation(fields: [logbook_id], references: [id])
}

model params_mechanical {
  id               Int    @id @default(autoincrement())
  logbook_id       Int    @unique
  rpm              Float?
  bearing_temp_c   Float?
  generator_temp_c Float?
  turbine_temp_c   Float?
  vibration_mms    Float?

  logbook logbook_entries @relation(fields: [logbook_id], references: [id])
}

model params_hydraulic {
  id               Int     @id @default(autoincrement())
  logbook_id       Int     @unique
  flow_rate_m3s    Float?
  water_level_m    Float?
  head_m           Float?
  pressure_bar     Float?
  intake_condition String?

  logbook logbook_entries @relation(fields: [logbook_id], references: [id])
}

model incidents {
  id              Int            @id @default(autoincrement())
  unit_id         Int
  reported_by_id  Int
  occurred_at     DateTime
  equipment       String
  incident_type   String
  description     String
  operator_action String?
  status          IncidentStatus @default(OPEN)
  resolved_at     DateTime?
  created_at      DateTime       @default(now())
  updated_at      DateTime       @updatedAt
  deleted_at      DateTime?

  unit             units                       @relation(fields: [unit_id], references: [id])
  reporter         users                       @relation("IncidentReporter", fields: [reported_by_id], references: [id])
  status_histories incident_status_histories[]
  attachments      attachments[]
}

model incident_status_histories {
  id            Int             @id @default(autoincrement())
  incident_id   Int
  changed_by_id Int
  from_status   IncidentStatus?
  to_status     IncidentStatus
  changed_at    DateTime        @default(now())
  notes         String?

  incident incidents @relation(fields: [incident_id], references: [id])
  changer  users     @relation("IncidentStatusChanger", fields: [changed_by_id], references: [id])
}

model maintenance_records {
  id            Int               @id @default(autoincrement())
  unit_id       Int
  created_by_id Int
  equipment     String
  work_type     String
  description   String
  technician    String?
  planned_date  DateTime?
  status        MaintenanceStatus @default(PLAN)
  created_at    DateTime          @default(now())
  updated_at    DateTime          @updatedAt
  deleted_at    DateTime?

  unit             units                          @relation(fields: [unit_id], references: [id])
  creator          users                          @relation("MaintenanceCreator", fields: [created_by_id], references: [id])
  status_histories maintenance_status_histories[]
  attachments      attachments[]
}

model maintenance_status_histories {
  id             Int               @id @default(autoincrement())
  maintenance_id Int
  changed_by_id  Int
  from_status    MaintenanceStatus?
  to_status      MaintenanceStatus
  changed_at     DateTime          @default(now())
  notes          String?

  maintenance maintenance_records @relation(fields: [maintenance_id], references: [id])
  changer     users               @relation("MaintenanceStatusChanger", fields: [changed_by_id], references: [id])
}

model attachments {
  id               Int                 @id @default(autoincrement())
  related_to       AttachmentRelatedTo
  logbook_id       Int?
  incident_id      Int?
  maintenance_id   Int?
  filename_stored  String
  original_filename String
  file_path        String
  mime_type        String
  file_size_bytes  Int
  uploaded_by_id   Int
  uploaded_at      DateTime            @default(now())
  status           AttachmentStatus    @default(ACTIVE)
  deleted_at       DateTime?

  uploader    users                @relation(fields: [uploaded_by_id], references: [id])
  logbook     logbook_entries?     @relation(fields: [logbook_id], references: [id])
  incident    incidents?           @relation(fields: [incident_id], references: [id])
  maintenance maintenance_records? @relation(fields: [maintenance_id], references: [id])
}
```

## 3. Penjelasan Tabel Per Entitas

### users
Entitas untuk menyimpan data pengguna dengan Role Based Access Control (RBAC).

| Kolom | Tipe | Keterangan | Constraint |
|---|---|---|---|
| id | Int | Primary Key | Auto Increment |
| username | String | Nama pengguna untuk login | Unique |
| password_hash | String | Password terenkripsi | - |
| full_name | String | Nama lengkap pengguna | - |
| role | Role | Peran pengguna (OPERATOR, SUPERVISOR, MANAGEMENT, ADMIN) | Enum |
| is_active | Boolean | Status aktif akun | Default: true |
| created_at, updated_at | DateTime | Timestamp standar | - |

### refresh_tokens
Entitas untuk menyimpan refresh token untuk sesi login.

| Kolom | Tipe | Keterangan | Constraint |
|---|---|---|---|
| id | Int | Primary Key | Auto Increment |
| token | String | Refresh token JWT | Unique |
| user_id | Int | Pemilik token | FK ke users, OnDelete: Cascade |
| expires_at | DateTime | Waktu kadaluwarsa token | - |
| created_at | DateTime | Timestamp standar | - |

### plants
Menyimpan data pembangkit (PLTMH). Nilai teknis dikonfigurasi saat setup awal.

| Kolom | Tipe | Keterangan | Constraint |
|---|---|---|---|
| id | Int | Primary Key | Auto Increment |
| name | String | Nama pembangkit | - |
| location | String | Lokasi | - |
| capacity_kw | Float | Kapasitas terpasang | Nullable, diisi saat konfigurasi awal sistem |
| design_flow_m3s | Float | Debit air desain | Nullable, diisi saat konfigurasi awal sistem |
| design_head_m | Float | Head desain | Nullable, diisi saat konfigurasi awal sistem |
| created_at, updated_at | DateTime | Timestamp standar | - |

### units
Menyimpan data unit pembangkit di dalam suatu PLTMH. Struktur mendukung multi-unit.

| Kolom | Tipe | Keterangan | Constraint |
|---|---|---|---|
| id | Int | Primary Key | Auto Increment |
| plant_id | Int | Induk pembangkit | FK ke plants |
| unit_code | String | Kode referensi unit (misal 'UNIT-1') | - |
| name | String | Nama unit | - |
| current_status | UnitStatus | Status terkini unit | Enum, Default: STANDBY |
| created_at, updated_at | DateTime | Timestamp standar | - |

### logbook_entries
Entri logbook harian berdasarkan shift. Terdapat aturan definitif satu entri per unit per tanggal per shift.

| Kolom | Tipe | Keterangan | Constraint |
|---|---|---|---|
| id | Int | Primary Key | Auto Increment |
| unit_id | Int | Unit yang dicatat | FK ke units |
| operator_id | Int | Operator pencatat | FK ke users |
| date | DateTime | Tanggal operasi | Hanya Tanggal (Date) |
| shift | Shift | Shift (PAGI, SIANG, MALAM) | Enum |
| unit_status | UnitStatus | Status unit saat pencatatan | Enum |
| notes | String | Catatan tambahan | Nullable |
| deleted_at | DateTime | Waktu penghapusan soft-delete | Nullable |
| created_at, updated_at | DateTime | Timestamp standar | - |

*Catatan: constraint unique ditetapkan pada kombinasi `[unit_id, date, shift]`.*

### params_electrical, params_mechanical, params_hydraulic
Masing-masing entitas menyimpan rincian parameter terukur. Semua berelasi `1-to-1` dengan `logbook_entries` melalui `logbook_id` (Unique, FK). Kolom metrik bertipe `Float?` (nullable) untuk mengakomodasi sensor rusak atau nilai tidak tercatat.

### incidents
Data pencatatan gangguan atau incident.

| Kolom | Tipe | Keterangan | Constraint |
|---|---|---|---|
| id | Int | Primary Key | Auto Increment |
| unit_id | Int | Unit yang mengalami gangguan | FK ke units |
| reported_by_id | Int | Pelapor gangguan | FK ke users |
| occurred_at | DateTime | Waktu kejadian | - |
| equipment | String | Peralatan yang terganggu | - |
| incident_type | String | Tipe gangguan | - |
| description | String | Deskripsi masalah | - |
| operator_action | String | Tindakan sementara operator | Nullable |
| status | IncidentStatus | Status penyelesaian | Enum, Default: OPEN |
| resolved_at | DateTime | Waktu selesai diperbaiki | Nullable |
| deleted_at | DateTime | Soft-delete | Nullable |

### incident_status_histories & maintenance_status_histories
Mencatat rekam jejak perubahan status untuk gangguan maupun pemeliharaan.

| Kolom | Tipe | Keterangan | Constraint |
|---|---|---|---|
| id | Int | Primary Key | Auto Increment |
| (incident/maintenance)_id | Int | Relasi ke entitas induk | FK ke entitas terkait |
| changed_by_id | Int | Pengguna yang merubah status | FK ke users |
| from_status | Enum | Status sebelum diubah | Nullable |
| to_status | Enum | Status baru | - |
| changed_at | DateTime | Waktu perubahan | Default: now() |
| notes | String | Alasan / catatan | Nullable |

### maintenance_records
Data jadwal dan pengerjaan pemeliharaan.

| Kolom | Tipe | Keterangan | Constraint |
|---|---|---|---|
| id | Int | Primary Key | Auto Increment |
| unit_id | Int | Unit sasaran pemeliharaan | FK ke units |
| created_by_id | Int | Pembuat jadwal | FK ke users |
| equipment | String | Peralatan sasaran | - |
| work_type | String | Tipe pengerjaan | - |
| description | String | Rincian pekerjaan | - |
| technician | String | Nama teknisi penanggung jawab | Nullable |
| planned_date | DateTime | Tanggal rencana dikerjakan | Nullable |
| status | MaintenanceStatus| Status pekerjaan | Enum, Default: PLAN |
| deleted_at | DateTime | Soft-delete | Nullable |

### attachments
Tabel untuk mengelola relasi file lampiran atau foto. Menerapkan skema polymorphic.

| Kolom | Tipe | Keterangan | Constraint |
|---|---|---|---|
| id | Int | Primary Key | Auto Increment |
| related_to | AttachmentRelatedTo | Konteks lampiran (Logbook/Incident/Maintenance) | Enum |
| logbook_id, incident_id, maintenance_id | Int | FK opsional berdasarkan `related_to`. | Nullable (Hanya SATU yang terisi) |
| filename_stored | String | Nama UUID file fisik | - |
| original_filename | String | Nama asli dari pengguna | - |
| file_path | String | Path relatif tempat disimpan | - |
| mime_type | String | Tipe file, mis. image/jpeg | - |
| file_size_bytes | Int | Ukuran file | - |
| uploaded_by_id | Int | Pengunggah foto | FK ke users |
| status | AttachmentStatus | Status ketersediaan aktif/terhapus otomatis | Enum, Default: ACTIVE |

### inspection_checklists
Dijadwalkan untuk Fase 2.

## 4. Satuan dan Rentang Valid Parameter

Sistem memvalidasi nilai parameter logbook sesuai rentang berikut:

| Parameter | Satuan | Rentang Valid |
|---|---|---|
| voltage_v | V | 0–500 |
| current_a | A | 0–1.000 |
| frequency_hz | Hz | 45–55 |
| active_power_kw | kW | 0 s.d. kapasitas terpasang unit |
| reactive_power_kvar | kVAR | 0 s.d. kapasitas terpasang unit |
| power_factor | - | 0.00–1.00 |
| energy_production_kwh | kWh | 0 s.d. (kapasitas terpasang × jam operasi per shift) |
| rpm | RPM | 0–2.000 |
| bearing_temp_c | °C | 0–120 |
| generator_temp_c | °C | 0–150 |
| turbine_temp_c | °C | 0–150 |
| vibration_mms | mm/s | 0–50 |
| flow_rate_m3s | m³/s | 0 s.d. debit desain unit |
| water_level_m | m | 0 s.d. nilai desain unit |
| head_m | m | 0 s.d. nilai desain unit |
| pressure_bar | bar | 0 s.d. nilai desain unit |

## 5. Daftar Index

Untuk menjaga performa query, digunakan index berikut:

- `idx_logbook_unit_date_shift` : `logbook_entries(unit_id, date, shift)`
- `idx_logbook_operator` : `logbook_entries(operator_id)`
- `idx_incidents_unit` : `incidents(unit_id)`
- `idx_incidents_status` : `incidents(status)`
- `idx_maintenance_unit` : `maintenance_records(unit_id)`
- `idx_maintenance_status` : `maintenance_records(status)`
- `idx_attachments_related` : `attachments(related_to, logbook_id, incident_id, maintenance_id)`
- `idx_refresh_tokens_token` : `refresh_tokens(token)`

## 6. Catatan Desain

- **Pemisahan Parameter Numerik**: Penempatan data telemetri operasional pada tabel dan kolom eksplisit memfasilitasi optimasi penelusuran (filter), validasi rentang tipe data, dan ketepatan kalkulasi analitik pada kueri database.
- **Integritas Historis (Soft Delete)**: Tabel transaksional (`logbook_entries`, `incidents`, `maintenance_records`) menerapkan retensi penanda waktu `deleted_at` secara sistematis untuk mencegah mutasi permanen (*hard delete*) pada data pencatatan historis.
- **Isolasi Beban Media Berkas**: Struktur entitas foto diisolasi pada medium simpan *file system*. Lapisan pangkalan data hanya mendokumentasikan tautan referensi guna mempertahankan stabilitas beban transaksi operasi.
- **Peta Relasi Tunggal (Polymorphic)**: Skema integrasi ke entitas induk direkayasa dengan *foreign key* kondisional opsional guna memastikan kedisiplinan dan kepatuhan referensial pada tingkat rDBMS.
- **Kendali Transaksi Logbook**: Kombinasi elemen agregat unit, penanggalan, beserta identitas siklus jam kerja (*shift*) dilindungi oleh constraint limitasi tunggal untuk menghindari anomali pencatatan sekunder.
- **Evolusi Skema Berkala**: Perubahan maupun perluasan struktur tabel ditangani secara deterministik oleh pengelola versi migrasi Prisma.
