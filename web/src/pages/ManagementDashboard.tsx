import { useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImage from '@/assets/logo.png';
import {
  FileSpreadsheet,
  RefreshCw,
  Info,
  LogOut
} from 'lucide-react';
import {
  ComposedChart,
  Line,
  Bar,
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
      todayKwh: 10850,
      ytdGwh: 4.90,
      estimatedRevenueIdr: 586425000,
      revenueDeltaPercentage: 7.4
    },
    // 3. Apakah performa turun
    performanceEvaluation: {
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
      totalRunningHours: 708,
      totalPeriodHours: 720,
      downtimeHours: 12,
      plannedMaintenanceHours: 12,
      unplannedDowntimeHours: 0,
      reliabilityScore: 100
    },
    // 5. Apa saja gangguan yang terjadi
    incidentsSummary: {
      activeProcessCount: 1,
      resolvedThisMonthCount: 3,
      totalThisMonth: 4,
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


  // ---------- Helper tampilan ----------
  type Tone = 'green' | 'amber' | 'blue' | 'slate' | 'red';

  // Badge status: tanpa warna (monokrom netral) dan tanpa titik bulat
  const Badge = ({ children }: { tone?: Tone; children: ReactNode }) => (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium text-slate-700 bg-slate-100 border border-slate-200 whitespace-nowrap">
      {children}
    </span>
  );

  const periodBtn = (active: boolean) =>
    `px-3 py-1 text-xs rounded-full cursor-pointer transition-colors ${
      active ? 'bg-[#0F4C81] text-white font-medium' : 'text-slate-600 hover:text-slate-900'
    }`;

  const tooltipStyle = {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    color: '#1E293B',
    fontSize: '12px',
    padding: '6px 10px',
    boxShadow: '0 4px 12px rgba(15,23,42,0.08)'
  };

  const card = 'bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_8px_rgba(15,23,42,0.05)]';
  const cardTitle = 'text-sm font-semibold text-slate-800';
  const cardSub = 'text-xs text-slate-500 mt-0.5';

  const incidents = executiveMetrics.incidentsSummary.recentIncidents;
  const resolvedPct = Math.round(
    (executiveMetrics.incidentsSummary.resolvedThisMonthCount / executiveMetrics.incidentsSummary.totalThisMonth) * 100
  );

  const kpis = [
    {
      label: 'Daya aktif',
      value: String(executiveMetrics.plantStatus.totalActivePowerKw),
      unit: 'kW',
      note: `Beban ${executiveMetrics.plantStatus.loadPercentage}% dari 1.000 kW`
    },
    {
      label: 'Energi bulan ini',
      value: String(executiveMetrics.energyProduction.thisMonthMwh),
      unit: 'MWh',
      note: `Hari ini ${executiveMetrics.energyProduction.todayKwh.toLocaleString('id-ID')} kWh`
    },
    {
      label: 'Capacity factor',
      value: String(executiveMetrics.performanceEvaluation.capacityFactorPct),
      unit: '%',
      note: `Efisiensi hidrolik ${executiveMetrics.performanceEvaluation.hydraulicEfficiencyPct}%`
    },
    {
      label: 'Availability factor',
      value: String(executiveMetrics.availability.availabilityFactorPct),
      unit: '%',
      note: `Operasi ${executiveMetrics.availability.totalRunningHours} dari ${executiveMetrics.availability.totalPeriodHours} jam`
    }
  ];

  return (
    <div
      className="min-h-screen bg-[#EEF2F7] text-slate-800 flex flex-col text-[13px]"
      style={{ fontFamily: '"IBM Plex Sans", Arial, Helvetica, sans-serif' }}
    >
      {/* Header aplikasi */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="HYDRO-MON" className="w-9 h-9 object-contain mix-blend-multiply" />
            <div className="leading-tight">
              <h1 className="text-base font-semibold text-[#0F4C81]">HYDRO-MON</h1>
              <p className="text-xs text-slate-500">PLTMH Sampean Baru</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#0F4C81] text-white flex items-center justify-center text-xs font-semibold">
                BT
              </div>
              <div className="leading-tight hidden sm:block">
                <div className="text-[13px] font-medium text-slate-900">Bambang Trihatmojo</div>
                <div className="text-xs text-slate-500">Manajemen</div>
              </div>
            </div>
            <div className="h-7 w-px bg-slate-200 mx-1"></div>
            <button
              onClick={handleLogout}
              title="Keluar sesi"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 cursor-pointer transition-colors"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-5">
        <div className="max-w-[1600px] mx-auto space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Dashboard Manajemen</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Capaian produksi, keandalan unit, dan gangguan &middot; Oktober 2026
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => alert('Mengunduh Laporan Ringkasan Eksekutif Manajemen format CSV/Excel.')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap shadow-xs"
              >
                <FileSpreadsheet size={14} />
                Ekspor CSV
              </button>
              <button
                type="button"
                onClick={() => alert('Data eksekutif berhasil disegarkan.')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0F4C81] hover:bg-[#0c3d66] text-white rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap shadow-xs"
              >
                <RefreshCw size={14} />
                Perbarui
              </button>
            </div>
          </div>

          {/* KPI utama */}
          <section aria-label="Indikator utama" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            {kpis.map((k) => (
              <div key={k.label} className={`${card} px-4 py-3.5`}>
                <span className="text-xs font-medium text-slate-500">{k.label}</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-[28px] leading-8 font-semibold text-slate-900 tabular-nums">{k.value}</span>
                  <span className="text-sm text-slate-500">{k.unit}</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">{k.note}</div>
              </div>
            ))}

            <div className={`${card} px-4 py-3.5`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-500">Gangguan bulan ini</span>
                <Badge tone="amber">{executiveMetrics.incidentsSummary.activeProcessCount} aktif</Badge>
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-[28px] leading-8 font-semibold text-slate-900 tabular-nums">
                  {executiveMetrics.incidentsSummary.totalThisMonth}
                </span>
                <span className="text-sm text-slate-500">kejadian</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {executiveMetrics.incidentsSummary.resolvedThisMonthCount} selesai &middot; {resolvedPct}%
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
            {/* Kolom utama (lebar) */}
            <div className="xl:col-span-8 space-y-5">
              {/* Produksi */}
              <section aria-label="Realisasi produksi" className={card}>
                <div className="px-5 pt-4 pb-2 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <h3 className={cardTitle}>Realisasi produksi vs target kontrak PLN (PPA)</h3>
                    <p className={cardSub}>
                      {periodFilter === 'month'
                        ? 'Energi bulanan ke grid PLN (MWh)'
                        : 'Energi harian 7 hari terakhir (MWh)'}
                    </p>
                  </div>
                  <div className="flex gap-0.5 bg-slate-100 rounded-full p-0.5 shrink-0 self-start">
                    <button type="button" onClick={() => setPeriodFilter('month')} className={periodBtn(periodFilter === 'month')}>
                      Bulan berjalan (Okt)
                    </button>
                    <button type="button" onClick={() => setPeriodFilter('week')} className={periodBtn(periodFilter === 'week')}>
                      7 hari terakhir
                    </button>
                  </div>
                </div>
                <div className="px-4">
                  <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={periodFilter === 'month' ? monthlyProductionTrend : dailyRecentData}
                        margin={{ top: 6, right: 8, bottom: 0, left: -12 }}
                      >
                        <CartesianGrid stroke="#EEF2F7" vertical={false} />
                        <XAxis dataKey="label" axisLine={{ stroke: '#CBD5E1' }} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                        <RechartsTooltip
                          formatter={(value: any, name: any) => [`${value} MWh`, name === 'energy' ? 'Realisasi' : 'Target PPA']}
                          contentStyle={tooltipStyle}
                        />
                        <Legend
                          verticalAlign="top"
                          align="right"
                          iconType="circle"
                          iconSize={8}
                          wrapperStyle={{ paddingBottom: '8px', fontSize: '12px' }}
                          formatter={(val) => (val === 'energy' ? 'Realisasi' : 'Target PPA')}
                        />
                        <Bar dataKey="energy" name="energy" fill="#0F4C81" barSize={20} radius={[4, 4, 0, 0]} />
                        <Line
                          type="monotone"
                          dataKey="target"
                          name="target"
                          stroke="#F59E0B"
                          strokeWidth={2}
                          dot={{ r: 3, fill: '#F59E0B', strokeWidth: 0 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="px-5 py-3 mt-1 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                  <span>Target PLN: <span className="font-medium text-slate-900">520 MWh/bulan</span></span>
                  <Badge tone="green">Minimum take-or-pay terpenuhi</Badge>
                </div>
              </section>

              {/* CF & AF (Dipindah ke kolom kiri yang lebih lebar) */}
              <section aria-label="Tren performa" className={card}>
                <div className="px-5 pt-4 pb-2">
                  <h3 className={cardTitle}>Tren CF dan AF</h3>
                  <p className={cardSub}>Persentase per bulan, Mei &ndash; Okt 2026</p>
                </div>
                <div className="px-4">
                  <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={monthlyProductionTrend} margin={{ top: 6, right: 8, bottom: 0, left: -12 }}>
                        <CartesianGrid stroke="#EEF2F7" vertical={false} />
                        <XAxis
                          dataKey="label"
                          axisLine={{ stroke: '#CBD5E1' }}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: '#64748B' }}
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} domain={[50, 100]} />
                        <RechartsTooltip
                          formatter={(value: any, name: any) => [`${value}%`, name === 'af' ? 'Availability' : 'Capacity factor']}
                          contentStyle={tooltipStyle}
                        />
                        <Legend
                          verticalAlign="top"
                          align="right"
                          iconType="circle"
                          iconSize={8}
                          wrapperStyle={{ paddingBottom: '8px', fontSize: '12px' }}
                          formatter={(val) => (val === 'af' ? 'AF' : 'CF')}
                        />
                        <Line type="monotone" dataKey="af" name="af" stroke="#0F4C81" strokeWidth={2.5} dot={{ r: 3, fill: '#0F4C81', strokeWidth: 0 }} />
                        <Line type="monotone" dataKey="cf" name="cf" stroke="#14B8A6" strokeWidth={2.5} dot={{ r: 3, fill: '#14B8A6', strokeWidth: 0 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span>CF <span className="font-medium text-slate-900">77,3%</span> &middot; target &gt;70%</span>
                  <span>AF <span className="font-medium text-slate-900">98,1%</span> &middot; target &gt;95%</span>
                </div>
              </section>

              {/* Log gangguan (Dipindah ke bawah Tren CF dan AF) */}
              <section aria-label="Log gangguan" className={card}>
                <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className={cardTitle}>Log gangguan</h3>
                    <p className={cardSub}>Kejadian terbaru dan penanganannya</p>
                  </div>
                  <Badge>{executiveMetrics.incidentsSummary.activeProcessCount} aktif</Badge>
                </div>
                <ul className="px-5 pb-2">
                  {incidents.map((incident, idx) => (
                    <li key={incident.id} className={`py-3 ${idx > 0 ? 'border-t border-slate-100' : ''}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-[13px] font-medium text-slate-900">{incident.equipment}</div>
                          <div className="text-xs text-slate-500">{incident.unit} &middot; {incident.code}</div>
                        </div>
                        {incident.status === 'PROCESS' ? (
                          <Badge>Dalam proses</Badge>
                        ) : (
                          <Badge>Selesai</Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">{incident.issue}</p>
                      <div className="text-xs text-slate-500 mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <div>Dampak: {incident.impact}</div>
                        <div className="tabular-nums">{incident.occurredAt}</div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mx-5 mb-4 mt-1 px-3 py-2 rounded-lg bg-slate-50 text-xs text-slate-700 border border-slate-200 flex items-start gap-2">
                  <Info size={13} className="shrink-0 mt-0.5 text-slate-500" />
                  <span>Tidak ada potensi trip total maupun sanksi deviasi suplai dari PLN.</span>
                </div>
              </section>
            </div>

            {/* Kolom samping (sempit) */}
            <aside className="xl:col-span-4 space-y-5">
              {/* Status unit */}
              <section aria-label="Status unit" className={`${card} p-5`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className={cardTitle}>Status unit pembangkit</h3>
                    <p className={cardSub}>Kapasitas terpasang 2 &times; 500 kW</p>
                  </div>
                  <Badge>Sinkron</Badge>
                </div>
                <div className="mt-4 space-y-3.5">
                  {[
                    { name: 'Unit 1', kw: executiveMetrics.plantStatus.unit1PowerKw, note: 'Bearing 76 °C, dipantau' },
                    { name: 'Unit 2', kw: executiveMetrics.plantStatus.unit2PowerKw, note: 'Kondisi normal' }
                  ].map((u) => (
                    <div key={u.name}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-800">{u.name}</span>
                        <span className="tabular-nums text-slate-600">{u.kw} / 500 kW</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 mt-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#0F4C81]"
                          style={{ width: `${(u.kw / 500) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-slate-500 mt-1.5">
                        {u.note}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* SCADA */}
              <section aria-label="Telemetri SCADA" className={`${card} overflow-hidden`}>
                <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className={cardTitle}>Telemetri SCADA per unit</h3>
                    <p className={cardSub}>Sinkron grid 20 kV</p>
                  </div>
                  <Badge>Terhubung</Badge>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[11px] text-slate-500 bg-slate-50 border-y border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4 font-medium">Parameter</th>
                        <th className="py-2.5 px-3 font-medium text-right">Unit 1</th>
                        <th className="py-2.5 px-3 font-medium text-right">Unit 2</th>
                        <th className="py-2.5 px-4 font-medium">Batas normal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 tabular-nums">
                      <tr className="hover:bg-slate-50/70">
                        <td className="py-2 px-4 text-slate-700">Status operasi</td>
                        <td className="py-2 px-3 text-right"><Badge>Running</Badge></td>
                        <td className="py-2 px-3 text-right"><Badge>Running</Badge></td>
                        <td className="py-2 px-4 text-slate-500">Sinkron grid</td>
                      </tr>
                      <tr className="hover:bg-slate-50/70">
                        <td className="py-2 px-4 text-slate-700">Daya aktif (P)</td>
                        <td className="py-2 px-3 text-right font-medium text-slate-900">475 kW</td>
                        <td className="py-2 px-3 text-right font-medium text-slate-900">460 kW</td>
                        <td className="py-2 px-4 text-slate-500">Maks. 500 kW/unit</td>
                      </tr>
                      <tr className="hover:bg-slate-50/70">
                        <td className="py-2 px-4 text-slate-700">Tegangan (V)</td>
                        <td className="py-2 px-3 text-right text-slate-900">398 V</td>
                        <td className="py-2 px-3 text-right text-slate-900">400 V</td>
                        <td className="py-2 px-4 text-slate-500">400 V &plusmn;5%</td>
                      </tr>
                      <tr className="hover:bg-slate-50/70">
                        <td className="py-2 px-4 text-slate-700">Frekuensi (f)</td>
                        <td className="py-2 px-3 text-right text-slate-900">50,02 Hz</td>
                        <td className="py-2 px-3 text-right text-slate-900">50,02 Hz</td>
                        <td className="py-2 px-4 text-slate-500">50,00 &plusmn;0,2 Hz</td>
                      </tr>
                      <tr className="hover:bg-slate-50/70">
                        <td className="py-2 px-4 text-slate-700">Debit air (Q)</td>
                        <td className="py-2 px-3 text-right text-slate-900">2,51 m³/s</td>
                        <td className="py-2 px-3 text-right text-slate-900">2,48 m³/s</td>
                        <td className="py-2 px-4 text-slate-500">Desain 2,65 m³/s</td>
                      </tr>
                      <tr className="hover:bg-slate-50/70">
                        <td className="py-2 px-4 text-slate-700">Suhu bearing</td>
                        <td className="py-2 px-3 text-right">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="font-medium text-slate-900">76 °C</span>
                            <Badge>Waspada</Badge>
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="text-slate-900">68 °C</span>
                            <Badge>Normal</Badge>
                          </span>
                        </td>
                        <td className="py-2 px-4 text-slate-500">Alarm trip &gt;85 °C</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Ringkasan keputusan (Dipindah ke bawah Telemetri SCADA) */}
              <section aria-label="Ringkasan evaluasi" className={card}>
                <div className="px-5 pt-4 pb-2 border-b border-slate-100">
                  <h3 className={cardTitle}>Ringkasan evaluasi dan keputusan operasional</h3>
                  <p className={cardSub}>Tinjauan performa dan arahan manajemen</p>
                </div>
                <div className="divide-y divide-slate-100 px-5 pb-2">
                  <div className="py-3">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-[13px] font-medium text-slate-900">Suplai energi dan kontrak PLN</h4>
                      <Badge>Terpenuhi</Badge>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed mt-1.5">
                      Realisasi <span className="font-medium text-slate-900">558,5 MWh</span>, 7,4% di atas target PPA. Debit hulu stabil rata-rata 2,45 m³/s.
                    </p>
                  </div>
                  <div className="py-3">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-[13px] font-medium text-slate-900">Keandalan mesin dan aset</h4>
                      <Badge>Risiko rendah</Badge>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed mt-1.5">
                      AF <span className="font-medium text-slate-900">98,1%</span> (target &gt;95%). Downtime 12 jam hanya untuk pemeliharaan terencana, tanpa trip mendadak.
                    </p>
                  </div>
                  <div className="py-3">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-[13px] font-medium text-slate-900">Tindak lanjut manajemen</h4>
                      <Badge>Perlu persetujuan</Badge>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed mt-1.5">
                      Dukung jadwal preventive maintenance seal MIV pada pekan ke-2 Oktober, sebelum debit puncak musim hujan.
                    </p>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManagementDashboard;