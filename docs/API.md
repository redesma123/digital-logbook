# Dokumentasi API HYDRO-MON

Dokumen ini berisi spesifikasi API untuk sistem HYDRO-MON (Hydro Power Digital Monitoring & Performance System). API menghubungkan Mobile Application (Flutter) dan Web Dashboard (React) dengan Cloud/Web Server.

**Base URL Produksi:** `https://<domain>/api/v1`
**Base URL Development:** `http://localhost:3000/api/v1`
**Format Data:** JSON
**Autentikasi:** `Authorization: Bearer <access_token>` untuk seluruh endpoint kecuali login dan refresh token.
- **Web:** Refresh token disimpan di cookie `httpOnly` dengan `SameSite=Strict`.
- **Mobile (Flutter):** Refresh token dikirimkan melalui body pada request dan response.

---

## 1. Konvensi
- Endpoint diawali `/api/v1/`.
- Response sukses memiliki field `data`.
- Response error memiliki field `error` (string) dan opsional `details` (array).
- Pagination menggunakan query parameter `page` dan `limit`. Metadata: `pagination: { total, page, limit, totalPages }`.
- Filter tanggal menggunakan `from` dan `to` (format ISO 8601: YYYY-MM-DD).
- Timestamp dalam UTC ISO 8601 (contoh: `2026-09-28T08:00:00Z`).

---

## 2. Kode Error HTTP

| Status | Arti |
|---|---|
| **400** | Request tidak valid (body malformed, field wajib tidak ada, atau salah format). |
| **401** | Unauthorized (Token tidak ada, tidak valid, atau kedaluwarsa). |
| **403** | Forbidden (Hak akses tidak cukup atau peran tidak sesuai). |
| **404** | Not Found (Resource tidak ditemukan). |
| **409** | Conflict (Konflik data, misal entri duplikat). |
| **410** | Gone (Resource telah dihapus, misal foto melewati retensi 3 bulan). |
| **422** | Unprocessable Entity (Format data valid tetapi nilai tidak wajar). |
| **429** | Too Many Requests (Rate limit terlampaui). |
| **500** | Internal Server Error. |

---

## 3. Endpoint Auth (`/api/v1/auth`)

### POST `/auth/login`
- **Hak Akses:** Publik
- **Fungsi:** Mendapatkan access token dan refresh token.
- **Request Body:** `{ "username": "operator1", "password": "password123" }`
- **Response (200 OK):**
  ```json
  {
    "data": {
      "accessToken": "eyJhbGci...",
      "refreshToken": "def456...", 
      "user": { "id": 1, "username": "operator1", "fullName": "Budi", "role": "OPERATOR" }
    }
  }
  ```

### POST `/auth/refresh`
- **Hak Akses:** Publik
- **Fungsi:** Memperbarui access token.
- **Request Body:** `{ "refreshToken": "def456..." }`
- **Response (200 OK):** `{ "data": { "accessToken": "eyJhbGci..." } }`

### POST `/auth/logout`
- **Hak Akses:** Autentikasi diperlukan
- **Fungsi:** Menghapus sesi pengguna.
- **Request Body:** `{ "refreshToken": "def456..." }`
- **Response:** 204 No Content

### GET `/auth/me`
- **Hak Akses:** Autentikasi diperlukan
- **Fungsi:** Mendapatkan profil pengguna login.
- **Response (200 OK):** `{ "data": { "id": 1, "username": "operator1", "fullName": "Budi", "role": "OPERATOR" } }`

---

## 4. Endpoint Users (`/api/v1/users`)
**Hak Akses:** ADMIN

### GET `/users`
- **Query Params:** `page`, `limit`, `role`.

### POST `/users`
- **Request Body:** `{ "username": "newuser", "password": "...", "fullName": "Nama", "role": "OPERATOR" }`

### GET `/users/:id`
- **Fungsi:** Detail pengguna.

### PATCH `/users/:id`
- **Request Body:** `{ "fullName": "...", "role": "SUPERVISOR", "is_active": true, "password": "..." }`

### DELETE `/users/:id`
- **Fungsi:** Soft delete pengguna.

---

## 5. Endpoint Plants & Units (`/api/v1/plants`, `/api/v1/units`)
**Hak Akses:** Baca (Semua Peran), Tulis (ADMIN)

### GET `/plants` & POST `/plants`
- **Request Body POST:**
  ```json
  {
    "name": "PLTMH Sampean Baru",
    "location": "Bondowoso",
    "capacity_kw": 1500,
    "design_flow_m3s": 3.5,
    "design_head_m": 20.0
  }
  ```
  *Kapasitas terpasang, debit desain, dan head desain dikonfigurasi saat setup awal berdasarkan data teknis unit.*

### GET `/plants/:id` & PATCH `/plants/:id`
- **Fungsi:** Membaca/Mengubah data plant.

### GET `/units` & POST `/units`
- **Query Params GET:** `plant_id`.
- **Request Body POST:** `{ "plant_id": 1, "unit_code": "U1", "name": "Unit 1" }`

