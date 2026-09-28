# DESIGN_SYSTEM — HYDRO-MON

Konsep visual: **Monitoring industrial fungsional**. Skema warna bernuansa gelap dengan aksen biru, penanda status visual yang baku, dan tipografi modern untuk visibilitas pembacaan metrik operasional yang optimal.

## 1. Palet Warna

### 1.1 Warna Utama (Primary)
| Token | Hex | Pemakaian |
|---|---|---|
| `primary-600` | `#2563EB` | Tombol utama, link, aksen aktif |
| `primary-500` | `#3B82F6` | Hover tombol, ikon aktif |
| `primary-100` | `#DBEAFE` | Latar chip status info |

### 1.2 Status Warna (Berlaku Global)
| Status | Token | Hex | Latar chip | Teks chip |
|---|---|---|---|---|
| Running | `status-running` | `#22C55E` | `#DCFCE7` | `#15803D` |
| Standby | `status-standby` | `#EAB308` | `#FEF9C3` | `#854D0E` |
| Trip | `status-trip` | `#EF4444` | `#FEE2E2` | `#991B1B` |
| Offline | `status-offline` | `#6B7280` | `#F3F4F6` | `#374151` |

Status ini berlaku untuk unit PLTMH dan warna chip gangguan.

### 1.3 Status Gangguan
| Status | Warna | Token |
|---|---|---|
| OPEN | Merah | `status-trip` |
| PROCESS | Kuning | `status-standby` |
| CLOSED | Hijau | `status-running` |

### 1.4 Status Maintenance
| Status | Warna | Token |
|---|---|---|
| PLAN | Abu-abu | `status-offline` |
| PROCESS | Kuning | `status-standby` |
| COMPLETE | Hijau | `status-running` |

### 1.5 Warna Netral (Web - Light Mode)
| Token | Hex | Pemakaian |
|---|---|---|
| `neutral-950` | `#0A0A0A` | Teks utama |
| `neutral-700` | `#374151` | Teks sekunder |
| `neutral-400` | `#9CA3AF` | Placeholder, label non-aktif |
| `neutral-200` | `#E5E7EB` | Border, garis pembatas |
| `neutral-100` | `#F3F4F6` | Latar kartu, section alt |
| `neutral-50` | `#F9FAFB` | Latar halaman |
| `white` | `#FFFFFF` | Latar kartu utama |

### 1.6 Warna Netral (Mobile - Dark-ish)
| Token | Hex | Pemakaian |
|---|---|---|
| `surface-dark` | `#1E293B` | AppBar, header |
| `surface-card` | `#FFFFFF` | Latar kartu |
| `surface-page` | `#F1F5F9` | Latar halaman mobile |

## 2. Tipografi

| Peran | Font | Keterangan |
|---|---|---|
| Semua teks (web & mobile) | **Inter** | Modern, legible, cocok untuk dashboard data padat |

Ukuran (Skala Tailwind / Flutter TextTheme):
| Peran | Ukuran | Weight |
|---|---|---|
| Judul halaman (h1) | 24px | 700 |
| Judul section (h2) | 18px | 600 |
| Label field | 14px | 500 |
| Body/isi | 14px | 400 |
| Caption/metadata | 12px | 400 |
| Nilai parameter besar (dashboard) | 28-32px | 700 |

## 3. Spacing & Layout

- Skala spacing dasar: 4px (Tailwind default)
- Radius sudut:
  * Kartu: 8px (`rounded-lg`)
  * Chip status: 9999px (pill, `rounded-full`)
  * Input field: 6px (`rounded-md`)
  * Tombol: 6px (`rounded-md`)
- Shadow kartu: `shadow-sm`
- Layout web: sidebar + area konten (responsif ≥1024px)
- Layout mobile: full-width dengan bottom navigation bar 5 tab

## 4. Komponen

### 4.1 Chip Status Unit
Desain: pill (rounded-full), latar warna muted, teks warna vivid, dot warna solid.
Contoh Tailwind: `bg-green-100 text-green-700 rounded-full px-3 py-1 text-sm font-medium`

### 4.2 Kartu Parameter (Dashboard Web)
Desain: white card, shadow-sm, rounded-lg, padding 16px. Menampilkan label, nilai dominan (28px bold), dan indikator trend.

### 4.3 Form Input (Mobile)
- Label di atas field
- Field dengan border neutral-200, focus border primary-500
- Error text merah di bawah field
- Suffix: satuan unit (V, A, Hz, kW, dll.)

### 4.4 Bottom Navigation Bar (Mobile)
5 tab: Beranda | Histori | Input | Dashboard | Profil
- Ikon aktif: primary-600
- Ikon non-aktif: neutral-400
- Label di bawah ikon

### 4.5 Grafik (Web - Recharts)
- Warna garis: primary-500 untuk nilai utama, warna sekunder untuk parameter tambahan
- Grid: neutral-200 (tipis)
- Tooltip: white card dengan shadow, nilai + satuan
- Axis label: tipografi caption (12px)

## 5. Pemetaan tailwind.config.ts (Web)

```typescript
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#3B82F6',
          600: '#2563EB',
          100: '#DBEAFE',
        },
        status: {
          running: '#22C55E',
          standby: '#EAB308',
          trip: '#EF4444',
          offline: '#6B7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
};
```

## 6. Pemetaan ThemeData Flutter (Mobile)

```dart
const Color kPrimary = Color(0xFF2563EB);
const Color kStatusRunning = Color(0xFF22C55E);
const Color kStatusStandby = Color(0xFFEAB308);
const Color kStatusTrip = Color(0xFFEF4444);
const Color kStatusOffline = Color(0xFF6B7280);

ThemeData buildTheme() {
  return ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(seedColor: kPrimary),
    fontFamily: 'Inter',
    cardTheme: const CardTheme(
      elevation: 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(Radius.circular(8)),
      ),
    ),
    inputDecorationTheme: const InputDecorationTheme(
      border: OutlineInputBorder(
        borderRadius: BorderRadius.all(Radius.circular(6)),
      ),
    ),
  );
}
```

## 7. Prinsip Desain
1. **Konsistensi Visual Status**: Berlaku secara seragam di seluruh subsistem (Running=Hijau, Standby=Kuning, Trip=Merah, Offline=Abu-abu).
2. **Kejelasan Metrik**: Nilai numerik harus menyertakan penulisan satuan secara eksplisit pada seluruh tabel dan form.
3. **Fokus Fungsionalitas**: Elemen UI didesain spesifik untuk tujuan fungsional operasional. Komponen dekoratif ditiadakan.
4. **Ergonomi Perangkat Bergerak**: Dimensi *input form* dan titik sentuh tombol dioptimalkan untuk aksesibilitas navigasi pada perangkat seluler, tanpa kebutuhan *scroll* secara horizontal.
5. **Keterbacaan Visual Data**: Grafik analitik disajikan secara terfokus tanpa menuntut observasi panjang pada detail legenda teks yang berlebih.
```
