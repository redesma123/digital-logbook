import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImage from '@/assets/logo.png';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Activity,
  Zap,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  FileSpreadsheet,
  RefreshCw,
  Info,
  Check,
  LogOut
} from 'lucide-react';
import {
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface ProductionChartItem {
  label: string;
  energy: number;
  target: number;
  cf?: number;
  af?: number;
  flow?: number;
  power?: number;
}

// Data Tren Energi & Target PLN (Bulanan)
const monthlyProductionTrend: ProductionChartItem[] = [
  { label: 'Mei 2026', energy: 515, target: 520, cf: 69.2, af: 96.5, flow: 2.28 },
  { label: 'Jun 2026', energy: 485, target: 500, cf: 67.4, af: 95.8, flow: 2.15 },
  { label: 'Jul 2026', energy: 465, target: 480, cf: 62.5, af: 95.1, flow: 2.05 },
  { label: 'Ags 2026', energy: 445, target: 470, cf: 59.8, af: 94.2, flow: 1.98 },
  { label: 'Sep 2026', energy: 538, target: 530, cf: 74.7, af: 97.2, flow: 2.30 },
  { label: 'Okt 2026 (Berjalan)', energy: 558, target: 520, cf: 77.3, af: 98.1, flow: 2.45 },
];

// Data Harian 7 Hari Terakhir
const dailyRecentData: ProductionChartItem[] = [
  { label: '29 Sep', energy: 19.4, target: 19.0, power: 810, flow: 2.35 },
  { label: '30 Sep', energy: 20.0, target: 19.0, power: 835, flow: 2.42 },
  { label: '01 Okt', energy: 20.6, target: 19.5, power: 860, flow: 2.51 },
  { label: '02 Okt', energy: 18.4, target: 19.5, power: 765, flow: 2.20 },
  { label: '03 Okt', energy: 20.8, target: 19.5, power: 868, flow: 2.54 },
  { label: '04 Okt', energy: 21.2, target: 19.5, power: 885, flow: 2.58 },
  { label: '05 Okt (Hari Ini)', energy: 19.8, target: 19.0, power: 935, flow: 2.48 },
];

const ManagementDashboard = () => {
  const [periodFilter, setPeriodFilter] = useState<'month' | 'week'>('month');
  const navigate = useNavigate();

  // Role Guard: Hanya peran MANAJEMEN yang dapat mengakses halaman ini
  useEffect(() => {
    const role = localStorage.getItem('user_role');
    if (role !== 'MANAJEMEN') {
      alert('Akses Terbatas: Halaman ini khusus untuk peran Akun Manajemen (Direksi). Anda akan dialihkan ke halaman login.');
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    navigate('/login', { replace: true });
  };

  // Ringkasan Eksekutif Jawaban 5 Parameter Manajemen
  const executiveMetrics = {
    // 1. Kondisi PLTMH saat ini
    plantStatus: {
      overallStatus: 'NORMAL & OPTIMAL',
      totalActivePowerKw: 935,
      totalCapacityKw: 1000,
      loadPercentage: 93.5,
      frequencyHz: 50.02,
      gridVoltageV: 398,
      waterHeadM: 14.8,
      unit1Status: 'RUNNING',
      unit1PowerKw: 475,
      unit2Status: 'RUNNING',
      unit2PowerKw: 460
    },
    // 2. Berapa energi yang dihasilkan
    energyProduction: {
      thisMonthMwh: 558.5,
      targetMonthMwh: 520.0,
      achievementPercentage: 107.4,
      todayKwh: 10850,
      ytdGwh: 4.90,
      estimatedRevenueIdr: 586425000,
      revenueDeltaPercentage: 7.4
    },
    // 3. Apakah performa turun
    performanceEvaluation: {
      statusTrend: 'MENINGKAT (+4.2%)',
      isPerformanceDown: false,
      capacityFactorPct: 77.3,
      prevCapacityFactorPct: 74.4,
      cfDeltaPct: 2.9,
      hydraulicEfficiencyPct: 92.4,
      healthIndexScore: 94,
      evaluationNote: 'Performa stabil dan di atas target. Tidak ada indikasi kavitasi atau penurunan efisiensi termal.'
    },
    // 4. Berapa availability unit
    availability: {
      availabilityFactorPct: 98.1,
      targetKpiPct: 95.0,
      totalRunningHours: 708,
      totalPeriodHours: 720,
      downtimeHours: 12,
      plannedMaintenanceHours: 12,
      unplannedDowntimeHours: 0,
      reliabilityScore: 100
    },
    // 5. Apa saja gangguan yang terjadi
    incidentsSummary: {
      activeOpenCount: 0,
      activeProcessCount: 1,
      resolvedThisMonthCount: 3,
      totalThisMonth: 4,
      riskLevel: 'LOW (RENDAH)',
      recentIncidents: [
        {
          id: 1,
          code: 'INC-2026-002',
          unit: 'Unit 1 (PLTMH)',
          equipment: 'Generator Thrust Bearing',
          issue: 'Overheat Bearing Temp (86°C) - Penurunan debit sirkulasi oli pendingin',
          status: 'PROCESS',
          impact: 'Beban diturunkan sementara ke 450 kW (Unit tetap operasi sinkron)',
          occurredAt: '01 Okt 2026 14:15 WIB',
          action: 'Pembersihan filter strainer dan flushing pelumas berjalan'
        },
        {
          id: 2,
          code: 'INC-2026-001',
          unit: 'Unit 1 (PLTMH)',
          equipment: 'Turbine Runner & Shaft',
          issue: 'Vibrasi mekanis terindikasi melampaui batas toleransi saat beban puncak',
          status: 'CLOSED',
          impact: 'Penyesuaian governor valve',
          occurredAt: '02 Okt 2026 08:30 WIB',
          action: 'Selesai diverifikasi supervisor. Vibrasi normal di 12 mm/s.'
        }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-800 font-sans flex flex-col">
      {/* TOP EXECUTIVE NAVIGATION BAR (Mandiri tanpa Sidebar) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo & Judul Sistem */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
              <img src={logoImage} alt="HYDRO-MON Logo" className="w-full h-full object-contain mix-blend-multiply" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-lg tracking-tight text-[#0F4C81] leading-none">HYDRO-MON</h1>
              </div>
              <p className="text-[0.65rem] text-slate-500 font-semibold tracking-wider uppercase mt-0.5">
                Digital Monitoring &bull; PLTMH Sampean Baru
              </p>
            </div>
          </div>

          {/* Profil Akun Manajemen & Tombol Logout */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-bold text-slate-900 leading-none">Bambang Trihatmojo</div>
              <div className="text-[0.65rem] font-extrabold text-blue-700 uppercase tracking-widest mt-1">
                MANAJEMEN
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-600 font-bold text-xs">
              BT
            </div>
            <div className="h-6 w-px bg-slate-200"></div>
            <button
              onClick={handleLogout}
              title="Keluar Sesi"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold text-rose-700 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* KONTEN UTAMA EKSEKUTIF (Full-Width) */}
      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-[1600px] mx-auto space-y-6">
          
          {/* Header Bar Konten & Tombol Aksi */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[0.65rem] font-bold tracking-wider uppercase bg-blue-100 text-blue-800 border border-blue-200">
                  STRATEGIC OVERVIEW
                </span>
                <span className="text-xs text-slate-400 font-medium">• Ringkasan Strategis Pembangkit</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
                Dashboard Manajemen & Kinerja PLTMH
              </h2>
              <p className="text-sm font-medium text-slate-500 mt-0.5">
                Pemantauan terpusat kondisi real-time, capaian produksi energi, evaluasi tren performa, dan mitigasi gangguan unit.
              </p>
            </div>

            {/* Action & Filter Buttons */}
            <div className="flex items-center flex-wrap gap-2.5">
              {/* Period Selector */}
              <div className="bg-white border border-slate-200 rounded p-0.5 flex text-xs font-semibold shadow-xs">
                <button
                  onClick={() => setPeriodFilter('month')}
                  className={`px-3 py-1 rounded transition-colors ${
                    periodFilter === 'month'
                      ? 'bg-[#0F4C81] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Bulan Berjalan (Okt)
                </button>
                <button
                  onClick={() => setPeriodFilter('week')}
                  className={`px-3 py-1 rounded transition-colors ${
                    periodFilter === 'week'
                      ? 'bg-[#0F4C81] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  7 Hari Terakhir
                </button>
              </div>

              <Button
                onClick={() => alert('Mengunduh Laporan Ringkasan Eksekutif Manajemen format CSV/Excel.')}
                className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs h-8 px-3 shadow-xs rounded flex items-center"
              >
                <FileSpreadsheet size={14} className="mr-1.5 text-emerald-600" />
                Ekspor Ringkasan
              </Button>

              <Button
                onClick={() => alert('Data eksekutif berhasil disegarkan.')}
                className="bg-[#0F4C81] hover:bg-[#0c3d66] text-white font-semibold text-xs h-8 px-3 shadow-xs rounded flex items-center"
              >
                <RefreshCw size={13} className="mr-1.5" />
                Perbarui
              </Button>
            </div>
          </div>

          {/* SECTION 1: 5 KARTU METRIK EKSEKUTIF (Menjawab 5 Pertanyaan Kunci Manajemen) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* KARTU 1: Bagaimana kondisi PLTMH saat ini? */}
            <Card className="bg-white border-slate-200 shadow-sm rounded-md p-4 bg-gradient-to-br from-white to-emerald-50/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest">
                    Kondisi Unit Saat Ini
                  </p>
                </div>
                <div className="mt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900">
                      {executiveMetrics.plantStatus.totalActivePowerKw}
                    </span>
                    <span className="text-xs font-bold text-slate-500">kW</span>
                  </div>
                  <p className="text-xs font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    {executiveMetrics.plantStatus.overallStatus}
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 text-[0.7rem] text-slate-500 mt-2 space-y-0.5">
                <div className="flex justify-between">
                  <span>Beban Operasi:</span>
                  <strong className="text-slate-800">{executiveMetrics.plantStatus.loadPercentage}% Kapasitas</strong>
                </div>
                <div className="flex justify-between">
                  <span>Unit 1 / Unit 2:</span>
                  <strong className="text-slate-800">475 kW / 460 kW</strong>
                </div>
              </div>
            </Card>

            {/* KARTU 2: Berapa energi yang dihasilkan? */}
            <Card className="bg-white border-slate-200 shadow-sm rounded-md p-4 bg-gradient-to-br from-white to-blue-50/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest">
                    Energi Dihasilkan
                  </p>
                </div>
                <div className="mt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-[#0F4C81]">
                      {executiveMetrics.energyProduction.thisMonthMwh}
                    </span>
                    <span className="text-xs font-bold text-slate-500">MWh</span>
                  </div>
                  <p className="text-xs font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
                    <TrendingUp size={13} className="text-emerald-600" />
                    {executiveMetrics.energyProduction.achievementPercentage}% Target PLN
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 text-[0.7rem] text-slate-500 mt-2 space-y-0.5">
                <div className="flex justify-between">
                  <span>Hari Ini:</span>
                  <strong className="text-slate-800">{executiveMetrics.energyProduction.todayKwh.toLocaleString('id-ID')} kWh</strong>
                </div>
                <div className="flex justify-between">
                  <span>Est. Pendapatan:</span>
                  <strong className="text-emerald-700">Rp 586,4 Juta</strong>
                </div>
              </div>
            </Card>

            {/* KARTU 3: Apakah performa turun? */}
            <Card className="bg-white border-slate-200 shadow-sm rounded-md p-4 bg-gradient-to-br from-white to-cyan-50/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest">
                   Evaluasi Performa
                  </p>
                </div>
                <div className="mt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-cyan-800">
                      {executiveMetrics.performanceEvaluation.capacityFactorPct}%
                    </span>
                    <span className="text-xs font-bold text-slate-500">CF</span>
                  </div>
                  <p className="text-xs font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
                    <TrendingUp size={13} className="text-emerald-600" />
                    Tidak Turun ({executiveMetrics.performanceEvaluation.statusTrend})
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 text-[0.7rem] text-slate-500 mt-2 space-y-0.5">
                <div className="flex justify-between">
                  <span>Efisiensi Air:</span>
                  <strong className="text-slate-800">{executiveMetrics.performanceEvaluation.hydraulicEfficiencyPct}% Desain</strong>
                </div>
                <div className="flex justify-between">
                  <span>Indeks Kesehatan:</span>
                  <strong className="text-emerald-700">94 / 100 (Prima)</strong>
                </div>
              </div>
            </Card>

            {/* KARTU 4: Berapa availability unit? */}
            <Card className="bg-white border-slate-200 shadow-sm rounded-md p-4 bg-gradient-to-br from-white to-indigo-50/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest">
                    Availability Unit
                  </p>
                </div>
                <div className="mt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-indigo-900">
                      {executiveMetrics.availability.availabilityFactorPct}%
                    </span>
                    <span className="text-xs font-bold text-slate-500">AF</span>
                  </div>
                  <p className="text-xs font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
                    <Check size={13} className="text-emerald-600" />
                    Melampaui Target (&gt;{executiveMetrics.availability.targetKpiPct}%)
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 text-[0.7rem] text-slate-500 mt-2 space-y-0.5">
                <div className="flex justify-between">
                  <span>Jam Operasi:</span>
                  <strong className="text-slate-800">{executiveMetrics.availability.totalRunningHours} / {executiveMetrics.availability.totalPeriodHours} Jam</strong>
                </div>
                <div className="flex justify-between">
                  <span>Downtime:</span>
                  <strong className="text-slate-800">12 Jam (Terjadwal)</strong>
                </div>
              </div>
            </Card>

            {/* KARTU 5: Apa saja gangguan yang terjadi? */}
            <Card className="bg-white border-slate-200 shadow-sm rounded-md p-4 bg-gradient-to-br from-white to-amber-50/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest">
                    Status Gangguan
                  </p>
                </div>
                <div className="mt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-amber-700">
                      {executiveMetrics.incidentsSummary.activeProcessCount}
                    </span>
                    <span className="text-xs font-bold text-slate-500">Dalam Penanganan</span>
                  </div>
                  <p className="text-xs font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    0 Gangguan Open (Kritis)
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 text-[0.7rem] text-slate-500 mt-2 space-y-0.5">
                <div className="flex justify-between">
                  <span>Tingkat Risiko:</span>
                  <strong className="text-emerald-700">{executiveMetrics.incidentsSummary.riskLevel}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Total Bulan Ini:</span>
                  <strong className="text-slate-800">{executiveMetrics.incidentsSummary.totalThisMonth} Insiden (Terkendali)</strong>
                </div>
              </div>
            </Card>

          </div>

          {/* SECTION 2: CHARTS & VISUAL ANALYTICS (Target vs Realisasi & Tren Performa) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* GRAFIK 1: Produksi Energi vs Target Kontrak PLN */}
            <Card className="bg-white border-slate-200 shadow-sm rounded-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Zap size={16} className="text-[#0F4C81]" />
                      Realisasi Produksi vs Target Kontrak PLN (PPA)
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-0.5">
                      {periodFilter === 'month'
                        ? 'Perbandingan tren bulanan pasokan energi MWh ke grid 20 kV PLN'
                        : 'Realisasi output energi harian (MWh) sepekan terakhir'}
                    </CardDescription>
                  </div>
                  <span className="text-[0.65rem] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
                    Surplus +7.4%
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[260px] w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={periodFilter === 'month' ? monthlyProductionTrend : dailyRecentData}
                      margin={{ top: 10, right: 10, bottom: 5, left: -10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                      />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <RechartsTooltip
                        formatter={(value: any, name: any) => [
                          `${value} MWh`,
                          name === 'energy' ? 'Realisasi Produksi' : 'Target PPA PLN'
                        ]}
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderColor: '#334155',
                          borderRadius: '6px',
                          color: '#fff',
                          fontSize: '12px'
                        }}
                      />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="circle"
                        wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
                        formatter={(val) => (val === 'energy' ? 'Realisasi Produksi' : 'Target PLN')}
                      />
                      <Bar dataKey="energy" name="energy" fill="#0F4C81" radius={[4, 4, 0, 0]} barSize={26} />
                      <Line
                        type="monotone"
                        dataKey="target"
                        name="target"
                        stroke="#10B981"
                        strokeWidth={2.5}
                        strokeDasharray="4 4"
                        dot={{ r: 4, fill: '#10B981' }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div>
                    Target Rata-rata: <strong className="text-slate-800">520 MWh/Bulan</strong>
                  </div>
                  <div>
                    Status PPA: <strong className="text-emerald-700">Memenuhi Minimum Take-or-Pay</strong>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* GRAFIK 2: Tren Performa (Capacity Factor & Availability Factor vs Target) */}
            <Card className="bg-white border-slate-200 shadow-sm rounded-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Gauge size={16} className="text-cyan-600" />
                      Tren Stabilitas Performa (Capacity Factor & Availability)
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-0.5">
                      Menjawab parameter apakah performa mesin mengalami degradasi terhadap waktu
                    </CardDescription>
                  </div>
                  <span className="text-[0.65rem] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
                    Kondisi: Prima
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[260px] w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={monthlyProductionTrend} margin={{ top: 10, right: 10, bottom: 5, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} domain={[50, 100]} />
                      <RechartsTooltip
                        formatter={(value: any, name: any) => [
                          `${value}%`,
                          name === 'af' ? 'Availability Factor (AF)' : 'Capacity Factor (CF)'
                        ]}
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderColor: '#334155',
                          borderRadius: '6px',
                          color: '#fff',
                          fontSize: '12px'
                        }}
                      />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="circle"
                        wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
                        formatter={(val) => (val === 'af' ? 'Availability (AF %)' : 'Capacity Factor (CF %)')}
                      />
                      <Area
                        type="monotone"
                        dataKey="af"
                        name="af"
                        fill="#38bdf8"
                        fillOpacity={0.2}
                        stroke="#0284c7"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: '#0284c7' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="cf"
                        name="cf"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: '#10b981' }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div>
                    Benchmark CF: <strong className="text-slate-800">&gt;70% (Tercapai: 77.3%)</strong>
                  </div>
                  <div>
                    Target AF: <strong className="text-slate-800">&gt;95% (Tercapai: 98.1%)</strong>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* SECTION 3: DEEP-DIVE DUA KOLOM: KONDISI UNIT DETAIL vs GANGGUAN TERKINI */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* KOLOM KIRI: STATUS DETAIL UNIT 1 & UNIT 2 (Menjawab: Bagaimana kondisi PLTMH saat ini?) */}
            <Card className="bg-white border-slate-200 shadow-sm rounded-md">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Activity size={16} className="text-[#0F4C81]" />
                      Status Operasional Detail Turbin & Generator
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Kondisi teknis mekanikal dan elektrikal per unit PLTMH Sampean Baru
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {/* Kartu Unit 1 */}
                <div className="p-4 bg-slate-50 rounded-md border border-slate-200">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                      <h4 className="font-bold text-sm text-slate-900">PLTMH Unit 1 &mdash; 500 kW</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[0.65rem] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      RUNNING (SINKRON)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
                    <div>
                      <span className="text-[0.65rem] font-semibold text-slate-400 block uppercase">Output Daya</span>
                      <strong className="text-sm font-black text-slate-900">475 kW</strong>
                      <span className="text-[0.65rem] text-slate-400 block">95% Beban</span>
                    </div>
                    <div>
                      <span className="text-[0.65rem] font-semibold text-slate-400 block uppercase">Tegangan</span>
                      <strong className="text-sm font-bold text-slate-800">398 V</strong>
                      <span className="text-[0.65rem] text-slate-400 block">Frekuensi: 50.0 Hz</span>
                    </div>
                    <div>
                      <span className="text-[0.65rem] font-semibold text-slate-400 block uppercase">Debit Air</span>
                      <strong className="text-sm font-bold text-cyan-700">2.51 m³/s</strong>
                      <span className="text-[0.65rem] text-slate-400 block">Desain: 2.65 m³/s</span>
                    </div>
                    <div>
                      <span className="text-[0.65rem] font-semibold text-slate-400 block uppercase">Suhu Bearing</span>
                      <strong className="text-sm font-bold text-amber-700">76°C</strong>
                      <span className="text-[0.65rem] text-amber-600 block">Dalam Pengawasan</span>
                    </div>
                  </div>
                </div>

                {/* Kartu Unit 2 */}
                <div className="p-4 bg-slate-50 rounded-md border border-slate-200">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                      <h4 className="font-bold text-sm text-slate-900">PLTMH Unit 2 &mdash; 500 kW</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[0.65rem] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      RUNNING (SINKRON)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
                    <div>
                      <span className="text-[0.65rem] font-semibold text-slate-400 block uppercase">Output Daya</span>
                      <strong className="text-sm font-black text-slate-900">460 kW</strong>
                      <span className="text-[0.65rem] text-slate-400 block">92% Beban</span>
                    </div>
                    <div>
                      <span className="text-[0.65rem] font-semibold text-slate-400 block uppercase">Tegangan</span>
                      <strong className="text-sm font-bold text-slate-800">400 V</strong>
                      <span className="text-[0.65rem] text-slate-400 block">Frekuensi: 50.0 Hz</span>
                    </div>
                    <div>
                      <span className="text-[0.65rem] font-semibold text-slate-400 block uppercase">Debit Air</span>
                      <strong className="text-sm font-bold text-cyan-700">2.48 m³/s</strong>
                      <span className="text-[0.65rem] text-slate-400 block">Desain: 2.65 m³/s</span>
                    </div>
                    <div>
                      <span className="text-[0.65rem] font-semibold text-slate-400 block uppercase">Suhu Bearing</span>
                      <strong className="text-sm font-bold text-emerald-700">68°C</strong>
                      <span className="text-[0.65rem] text-emerald-600 block">Kondisi Normal</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* KOLOM KANAN: DAFTAR GANGGUAN TERKINI (Menjawab: Apa saja gangguan yang terjadi?) */}
            <Card className="bg-white border-slate-200 shadow-sm rounded-md">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <AlertTriangle size={16} className="text-amber-600" />
                      Log Gangguan Aktif & Riwayat Insiden Terakhir
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Insiden operasional yang berdampak pada keandalan daya dan tindakan teknis
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                {executiveMetrics.incidentsSummary.recentIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="p-3.5 rounded-md border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-800">
                          {incident.code}
                        </span>
                        <span className="font-bold text-xs text-slate-900">{incident.equipment}</span>
                        <span className="text-[0.65rem] text-slate-500 font-semibold">({incident.unit})</span>
                      </div>
                      {incident.status === 'PROCESS' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[0.65rem] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1 animate-pulse"></span>
                          PROCESS
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[0.65rem] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={10} className="mr-1 text-emerald-600" />
                          CLOSED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed">
                      {incident.issue}
                    </p>
                    <div className="mt-2 pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-[0.68rem] text-slate-500">
                      <span>
                        Dampak: <strong className="text-slate-800">{incident.impact}</strong>
                      </span>
                      <span className="font-mono text-slate-400">{incident.occurredAt}</span>
                    </div>
                  </div>
                ))}

                {/* Keterangan Status Manajemen */}
                <div className="p-3 bg-blue-50/60 border border-blue-200 rounded text-xs text-blue-900 flex items-start gap-2">
                  <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-blue-950 font-semibold mb-0.5">Catatan Mitigasi Risiko:</strong>
                    Semua gangguan yang terjadi berada dalam kategori penanganan terkontrol. Tidak terdapat potensi blackout total atau sanksi penalti deviasi suplai dari PLN.
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* SECTION 4: INSIGHTS & REKOMENDASI STRATEGIS MANAJEMEN */}
          <Card className="bg-white border-slate-200 shadow-sm rounded-md p-5">
            <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-600" />
              Kesimpulan Evaluasi Kinerja untuk Manajemen
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded border border-slate-200">
                <span className="font-bold text-slate-800 block text-xs mb-1">
                  1. Keberlanjutan Suplai Energi
                </span>
                <p className="text-slate-600 leading-relaxed">
                  Produksi kumulatif berjalan <strong>558.5 MWh</strong>, surplus 7.4% terhadap target PPA. Pasokan air sungai di hulu terpantau stabil pada rata-rata 2.45 m³/s.
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded border border-slate-200">
                <span className="font-bold text-slate-800 block text-xs mb-1">
                  2. Integritas Aset & Keandalan Mesin
                </span>
                <p className="text-slate-600 leading-relaxed">
                  Availability Factor mencapai <strong>98.1%</strong> (di atas target 95%). Waktu henti mesin hanya 12 jam untuk perawatan terencana tanpa adanya trip tak terduga.
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded border border-slate-200">
                <span className="font-bold text-slate-800 block text-xs mb-1">
                  3. Rekomendasi Tindak Lanjut
                </span>
                <p className="text-slate-600 leading-relaxed">
                  Dukung pelaksanaan pemeliharaan preventif seal MIV pada jadwal terdekat untuk mempertahankan efisiensi hidrolik sebelum memasuki puncak musim hujan.
                </p>
              </div>
            </div>
          </Card>

        </div>
      </main>
    </div>
  );
};

export default ManagementDashboard;