### GET `/units/:id` & PATCH `/units/:id`
- **Request Body PATCH:** `{ "unit_code": "...", "name": "...", "current_status": "RUNNING" }`
- **Status Valid:** `RUNNING`, `STANDBY`, `TRIP`, `OFFLINE`.

---

## 6. Endpoint Logbook (`/api/v1/logbook`)

### POST `/logbook`
- **Hak Akses:** OPERATOR, SUPERVISOR
- **Request Body:**
  ```json
  {
    "unit_id": 1,
    "date": "2026-09-28",
    "shift": "PAGI",
    "unit_status": "RUNNING",
    "notes": "Operasi normal",
    "electrical": {
      "voltage_v": 400,
      "current_a": 650,
      "frequency_hz": 50,
      "active_power_kw": 450,
      "reactive_power_kvar": 120,
      "power_factor": 0.97,
      "energy_production_kwh": 3600,
      "generator_status": "Normal"
    },
    "mechanical": {
      "rpm": 1500,
      "bearing_temp_c": 45,
      "generator_temp_c": 65,
      "turbine_temp_c": 40,
      "vibration_mms": 2.1
    },
    "hydraulic": {
      "flow_rate_m3s": 2.5,
      "water_level_m": 1.8,
      "head_m": 18.5,
      "pressure_bar": 1.8,
      "intake_condition": "Bersih"
    }
  }
  ```
- **Response:** 201 Created. Unique constraint: 1 entri per unit per tanggal per shift (Error 409 jika duplikat).

### GET `/logbook`
- **Hak Akses:** Semua peran.
- **Query Params:** `unit_id`, `from`, `to`, `shift`, `page`, `limit`.

### GET `/logbook/:id`
- **Hak Akses:** Semua peran. Mengambil entri beserta relasi dan attachment.

### PATCH `/logbook/:id`
- **Hak Akses:** Operator dapat mengubah dalam 24 jam setelah shift; setelah itu hanya Supervisor.
- **Fungsi:** Partial update logbook.

### DELETE `/logbook/:id`
- **Hak Akses:** SUPERVISOR. Soft delete.

---

## 7. Endpoint Gangguan (`/api/v1/incidents`)

### POST `/incidents`
- **Hak Akses:** OPERATOR, SUPERVISOR
- **Request Body:** `{ "unit_id": 1, "occurred_at": "2026-09-28T10:00:00Z", "equipment": "Turbine", "incident_type": "Vibrasi Tinggi", "description": "Terdapat anomali", "operator_action": "Menurunkan beban" }`

### GET `/incidents`
- **Hak Akses:** Semua peran
- **Query Params:** `unit_id`, `status` (OPEN/PROCESS/CLOSED), `from`, `to`, `page`, `limit`.

### GET `/incidents/:id` & PATCH `/incidents/:id`
- **Hak Akses PATCH:** OPERATOR, SUPERVISOR. Partial update.

### PATCH `/incidents/:id/status`
- **Hak Akses:** OPERATOR (hanya ke `PROCESS`), SUPERVISOR (ke `PROCESS` atau `CLOSED`).
- **Request Body:** `{ "status": "PROCESS", "notes": "Sedang dicek" }`

### DELETE `/incidents/:id`
- **Hak Akses:** SUPERVISOR. Soft delete.

---

## 8. Endpoint Maintenance (`/api/v1/maintenance`)

### POST `/maintenance`
- **Hak Akses:** OPERATOR, SUPERVISOR
- **Request Body:** `{ "unit_id": 1, "equipment": "Generator", "work_type": "Preventive", "description": "Pembersihan rutin", "technician": "Tim A", "planned_date": "2026-10-01T08:00:00Z" }`

### GET `/maintenance`
- **Hak Akses:** Semua peran
- **Query Params:** `unit_id`, `status` (PLAN/PROCESS/COMPLETE), `from`, `to`, `page`, `limit`.

### GET `/maintenance/:id` & PATCH `/maintenance/:id`
- **Hak Akses PATCH:** OPERATOR, SUPERVISOR. Partial update.

### PATCH `/maintenance/:id/status`
- **Hak Akses:** SUPERVISOR
- **Request Body:** `{ "status": "COMPLETE", "notes": "Selesai" }`

### DELETE `/maintenance/:id`
- **Hak Akses:** SUPERVISOR. Soft delete.

---

## 9. Endpoint Attachments (`/api/v1/attachments`)
Foto memiliki batas ukuran maksimal 5 MB per file setelah kompresi dan hanya menerima format JPEG, PNG, dan WebP (divalidasi melalui magic bytes). Foto yang melebihi masa retensi 3 bulan dihapus secara otomatis (kecuali pada insiden berstatus OPEN/PROCESS).

