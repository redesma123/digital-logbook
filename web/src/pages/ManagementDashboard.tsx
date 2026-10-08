import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImage from '@/assets/logo.png';
import {
  FileSpreadsheet,
  RefreshCw,
  Info,
  LogOut,
  CheckCircle2,
  User
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

import {
  authApi,
  dashboardApi,
  analyticsApi,
  incidentApi,
  exportApi,
  type DashboardSummary,
  type PerformanceAnalytics,
  type IncidentItem
} from '@/api';

interface ProductionChartItem {
  label: string;
  energy: number;
  target: number;
  cf?: number;
  af?: number;
  flow?: number;
  power?: number;
}

// Data interface chart produksi
interface ProductionChartItem {
  label: string;
  energy: number;
  target: number;
  cf?: number;
  af?: number;
  flow?: number;
  power?: number;
}

const ManagementDashboard = () => {
  const [periodFilter, setPeriodFilter] = useState<'month' | 'week'>('month');
  const [summaryU1, setSummaryU1] = useState<DashboardSummary | null>(null);
  const [summaryU2, setSummaryU2] = useState<DashboardSummary | null>(null);
  const [performance, setPerformance] = useState<PerformanceAnalytics | null>(null);
  const [liveIncidents, setLiveIncidents] = useState<IncidentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  // Role Guard: Hanya peran MANAJEMEN yang dapat mengakses halaman ini
  useEffect(() => {
    const role = localStorage.getItem('user_role');
    if (role !== 'MANAJEMEN' && role !== 'MANAGEMENT') {
      alert('Akses Terbatas: Halaman ini khusus untuk peran Akun Manajemen (Direksi). Anda akan dialihkan ke halaman login.');
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const handleLogout = async () => {
    await authApi.logout();
    navigate('/login', { replace: true });
  };

  // Mengambil data terkini dari Backend REST API
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      const toDate = now.toISOString().split('T')[0];
      let fromDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      if (periodFilter === 'week') {
        const pastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        fromDate = pastWeek.toISOString().split('T')[0];
      }

      const [resU1, resU2, resPerf, resInc] = await Promise.allSettled([
        dashboardApi.getSummary(1),
        dashboardApi.getSummary(2),
        analyticsApi.getPerformance(1, fromDate, toDate),
        incidentApi.list({ limit: 5 }),
      ]);

      if (resU1.status === 'fulfilled') setSummaryU1(resU1.value);
      if (resU2.status === 'fulfilled') setSummaryU2(resU2.value);
      if (resPerf.status === 'fulfilled') setPerformance(resPerf.value);
      if (resInc.status === 'fulfilled') {
        const val = resInc.value as any;
        const incArray = Array.isArray(val)
          ? val
          : Array.isArray(val?.data)
          ? val.data
          : Array.isArray(val?.items)
          ? val.items
          : Array.isArray(val?.incidents)
          ? val.incidents
          : [];
        setLiveIncidents(incArray);
      }
    } catch (err) {
      console.error('Error fetching management dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [periodFilter]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handler Export Excel/CSV
  const handleExport = async (format: 'xlsx' | 'csv' = 'xlsx') => {
    setIsExporting(true);
    try {
      await exportApi.downloadLogbook({ unit_id: 1, format });
      setFeedbackMsg(`Laporan berhasil diunduh (${format.toUpperCase()})`);
      setTimeout(() => setFeedbackMsg(null), 3500);
    } catch (err) {
      alert('Gagal mengunduh laporan. Periksa koneksi backend.');
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  // Nilai metrik dari API (murni database, fallback 0 jika belum ada data)
  const u1Kw = summaryU1?.latest_entry?.electrical?.active_power_kw ?? 0;
  const u2Kw = summaryU2?.latest_entry?.electrical?.active_power_kw ?? 0;
  const totalKw = u1Kw + u2Kw;
  const currentAf = performance?.metrics?.availability_pct != null
    ? Number(performance.metrics.availability_pct.toFixed(1)) 
    : 0;
  const currentCf = performance?.metrics?.capacity_factor_pct != null
    ? Number(performance.metrics.capacity_factor_pct.toFixed(1)) 
    : 0;
  const totalEnergyMwh = performance?.metrics?.total_energy_kwh != null
    ? Number((performance.metrics.total_energy_kwh / 1000).toFixed(1)) 
    : 0;
  const todayEnergyKwh = (summaryU1?.today_energy_kwh ?? 0) + (summaryU2?.today_energy_kwh ?? 0);
  const totalActiveIncidents = (summaryU1?.active_incidents_count ?? 0) + (summaryU2?.active_incidents_count ?? 0);

  // Ringkasan Eksekutif Jawaban 5 Parameter Manajemen
  const executiveMetrics = {
    // 1. Kondisi PLTMH saat ini
    plantStatus: {
      totalActivePowerKw: totalKw,
      totalCapacityKw: 1000,
      loadPercentage: Number(((totalKw / 1000) * 100).toFixed(1)),
      frequencyHz: summaryU1?.latest_entry?.electrical?.frequency_hz ?? 0,
      gridVoltageV: summaryU1?.latest_entry?.electrical?.voltage_v ?? 0,
      waterHeadM: summaryU1?.latest_entry?.hydraulic?.water_level_m ?? 0,
      unit1Status: summaryU1?.unit?.current_status ?? 'STANDBY',
      unit1PowerKw: u1Kw,
      unit2Status: summaryU2?.unit?.current_status ?? 'STANDBY',
      unit2PowerKw: u2Kw
    },
    // 2. Berapa energi yang dihasilkan
    energyProduction: {
      thisMonthMwh: totalEnergyMwh,
      targetMonthMwh: 520.0,
      todayKwh: todayEnergyKwh,
      ytdGwh: Number((totalEnergyMwh / 1000).toFixed(2)),
      estimatedRevenueIdr: Math.round(totalEnergyMwh * 1000 * 1050),
      revenueDeltaPercentage: totalEnergyMwh > 0 ? Number((((totalEnergyMwh - 520) / 520) * 100).toFixed(1)) : 0
    },
    // 3. Apakah performa turun
    performanceEvaluation: {
      isPerformanceDown: currentCf > 0 && currentCf < 70,
      capacityFactorPct: currentCf,
      prevCapacityFactorPct: 0,
      cfDeltaPct: 0,
      hydraulicEfficiencyPct: performance?.metrics?.water_utilization_pct != null
        ? Number(performance.metrics.water_utilization_pct.toFixed(1)) 
        : 0,
      healthIndexScore: totalActiveIncidents === 0 ? 100 : 85,
      evaluationNote: currentCf >= 70
        ? 'Performa stabil dan di atas target. Tidak ada indikasi kavitasi atau penurunan efisiensi termal.'
        : currentCf === 0
        ? 'Belum ada data pencatatan logbook operasional di database.'
        : 'Performa berada di bawah target kapasitas desain.'
    },
    // 4. Berapa availability unit
    availability: {
      availabilityFactorPct: currentAf,
      totalRunningHours: performance?.metrics?.total_running_hours ?? 0,
      totalPeriodHours: performance?.period?.period_hours ?? 720,
      downtimeHours: (performance?.period?.period_hours ?? 720) - (performance?.metrics?.total_running_hours ?? 0),
      plannedMaintenanceHours: 0,
      unplannedDowntimeHours: 0,
      reliabilityScore: 100
    },
    // 5. Apa saja gangguan yang terjadi
    incidentsSummary: {
      activeProcessCount: totalActiveIncidents,
      resolvedThisMonthCount: 0,
      totalThisMonth: totalActiveIncidents,
      recentIncidents: (Array.isArray(liveIncidents) && liveIncidents.length > 0)
        ? liveIncidents.map((inc) => {
            const rawDate = (inc as any).occurred_at || inc.reported_at || (inc as any).created_at;
            let formattedDate = 'Baru saja';
            if (rawDate) {
              const d = new Date(rawDate);
              if (!isNaN(d.getTime())) {
                formattedDate = d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) + ' WIB';
              }
            }
            const actionText = inc.action_taken || (inc as any).operator_action || 'Dalam pemantauan operasional';
            return {
              id: inc.id,
              code: `INC-2026-${String(inc.id).padStart(3, '0')}`,
              unit: inc.unit?.name || 'Unit 1 (PLTMH)',
              equipment: inc.equipment,
              issue: inc.description,
              status: inc.status,
              impact: actionText,
              occurredAt: formattedDate,
              action: actionText
            };
          })
        : []
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
  const resolvedPct = executiveMetrics.incidentsSummary.totalThisMonth > 0
    ? Math.round((executiveMetrics.incidentsSummary.resolvedThisMonthCount / executiveMetrics.incidentsSummary.totalThisMonth) * 100)
    : 100;

  const dynamicMonthlyTrend: ProductionChartItem[] = [
    { label: 'Mei', energy: 0, target: 520 },
    { label: 'Jun', energy: 0, target: 500 },
    { label: 'Jul', energy: 0, target: 480 },
    { label: 'Ags', energy: 0, target: 470 },
    { label: 'Sep', energy: 0, target: 530 },
    { label: 'Bulan Berjalan', energy: totalEnergyMwh, target: 520, cf: currentCf, af: currentAf },
  ];

  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const today = new Date();
  const dynamicDailyData: ProductionChartItem[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    const dayName = dayNames[d.getDay()];
    const isToday = i === 6;
    return {
      label: dayName,
      energy: isToday ? Number((todayEnergyKwh / 1000).toFixed(2)) : 0,
      target: 19.5,
    };
  });

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
      note: `Efisiensi hidrolik ${executiveMetrics.performanceEvaluation.hydraulicEfficiencyPct}%`
    },
    {
      label: 'Availability factor',
      value: String(executiveMetrics.availability.availabilityFactorPct),
      note: `Operasi ${executiveMetrics.availability.totalRunningHours} dari ${executiveMetrics.availability.totalPeriodHours} jam`
    }
  ];

  const currentUserName = localStorage.getItem('user_name') || 'Pengguna';
  const currentUserRole = localStorage.getItem('user_role') || 'MANAGEMENT';

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
              <User size={20} className="text-slate-600" />
              <div className="leading-tight hidden sm:block">
                <div className="text-[13px] font-medium text-slate-900">{currentUserName}</div>
                <div className="text-xs text-slate-500">{currentUserRole}</div>
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
          {feedbackMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs flex items-center gap-2 shadow-xs">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Dashboard Manajemen</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Capaian produksi, keandalan unit, dan gangguan &middot; Oktober 2026 {isLoading && '(Memperbarui...)'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isExporting}
                onClick={() => handleExport('xlsx')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap shadow-xs disabled:opacity-60"
              >
                <FileSpreadsheet size={14} className="text-emerald-600" />
                <span>{isExporting ? 'Mengunduh...' : 'Ekspor Excel'}</span>
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={loadDashboardData}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0F4C81] hover:bg-[#0c3d66] text-white rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap shadow-xs disabled:opacity-70"
              >
                <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                <span>{isLoading ? 'Menyinkronkan...' : 'Perbarui'}</span>
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
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-[28px] leading-8 font-semibold text-slate-900 tabular-nums">
                  {executiveMetrics.incidentsSummary.totalThisMonth}
                </span>
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
                        data={periodFilter === 'month' ? dynamicMonthlyTrend : dynamicDailyData}
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
                      <ComposedChart data={dynamicMonthlyTrend} margin={{ top: 6, right: 8, bottom: 0, left: -12 }}>
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
                  <span>CF <span className="font-medium text-slate-900">{currentCf}%</span> &middot; target &gt;70%</span>
                  <span>AF <span className="font-medium text-slate-900">{currentAf}%</span> &middot; target &gt;95%</span>
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
                  {incidents.length === 0 ? (
                    <li className="py-8 text-center text-xs text-slate-400">
                      Belum ada catatan gangguan operasional di database.
                    </li>
                  ) : (
                    incidents.map((incident, idx) => (
                      <li key={incident.id} className={`py-3 ${idx > 0 ? 'border-t border-slate-100' : ''}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-[13px] font-medium text-slate-900">{incident.equipment}</div>
                            <div className="text-xs text-slate-500">{incident.unit} &middot; {incident.code}</div>
                          </div>
                          {incident.status === 'OPEN' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200">
                              Baru (Open)
                            </span>
                          ) : incident.status === 'PROCESS' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200">
                              Dalam proses
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200">
                              Selesai
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">{incident.issue}</p>
                        <div className="text-xs text-slate-500 mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                          <div>Dampak: {incident.impact}</div>
                          <div className="tabular-nums">{incident.occurredAt}</div>
                        </div>
                      </li>
                    ))
                  )}
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
                  <span className="text-xs font-semibold text-slate-700">{totalKw > 0 ? 'Sinkron' : 'Standby'}</span>
                </div>
                <div className="mt-4 space-y-3.5">
                  {[
                    { name: 'Unit 1', kw: executiveMetrics.plantStatus.unit1PowerKw, note: summaryU1?.latest_entry?.notes || 'Kondisi operasional normal' },
                    { name: 'Unit 2', kw: executiveMetrics.plantStatus.unit2PowerKw, note: summaryU2?.latest_entry?.notes || 'Kondisi operasional normal' }
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
                  <span className="text-xs font-semibold text-slate-700">Terhubung</span>
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
                        <td className="py-2 px-3 text-right font-semibold text-slate-700">{summaryU1?.unit?.current_status ?? (isLoading ? 'Memuat' : 'Standby')}</td>
                        <td className="py-2 px-3 text-right font-semibold text-slate-700">{summaryU2?.unit?.current_status ?? (isLoading ? 'Memuat' : 'Standby')}</td>
                        <td className="py-2 px-4 text-slate-500">Sinkron grid</td>
                      </tr>
                      <tr className="hover:bg-slate-50/70">
                        <td className="py-2 px-4 text-slate-700">Daya aktif (P)</td>
                        <td className="py-2 px-3 text-right font-medium text-slate-900">{u1Kw > 0 ? `${u1Kw} kW` : '-'}</td>
                        <td className="py-2 px-3 text-right font-medium text-slate-900">{u2Kw > 0 ? `${u2Kw} kW` : '-'}</td>
                        <td className="py-2 px-4 text-slate-500">Maks. 500 kW/unit</td>
                      </tr>
                      <tr className="hover:bg-slate-50/70">
                        <td className="py-2 px-4 text-slate-700">Tegangan (V)</td>
                        <td className="py-2 px-3 text-right text-slate-900">{summaryU1?.latest_entry?.electrical?.voltage_v ? `${summaryU1.latest_entry.electrical.voltage_v} V` : '-'}</td>
                        <td className="py-2 px-3 text-right text-slate-900">{summaryU2?.latest_entry?.electrical?.voltage_v ? `${summaryU2.latest_entry.electrical.voltage_v} V` : '-'}</td>
                        <td className="py-2 px-4 text-slate-500">400 V &plusmn;5%</td>
                      </tr>
                      <tr className="hover:bg-slate-50/70">
                        <td className="py-2 px-4 text-slate-700">Frekuensi (f)</td>
                        <td className="py-2 px-3 text-right text-slate-900">{summaryU1?.latest_entry?.electrical?.frequency_hz ? `${summaryU1.latest_entry.electrical.frequency_hz} Hz` : '-'}</td>
                        <td className="py-2 px-3 text-right text-slate-900">{summaryU2?.latest_entry?.electrical?.frequency_hz ? `${summaryU2.latest_entry.electrical.frequency_hz} Hz` : '-'}</td>
                        <td className="py-2 px-4 text-slate-500">50,00 &plusmn;0,2 Hz</td>
                      </tr>
                      <tr className="hover:bg-slate-50/70">
                        <td className="py-2 px-4 text-slate-700">Debit air (Q)</td>
                        <td className="py-2 px-3 text-right text-slate-900">{summaryU1?.latest_entry?.hydraulic?.water_flow_m3_s ? `${summaryU1.latest_entry.hydraulic.water_flow_m3_s} m³/s` : '-'}</td>
                        <td className="py-2 px-3 text-right text-slate-900">{summaryU2?.latest_entry?.hydraulic?.water_flow_m3_s ? `${summaryU2.latest_entry.hydraulic.water_flow_m3_s} m³/s` : '-'}</td>
                        <td className="py-2 px-4 text-slate-500">Desain 2,65 m³/s</td>
                      </tr>
                      <tr className="hover:bg-slate-50/70">
                        <td className="py-2 px-4 text-slate-700">Suhu bearing</td>
                        <td className="py-2 px-3 text-right">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="font-medium text-slate-900">
                              {summaryU1?.latest_entry?.mechanical?.bearing_temp_c ? `${summaryU1.latest_entry.mechanical.bearing_temp_c} °C` : '-'}
                            </span>
                            {summaryU1?.latest_entry?.mechanical?.bearing_temp_c ? <Badge>Normal</Badge> : null}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="text-slate-900">
                              {summaryU2?.latest_entry?.mechanical?.bearing_temp_c ? `${summaryU2.latest_entry.mechanical.bearing_temp_c} °C` : '-'}
                            </span>
                            {summaryU2?.latest_entry?.mechanical?.bearing_temp_c ? <Badge>Normal</Badge> : null}
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
                      <Badge>{totalEnergyMwh > 0 ? 'Terpenuhi' : 'Belum Ada Data'}</Badge>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed mt-1.5">
                      Realisasi <span className="font-medium text-slate-900">{totalEnergyMwh} MWh</span> dari target bulanan PPA 520 MWh.
                    </p>
                  </div>
                  <div className="py-3">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-[13px] font-medium text-slate-900">Keandalan mesin dan aset</h4>
                      <Badge>{currentAf >= 95 ? 'Risiko rendah' : currentAf === 0 ? 'Standby' : 'Perlu perhatian'}</Badge>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed mt-1.5">
                      AF <span className="font-medium text-slate-900">{currentAf}%</span> (target &gt;95%). Total jam operasi: {performance?.metrics?.total_running_hours ?? 0} jam.
                    </p>
                  </div>
                  <div className="py-3">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-[13px] font-medium text-slate-900">Tindak lanjut manajemen</h4>
                      <Badge>{executiveMetrics.incidentsSummary.activeProcessCount > 0 ? 'Perlu tindakan' : 'Normal'}</Badge>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed mt-1.5">
                      {executiveMetrics.incidentsSummary.activeProcessCount > 0
                        ? `Terdapat ${executiveMetrics.incidentsSummary.activeProcessCount} gangguan aktif yang memerlukan perhatian teknis.`
                        : 'Tidak ada gangguan aktif yang memerlukan tindak lanjut darurat.'}
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