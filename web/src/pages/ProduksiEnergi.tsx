import { useState, useMemo, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { Button } from '../components/ui/button';
import { unitApi, UnitItem } from '../api/unit.api';
import { analyticsApi, PerformanceAnalytics } from '../api/analytics.api';
import { logbookApi } from '../api/logbook.api';
import {
  Zap,
  Filter,
  FileSpreadsheet,
  RefreshCw,
  Activity,
  Eye,
  X
} from 'lucide-react';
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Line
} from 'recharts';

export interface ProductionRecord {
  id: number;
  date: string;
  timeSlot: string;
  unit_id: number;
  unit_name: string;
  running_hours: number;
  avg_power_kw: number;
  energy_kwh: number;
  avg_flow_m3s: number;
  water_utilization_pct: number;
  capacity_factor_pct: number;
  availability_pct: number;
  revenue_estimation_idr: number;
  status: 'OPTIMAL' | 'NORMAL' | 'MAINTENANCE';
}



const ProduksiEnergi = () => {
  const [units, setUnits] = useState<UnitItem[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>('ALL');
  const [timePeriod, setTimePeriod] = useState<'today' | '7d' | '30d' | 'year'>('7d');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [searchTableQuery, setSearchTableQuery] = useState<string>('');
  const [selectedRecordDetail, setSelectedRecordDetail] = useState<ProductionRecord | null>(null);
  const [analyticsData, setAnalyticsData] = useState<PerformanceAnalytics | null>(null);
  const [tableRecords, setTableRecords] = useState<ProductionRecord[]>([]);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const data = await unitApi.list();
        if (data && data.length > 0) {
          setUnits(data);
        }
      } catch (err) {
        console.error('Gagal mengambil daftar unit:', err);
      }
    };
    fetchUnits();
  }, []);

  useEffect(() => {
    const fetchLogbook = async () => {
      try {
        const res = await logbookApi.list({ limit: 100 });
        if (res && res.data && res.data.length > 0) {
          const mapped: ProductionRecord[] = res.data.map((item) => {
            const runningHours = item.running_hours ?? 0;
            const avgPower = item.params_electrical?.active_power_kw ?? 0;
            const energyKwh = item.params_electrical?.energy_production_kwh ?? (runningHours * avgPower);
            const avgFlow = item.params_hydraulic?.water_flow_m3_s ?? 0;
            const capacityKw = 500;
            const cf = runningHours > 0 ? (energyKwh / (capacityKw * 8)) * 100 : 0;
            const waterUtil = (avgFlow / 2.65) * 100;
            return {
              id: item.id,
              date: item.date ? item.date.split('T')[0] : '-',
              timeSlot: item.shift ? `Shift ${item.shift}` : '-',
              unit_id: item.unit_id,
              unit_name: item.unit?.name || `Unit ${item.unit_id}`,
              running_hours: runningHours,
              avg_power_kw: avgPower,
              energy_kwh: energyKwh,
              avg_flow_m3s: avgFlow,
              water_utilization_pct: Number(waterUtil.toFixed(1)),
              capacity_factor_pct: Number(cf.toFixed(1)),
              availability_pct: runningHours > 0 ? Number(((runningHours / 8) * 100).toFixed(1)) : 0,
              revenue_estimation_idr: Math.round(energyKwh * 1050),
              status: item.unit_status === 'RUNNING' ? 'OPTIMAL' : item.unit_status === 'STANDBY' ? 'NORMAL' : 'MAINTENANCE',
            };
          });
          setTableRecords(mapped);
        } else {
          setTableRecords([]);
        }
      } catch (err) {
        console.error('Gagal mengambil data rekap logbook:', err);
        setTableRecords([]);
      }
    };
    fetchLogbook();
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (selectedUnit === 'ALL') return;
      try {
        const unitId = Number(selectedUnit);
        if (isNaN(unitId)) return;
        const now = new Date();
        const to = now.toISOString().split('T')[0];
        const fromDateObj = new Date();
        if (timePeriod === 'today') fromDateObj.setDate(now.getDate() - 1);
        else if (timePeriod === '7d') fromDateObj.setDate(now.getDate() - 7);
        else if (timePeriod === '30d') fromDateObj.setDate(now.getDate() - 30);
        else fromDateObj.setDate(now.getDate() - 365);
        const from = fromDateObj.toISOString().split('T')[0];

        const res = await analyticsApi.getPerformance(unitId, from, to);
        if (res) {
          setAnalyticsData(res);
        }
      } catch {
        setAnalyticsData(null);
      }
    };
    fetchAnalytics();
  }, [selectedUnit, timePeriod]);

  // Filter Table Data
  const filteredTableRecords = useMemo(() => {
    return tableRecords.filter((rec) => {
      if (selectedUnit !== 'ALL' && rec.unit_id.toString() !== selectedUnit) {
        return false;
      }
      if (fromDate && rec.date < fromDate) {
        return false;
      }
      if (toDate && rec.date > toDate) {
        return false;
      }
      if (searchTableQuery.trim() !== '') {
        const q = searchTableQuery.toLowerCase();
        const match =
          rec.date.toLowerCase().includes(q) ||
          rec.timeSlot.toLowerCase().includes(q) ||
          rec.unit_name.toLowerCase().includes(q) ||
          rec.status.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [tableRecords, selectedUnit, fromDate, toDate, searchTableQuery]);

  // Dynamic Chart Data based on timePeriod and selectedUnit
  const currentChartData = useMemo(() => {
    if (tableRecords.length === 0) return [];

    return tableRecords
      .filter((rec) => selectedUnit === 'ALL' || rec.unit_id.toString() === selectedUnit)
      .slice(0, 12)
      .map((rec) => ({
        time: rec.timeSlot,
        date: rec.date,
        label: rec.date,
        displayEnergy: rec.energy_kwh,
        displayTarget: 4000,
        flow: rec.avg_flow_m3s,
        avgFlow: rec.avg_flow_m3s,
        unit1: rec.unit_id === 1 ? rec.energy_kwh : 0,
        unit2: rec.unit_id === 2 ? rec.energy_kwh : 0,
        totalEnergy: rec.energy_kwh,
      }));
  }, [tableRecords, selectedUnit]);

  // Analytics Metrics strictly calculated from database
  const metrics = useMemo(() => {
    const isSingleUnit = selectedUnit !== 'ALL';
    const installedCapacityKw = isSingleUnit ? 500 : 1000;
    const designFlowM3s = isSingleUnit ? 2.65 : 5.30;

    let periodHours = 168;
    if (timePeriod === 'today') periodHours = 24;
    else if (timePeriod === '7d') periodHours = 168;
    else if (timePeriod === '30d') periodHours = 720;
    else periodHours = 8760;

    let totalEnergyKwh = 0;
    let avgFlow = 0;
    let runningHours = 0;
    let prevEnergyKwh = 0;
    let prevCf = 0;
    let prevAvailability = 0;

    if (analyticsData) {
      totalEnergyKwh = analyticsData.metrics.total_energy_kwh || 0;
      runningHours = analyticsData.metrics.total_running_hours || 0;
      avgFlow = analyticsData.metrics.average_flow_m3_s || 0;
    } else if (tableRecords.length > 0) {
      const relevant = tableRecords.filter(
        (r) => selectedUnit === 'ALL' || r.unit_id.toString() === selectedUnit
      );
      totalEnergyKwh = relevant.reduce((acc, cur) => acc + cur.energy_kwh, 0);
      runningHours = relevant.reduce((acc, cur) => acc + cur.running_hours, 0);
      avgFlow = relevant.length > 0 ? relevant.reduce((acc, cur) => acc + cur.avg_flow_m3s, 0) / relevant.length : 0;
    }

    // Capacity Factor (%)
    const capacityFactor = periodHours > 0 && totalEnergyKwh > 0
      ? Math.min(100, (totalEnergyKwh / (installedCapacityKw * periodHours)) * 100)
      : 0;
    // Availability (%)
    const availability = periodHours > 0 && runningHours > 0
      ? Math.min(100, (runningHours / periodHours) * 100)
      : 0;
    // Water Utilization (%)
    const waterUtilization = avgFlow > 0
      ? Math.min(100, (avgFlow / designFlowM3s) * 100)
      : 0;
    // Hydraulic Efficiency (kWh produced per m3 water)
    const totalWaterVolumeM3 = avgFlow * periodHours * 3600;
    const waterEfficiency = totalWaterVolumeM3 > 0 && totalEnergyKwh > 0
      ? (totalEnergyKwh / (totalWaterVolumeM3 / 1000)).toFixed(2)
      : '0.00';

    const energyDeltaPct = prevEnergyKwh > 0 ? Number((((totalEnergyKwh - prevEnergyKwh) / prevEnergyKwh) * 100).toFixed(1)) : 0;
    const cfDelta = Number((capacityFactor - prevCf).toFixed(1));
    const availDelta = Number((availability - prevAvailability).toFixed(1));

    return {
      totalEnergyKwh,
      totalEnergyFormatted:
        timePeriod === 'year'
          ? (totalEnergyKwh / 1000000).toFixed(2) + ' GWh'
          : timePeriod === '30d' || timePeriod === '7d'
          ? (totalEnergyKwh / 1000).toFixed(1) + ' MWh'
          : totalEnergyKwh.toLocaleString('id-ID') + ' kWh',
      capacityFactor: capacityFactor.toFixed(1),
      availability: availability.toFixed(1),
      waterUtilization: waterUtilization.toFixed(1),
      waterEfficiency,
      avgFlow: avgFlow.toFixed(2),
      energyDeltaPct,
      cfDelta,
      availDelta,
      installedCapacityKw,
      runningHours: runningHours.toFixed(1),
      periodHours
    };
  }, [timePeriod, selectedUnit]);

  // Export Table Data to CSV
  const handleExportCSV = () => {
    const headers = [
      'No',
      'Tanggal',
      'Waktu/Shift',
      'Unit PLTMH',
      'Running Hours (Jam)',
      'Daya Rata-rata (kW)',
      'Energi (kWh)',
      'Debit Rata-rata (m3/s)',
      'Water Utilization (%)',
      'Capacity Factor (%)',
      'Availability (%)',
      'Status Operasional'
    ];

    const rows = filteredTableRecords.map((r, i) => [
      i + 1,
      `"${r.date}"`,
      `"${r.timeSlot}"`,
      `"${r.unit_name}"`,
      r.running_hours,
      r.avg_power_kw,
      r.energy_kwh,
      r.avg_flow_m3s,
      r.water_utilization_pct,
      r.capacity_factor_pct,
      r.availability_pct,
      `"${r.status}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Produksi_Energi_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const card = 'bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_8px_rgba(15,23,42,0.05)]';

  return (
    <div
      className="flex h-screen bg-[#EEF2F7] text-slate-800 text-[13px]"
      style={{ fontFamily: '"IBM Plex Sans", Arial, Helvetica, sans-serif' }}
    >
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-[1400px] mx-auto space-y-5">
            {/* Top Bar / Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
                  Analisis & Pemantauan Produksi Energi
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Statistik output energi listrik PLTMH, korelasi debit air, rasio Capacity Factor, dan pemenuhan target suplai PLN.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center flex-wrap gap-2">
                <Button
                  onClick={handleExportCSV}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium text-xs h-8 px-3 rounded-lg shadow-xs flex items-center"
                >
                  <FileSpreadsheet size={14} className="mr-1.5 text-slate-600" />
                  Ekspor Laporan (CSV)
                </Button>

                <Button
                  onClick={() => alert('Data telemetri produksi energi telah diperbarui secara realtime.')}
                  className="bg-[#0F4C81] hover:bg-[#0c3d66] text-white font-medium text-xs h-8 px-3 rounded-lg shadow-xs flex items-center"
                >
                  <RefreshCw size={13} className="mr-1.5" />
                  Perbarui Data
                </Button>
              </div>
            </div>

            {/* KPI Cards (sesuai gaya Management Dashboard) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`${card} p-4`}>
                <span className="text-xs font-medium text-slate-500">Total Produksi Energi</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-[28px] leading-8 font-semibold text-slate-900 tabular-nums">
                    {metrics.totalEnergyFormatted}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                </div>
              </div>

              <div className={`${card} p-4`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-500">Capacity Factor (CF)</span>
                </div>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-[28px] leading-8 font-semibold text-slate-900 tabular-nums">
                    {metrics.capacityFactor}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                </div>
              </div>

              <div className={`${card} p-4`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-500">Availability Factor (AF)</span>
                </div>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-[28px] leading-8 font-semibold text-slate-900 tabular-nums">
                    {metrics.availability}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                </div>
              </div>

              <div className={`${card} p-4`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-500">Water Utilization Rate</span>
                </div>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-[28px] leading-8 font-semibold text-slate-900 tabular-nums">
                    {metrics.waterUtilization}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                </div>
              </div>
            </div>

            {/* Filter & Period Controls */}
            <div className={`${card} p-4 flex flex-wrap items-center justify-between gap-3 text-xs`}>
              <div className="flex flex-wrap gap-3 items-center">
                {/* Unit Select */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">Unit:</span>
                  <select
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    className="h-8 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-medium px-2.5 outline-none focus:border-slate-400"
                  >
                    <option value="ALL">Semua Unit (Unit 1 & 2 - 1.000 kW)</option>
                    {units.length > 0 ? (
                      units.map((u) => (
                        <option key={u.id} value={u.id.toString()}>
                          {u.name} ({u.capacity || 500} kW)
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="1">Unit 1 (500 kW)</option>
                        <option value="2">Unit 2 (500 kW)</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Period Selector Tabs */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">Periode:</span>
                  <div className="bg-slate-100 rounded-full p-0.5 flex text-xs">
                    <button
                      type="button"
                      onClick={() => setTimePeriod('today')}
                      className={`px-3 py-1 rounded-full cursor-pointer transition-colors ${
                        timePeriod === 'today'
                          ? 'bg-[#0F4C81] text-white font-medium'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Hari Ini
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimePeriod('7d')}
                      className={`px-3 py-1 rounded-full cursor-pointer transition-colors ${
                        timePeriod === '7d'
                          ? 'bg-[#0F4C81] text-white font-medium'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      7 Hari
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimePeriod('30d')}
                      className={`px-3 py-1 rounded-full cursor-pointer transition-colors ${
                        timePeriod === '30d'
                          ? 'bg-[#0F4C81] text-white font-medium'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      30 Hari
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimePeriod('year')}
                      className={`px-3 py-1 rounded-full cursor-pointer transition-colors ${
                        timePeriod === 'year'
                          ? 'bg-[#0F4C81] text-white font-medium'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Tahun 2026
                    </button>
                  </div>
                </div>

                {/* Date Inputs */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">Dari:</span>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="h-8 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-medium px-2.5 outline-none focus:border-slate-400"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">Sampai:</span>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="h-8 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-medium px-2.5 outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              {/* Reset Filter Button */}
              {(selectedUnit !== 'ALL' || timePeriod !== '7d' || fromDate !== '' || toDate !== '') && (
                <Button
                  onClick={() => {
                    setSelectedUnit('ALL');
                    setTimePeriod('7d');
                    setFromDate('');
                    setToDate('');
                  }}
                  className="text-xs h-8 bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium px-3 rounded-lg shadow-none"
                >
                  <Filter size={12} className="mr-1 text-slate-400" />
                  Reset
                </Button>
              )}
            </div>

            {/* Visual Analytics Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Grafik 1: Produksi Energi Aktual vs Target PLN */}
              <div className={`${card} p-5`}>
                <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                      Produksi Energi vs Target Kontrak PLN (PPA)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Komparasi daya tersalurkan aktual (kWh / MWh) dengan kuota grid PLN
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium text-slate-700 bg-slate-100 border border-slate-200">
                    {selectedUnit === 'ALL' ? 'Unit 1 & 2' : `Unit ${selectedUnit}`}
                  </span>
                </div>

                <div className="h-[240px] w-full mt-3">
                  {currentChartData.length === 0 ? (
                    <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                      <Zap size={24} className="text-slate-300 mb-1.5" />
                      <span className="text-xs">Belum ada data telemetri produksi energi di database.</span>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={currentChartData} margin={{ top: 10, right: 10, bottom: 5, left: -10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis
                          dataKey={timePeriod === 'today' ? 'time' : timePeriod === '7d' ? 'date' : 'label'}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: '#64748B' }}
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                        <RechartsTooltip
                          formatter={(value: any, name: any) => [
                            timePeriod === 'year' ? `${value} MWh` : `${value.toLocaleString('id-ID')} kWh`,
                            name === 'displayEnergy' ? 'Produksi Aktual' : 'Target Kontrak'
                          ]}
                          contentStyle={{
                            backgroundColor: '#0F172A',
                            borderColor: '#334155',
                            borderRadius: '4px',
                            color: '#F8FAFC',
                            fontSize: '11px',
                            padding: '6px 10px'
                          }}
                        />
                        <Legend
                          verticalAlign="top"
                          align="right"
                          iconType="circle"
                          wrapperStyle={{ paddingBottom: '8px', fontSize: '11px' }}
                          formatter={(val) => (val === 'displayEnergy' ? 'Aktual' : 'Target PPA')}
                        />
                        <Bar dataKey="displayEnergy" name="displayEnergy" fill="#0F4C81" radius={[2, 2, 0, 0]} barSize={20} />
                        <Line
                          type="monotone"
                          dataKey="displayTarget"
                          name="displayTarget"
                          stroke="#10B981"
                          strokeWidth={2}
                          strokeDasharray="4 4"
                          dot={{ r: 2.5, fill: '#10B981' }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
                  <div>Rata-rata: <strong className="text-slate-800">{metrics.capacityFactor}% Target</strong></div>
                </div>
              </div>

              {/* Grafik 2: Korelasi Daya & Debit Air */}
              <div className={`${card} p-5`}>
                <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                      Korelasi Output Daya (kW) &amp; Debit Aliran Air (m³/s)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Efisiensi hidrolik turbin: hubungan laju aliran debit dengan daya generator
                    </p>
                  </div>
                </div>

                <div className="h-[240px] w-full mt-3">
                  {currentChartData.length === 0 ? (
                    <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                      <Activity size={24} className="text-slate-300 mb-1.5" />
                      <span className="text-xs">Belum ada data korelasi daya dan debit di database.</span>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={currentChartData} margin={{ top: 10, right: 10, bottom: 5, left: -10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis
                          dataKey={timePeriod === 'today' ? 'time' : timePeriod === '7d' ? 'date' : 'label'}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: '#64748B' }}
                        />
                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: '#0891B2' }}
                          domain={[0, 5]}
                        />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: '#0F172A',
                            borderColor: '#334155',
                            borderRadius: '4px',
                            color: '#F8FAFC',
                            fontSize: '11px',
                            padding: '6px 10px'
                          }}
                        />
                        <Legend
                          verticalAlign="top"
                          align="right"
                          iconType="circle"
                          wrapperStyle={{ paddingBottom: '8px', fontSize: '11px' }}
                          formatter={(val) => (val === 'displayEnergy' ? 'Daya (kW)' : 'Debit Air (m³/s)')}
                        />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="displayEnergy"
                          name="displayEnergy"
                          stroke="#0F4C81"
                          strokeWidth={2}
                          dot={{ r: 2.5, fill: '#0F4C81' }}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey={timePeriod === 'today' ? 'flow' : 'avgFlow'}
                          name={timePeriod === 'today' ? 'flow' : 'avgFlow'}
                          stroke="#0891B2"
                          strokeWidth={2}
                          dot={{ r: 2.5, fill: '#0891B2' }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
                  <div>Q Desain Intake: <strong className="text-slate-800">2.65 m³/s / unit</strong></div>
                  <div>Spesifik: <strong className="text-blue-700">{metrics.waterEfficiency} kWh / m³</strong></div>
                </div>
              </div>
            </div>

            {/* Technical Comparison Table: Unit 1 vs Unit 2 Operational Distribution */}
            <div className={`${card} overflow-hidden`}>
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800">
                    Matriks Distribusi &amp; Perbandingan Teknis (Unit 1 vs Unit 2)
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  Total Kapasitas: <strong className="text-slate-800">1.000 kW (2 &times; 500 kW)</strong>
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] text-slate-500 bg-slate-50 font-medium border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4 font-medium">Unit Turbin-Generator</th>
                      <th className="py-2.5 px-3 text-center font-medium">Status</th>
                      <th className="py-2.5 px-3 text-right font-medium">Daya Terpasang</th>
                      <th className="py-2.5 px-3 text-right font-medium">Output Aktual</th>
                      <th className="py-2.5 px-3 text-right font-medium">Share Produksi</th>
                      <th className="py-2.5 px-3 text-right font-medium">Capacity Factor</th>
                      <th className="py-2.5 px-3 text-right font-medium">Jam Operasi</th>
                      <th className="py-2.5 px-3 text-right font-medium">Laju Debit Air</th>
                      <th className="py-2.5 px-4 text-right font-medium">Suhu Bearing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(() => {
                      const u1Record = tableRecords.find((r) => r.unit_id === 1);
                      const u2Record = tableRecords.find((r) => r.unit_id === 2);
                      const totalPower = (u1Record?.avg_power_kw || 0) + (u2Record?.avg_power_kw || 0);
                      const u1Share = totalPower > 0 ? (((u1Record?.avg_power_kw || 0) / totalPower) * 100).toFixed(1) + '%' : '-';
                      const u2Share = totalPower > 0 ? (((u2Record?.avg_power_kw || 0) / totalPower) * 100).toFixed(1) + '%' : '-';

                      return (
                        <>
                          <tr className="hover:bg-slate-50/70">
                            <td className="py-2.5 px-4 font-medium text-slate-900">
                              PLTMH Unit 1
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="text-xs font-medium text-slate-700 whitespace-nowrap">
                                {u1Record ? u1Record.status : 'STANDBY'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-600">500 kW</td>
                            <td className="py-2.5 px-3 text-right font-medium text-slate-900">
                              {u1Record ? `${u1Record.avg_power_kw} kW` : '-'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-medium text-slate-900">
                              {u1Share}
                            </td>
                            <td className="py-2.5 px-3 text-right font-medium text-slate-900">
                              {u1Record ? `${u1Record.capacity_factor_pct}%` : '0%'}
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-600">
                              {u1Record ? `${u1Record.running_hours.toFixed(1)} Jam` : '0 Jam'}
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-900">
                              {u1Record ? `${u1Record.avg_flow_m3s.toFixed(2)} m³/s` : '-'}
                            </td>
                            <td className="py-2.5 px-4 text-right text-slate-900">-</td>
                          </tr>
                          <tr className="hover:bg-slate-50/70">
                            <td className="py-2.5 px-4 font-medium text-slate-900">
                              PLTMH Unit 2
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="text-xs font-medium text-slate-700 whitespace-nowrap">
                                {u2Record ? u2Record.status : 'STANDBY'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-600">500 kW</td>
                            <td className="py-2.5 px-3 text-right font-medium text-slate-900">
                              {u2Record ? `${u2Record.avg_power_kw} kW` : '-'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-medium text-slate-900">
                              {u2Share}
                            </td>
                            <td className="py-2.5 px-3 text-right font-medium text-slate-900">
                              {u2Record ? `${u2Record.capacity_factor_pct}%` : '0%'}
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-600">
                              {u2Record ? `${u2Record.running_hours.toFixed(1)} Jam` : '0 Jam'}
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-900">
                              {u2Record ? `${u2Record.avg_flow_m3s.toFixed(2)} m³/s` : '-'}
                            </td>
                            <td className="py-2.5 px-4 text-right text-slate-900">-</td>
                          </tr>
                        </>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TABEL RINCIAN LOGGING PRODUKSI ENERGI (F-38, F-41) */}
            <div className={`${card} overflow-hidden`}>
              <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Log Rekapitulasi Produksi Energi (Per Shift)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Transmisi telemetri meteran kWh, jam operasi, debit air, dan kalkulasi Capacity Factor
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Cari tanggal, shift, unit..."
                    value={searchTableQuery}
                    onChange={(e) => setSearchTableQuery(e.target.value)}
                    className="h-8 pl-3 pr-3 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-medium placeholder-slate-400 w-52 outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] text-slate-500 bg-slate-50 font-medium border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4 font-medium">Tanggal &amp; Shift</th>
                      <th className="py-2.5 px-3 font-medium">Unit</th>
                      <th className="py-2.5 px-3 text-center font-medium">Jam Jalan</th>
                      <th className="py-2.5 px-3 text-right font-medium">Daya Rerata</th>
                      <th className="py-2.5 px-3 text-right font-medium">Energi Output</th>
                      <th className="py-2.5 px-3 text-right font-medium">Debit Air</th>
                      <th className="py-2.5 px-3 text-center font-medium">Capacity Factor</th>
                      <th className="py-2.5 px-3 text-center font-medium">Status</th>
                      <th className="py-2.5 px-4 text-center font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTableRecords.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                          Tidak ada data rincian produksi energi yang sesuai dengan kriteria filter.
                        </td>
                      </tr>
                    ) : (
                      filteredTableRecords.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-4">
                            <span className="font-medium text-slate-900 block">{item.date}</span>
                            <span className="text-[10px] text-slate-500">{item.timeSlot}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium text-slate-700 bg-slate-100 border border-slate-200 whitespace-nowrap">
                              {item.unit_name}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-700 text-center">
                            {item.running_hours.toFixed(1)} h
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-900 text-right">
                            {item.avg_power_kw.toLocaleString('id-ID')} kW
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-[#0F4C81] text-right">
                            {item.energy_kwh.toLocaleString('id-ID')} kWh
                          </td>
                          <td className="py-2.5 px-3 text-slate-800 text-right">
                            {item.avg_flow_m3s.toFixed(2)} m³/s
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium text-slate-700 bg-slate-100 border border-slate-200 whitespace-nowrap">
                              {item.capacity_factor_pct.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="text-xs font-medium text-slate-700 whitespace-nowrap">
                              {item.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <Button
                              onClick={() => setSelectedRecordDetail(item)}
                              className="text-xs h-7 px-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg shadow-none inline-flex items-center"
                            >
                              <Eye size={12} className="mr-1 text-slate-500" />
                              Detail
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL: DETAIL LOGGING PRODUKSI ENERGI */}
      {selectedRecordDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-[#0F4C81]" />
                <h3 className="font-bold text-slate-900 text-base">
                  Rincian Produksi Energi &mdash; {selectedRecordDetail.unit_name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecordDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded border border-slate-200">
                <div>
                  <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">
                    Tanggal Logging
                  </span>
                  <span className="font-bold text-slate-800 text-sm">{selectedRecordDetail.date}</span>
                </div>
                <div>
                  <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">
                    Shift Operasional
                  </span>
                  <span className="font-semibold text-slate-700">{selectedRecordDetail.timeSlot}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[0.65rem] font-bold text-slate-500 uppercase block">Energi Tersalurkan</span>
                  <span className="text-base font-black text-[#0F4C81] font-mono">
                    {selectedRecordDetail.energy_kwh.toLocaleString('id-ID')} kWh
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[0.65rem] font-bold text-slate-500 uppercase block">Daya Rata-rata</span>
                  <span className="text-base font-black text-slate-900 font-mono">
                    {selectedRecordDetail.avg_power_kw} kW
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[0.65rem] font-bold text-slate-500 uppercase block">Running Hours</span>
                  <span className="text-base font-black text-slate-900 font-mono">
                    {selectedRecordDetail.running_hours.toFixed(1)} Jam
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[0.65rem] font-bold text-slate-500 uppercase block">Capacity Factor</span>
                  <span className="text-base font-black text-emerald-700 font-mono">
                    {selectedRecordDetail.capacity_factor_pct.toFixed(1)}%
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[0.65rem] font-bold text-slate-500 uppercase block">Debit Air Sungai</span>
                  <span className="text-base font-black text-cyan-700 font-mono">
                    {selectedRecordDetail.avg_flow_m3s.toFixed(2)} m³/s
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[0.65rem] font-bold text-slate-500 uppercase block">Water Utilization</span>
                  <span className="text-base font-black text-slate-800 font-mono">
                    {selectedRecordDetail.water_utilization_pct.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-blue-50/60 rounded border border-blue-200 text-blue-900">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">Estimasi Pendapatan Penjualan Daya:</span>
                  <span className="font-mono font-bold text-sm text-[#0F4C81]">
                    Rp {selectedRecordDetail.revenue_estimation_idr.toLocaleString('id-ID')}
                  </span>
                </div>
                <p className="text-[0.65rem] text-blue-700 mt-1">
                  * Dihitung berdasarkan tarif Feed-in Tariff (FiT) kontrak PPA PLTMH Sampean Baru dengan PT PLN (Persero).
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <Button
                onClick={() => setSelectedRecordDetail(null)}
                className="text-xs h-8 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-4 rounded"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProduksiEnergi;