### POST `/attachments`
- **Hak Akses:** OPERATOR, SUPERVISOR
- **Format Request:** `multipart/form-data`
- **Fields:** `file`, `related_to` (`LOGBOOK` | `INCIDENT` | `MAINTENANCE`), `related_id`.
- **Response (201):** `{ "data": { "id": 1, "filename_stored": "...", "mime_type": "image/jpeg", "file_size_bytes": 102400 } }`

### GET `/attachments/:id`
- **Hak Akses:** Autentikasi diperlukan. Mengembalikan metadata.

### GET `/attachments/:id/file`
- **Hak Akses:** Autentikasi diperlukan (bukan URL publik). Streaming data biner langsung.
- **Error (410 Gone):** Jika foto dihapus oleh kebijakan retensi 3 bulan.

### DELETE `/attachments/:id`
- **Hak Akses:** SUPERVISOR. Hapus file dan metadata.

---

## 10. Endpoint Dashboard (`/api/v1/dashboard`)

### GET `/dashboard/summary`
- **Hak Akses:** SUPERVISOR, MANAGEMENT, ADMIN
- **Query Params:** `unit_id`
- **Response Sukses:**
  ```json
  {
    "data": {
      "unit": { "id": 1, "name": "Unit 1", "current_status": "RUNNING" },
      "latest_entry": { "date": "2026-09-28", "shift": "PAGI", "electrical": {...}, "hydraulic": {...} },
      "today_energy_kwh": 10500,
      "active_incidents_count": 1,
      "active_maintenance_count": 0
    }
  }
  ```

### GET `/dashboard/chart`
- **Hak Akses:** SUPERVISOR, MANAGEMENT, ADMIN
- **Query Params:** `unit_id`, `parameter`, `from`, `to`
- **Parameter Valid:** `active_power_kw`, `voltage_v`, `frequency_hz`, `flow_rate_m3s`, `water_level_m`, `energy_production_kwh`.

---

## 11. Endpoint Analytics (`/api/v1/analytics`)

### GET `/analytics/performance`
- **Hak Akses:** SUPERVISOR, MANAGEMENT, ADMIN
- **Query Params:** `unit_id`, `from`, `to`
- **Fungsi:** Kalkulasi KPI PLTMH dengan rumus berikut:
  - **Availability (%):** (Running Hours / Jam Periode) × 100
  - **Capacity Factor (%):** (Energi Aktual kWh / (Kapasitas Terpasang kW × Jam Periode)) × 100
  - **Energy Production:** Σ energy_production_kwh seluruh shift dalam periode
  - **Water Utilization (%):** (Rata-rata Debit Aktual / Debit Desain) × 100
  - **Performance Trend:** Perbandingan KPI bulan berjalan vs bulan sebelumnya
- **Response Sukses:**
  ```json
  {
    "data": {
      "period": { "from": "2026-09-01", "to": "2026-09-30" },
      "availability_pct": 98.5,
      "capacity_factor_pct": 85.2,
      "total_energy_kwh": 350000,
      "avg_flow_utilization_pct": 90.0,
      "trend_vs_previous_period": {
        "availability_delta": 1.2,
        "capacity_factor_delta": -0.5
      }
    }
  }
  ```

---

## 12. Endpoint Export (`/api/v1/export`)
Format yang didukung adalah `.xlsx` dan `.csv`.

### GET `/export/logbook`
- **Hak Akses:** SUPERVISOR, MANAGEMENT, ADMIN
- **Query Params:** `unit_id`, `from`, `to`, `shift`, `format` (xlsx/csv).
- **Response:** File download (header `Content-Disposition: attachment`).

### GET `/export/incidents`
- **Query Params:** `unit_id`, `from`, `to`, `format`.

### GET `/export/maintenance`
- **Query Params:** `unit_id`, `from`, `to`, `format`.

---

## 13. Spesifikasi OpenAPI 3
Spesifikasi lengkap dan Source of Truth berada di `api-spec/openapi.yaml`. SDK klien digenerate menggunakan OpenAPI Generator:
- **Flutter:** `mobile/lib/api/`
- **React:** `web/src/api/`
Setiap perubahan API wajib memperbarui `openapi.yaml`.

---

## 14. Ringkasan Parameter Filter

| Endpoint | Filter Tersedia |
|---|---|
| `/api/v1/users` | `page`, `limit`, `role` |
| `/api/v1/logbook` | `unit_id`, `from`, `to`, `shift`, `page`, `limit` |
| `/api/v1/incidents` | `unit_id`, `status` (OPEN/PROCESS/CLOSED), `from`, `to`, `page`, `limit` |
| `/api/v1/maintenance`| `unit_id`, `status` (PLAN/PROCESS/COMPLETE), `from`, `to`, `page`, `limit` |
| `/api/v1/dashboard/chart` | `unit_id`, `parameter`, `from`, `to` |
| `/api/v1/analytics/performance` | `unit_id`, `from`, `to` |
| `/api/v1/export/*` | `unit_id`, `from`, `to`, `shift` (hanya logbook), `format` (xlsx/csv) |
