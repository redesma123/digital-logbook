import { useState, useMemo } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { Button } from '../components/ui/button';
import {
  Zap,
  Filter,
  FileSpreadsheet,
  RefreshCw,
  Layers,
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

const hourlyTodayData = [
  { time: '00:00', unit1: 420, unit2: 410, totalEnergy: 830, target: 800, flow: 2.25, power: 830 },
  { time: '02:00', unit1: 415, unit2: 410, totalEnergy: 825, target: 800, flow: 2.22, power: 825 },
  { time: '04:00', unit1: 425, unit2: 420, totalEnergy: 845, target: 800, flow: 2.28, power: 845 },
  { time: '06:00', unit1: 440, unit2: 435, totalEnergy: 875, target: 820, flow: 2.38, power: 875 },
  { time: '08:00', unit1: 460, unit2: 450, totalEnergy: 910, target: 850, flow: 2.46, power: 910 },
  { time: '10:00', unit1: 475, unit2: 470, totalEnergy: 945, target: 880, flow: 2.55, power: 945 },
  { time: '12:00', unit1: 485, unit2: 480, totalEnergy: 965, target: 880, flow: 2.60, power: 965 },
  { time: '14:00', unit1: 470, unit2: 465, totalEnergy: 935, target: 860, flow: 2.52, power: 935 },
  { time: '16:00', unit1: 455, unit2: 450, totalEnergy: 905, target: 850, flow: 2.45, power: 905 },
  { time: '18:00', unit1: 465, unit2: 460, totalEnergy: 925, target: 860, flow: 2.48, power: 925 },
  { time: '20:00', unit1: 450, unit2: 445, totalEnergy: 895, target: 840, flow: 2.41, power: 895 },
  { time: '22:00', unit1: 435, unit2: 430, totalEnergy: 865, target: 820, flow: 2.32, power: 865 },
];

const weekly7DaysData = [
  { date: '29 Sep', unit1: 9800, unit2: 9600, totalEnergy: 19400, target: 19000, avgFlow: 2.35, cf: 80.8 },
  { date: '30 Sep', unit1: 10100, unit2: 9900, totalEnergy: 20000, target: 19000, avgFlow: 2.42, cf: 83.3 },
  { date: '01 Okt', unit1: 10400, unit2: 10200, totalEnergy: 20600, target: 19500, avgFlow: 2.51, cf: 85.8 },
  { date: '02 Okt', unit1: 8900, unit2: 9500, totalEnergy: 18400, target: 19500, avgFlow: 2.20, cf: 76.7 },
  { date: '03 Okt', unit1: 10500, unit2: 10300, totalEnergy: 20800, target: 19500, avgFlow: 2.54, cf: 86.7 },
  { date: '04 Okt', unit1: 10700, unit2: 10500, totalEnergy: 21200, target: 19500, avgFlow: 2.58, cf: 88.3 },
  { date: '05 Okt', unit1: 9600, unit2: 9400, totalEnergy: 19000, target: 19000, avgFlow: 2.45, cf: 79.2 },
];

const monthly30DaysData = [
  { label: 'Minggu 1', unit1: 68500, unit2: 67200, totalEnergy: 135700, target: 130000, avgFlow: 2.38, cf: 80.8 },
  { label: 'Minggu 2', unit1: 71200, unit2: 69800, totalEnergy: 141000, target: 130000, avgFlow: 2.46, cf: 83.9 },
  { label: 'Minggu 3', unit1: 69400, unit2: 68100, totalEnergy: 137500, target: 130000, avgFlow: 2.41, cf: 81.8 },
  { label: 'Minggu 4', unit1: 72800, unit2: 71500, totalEnergy: 144300, target: 130000, avgFlow: 2.52, cf: 85.9 },
];

const yearlyMonthsData = [
  { label: 'Jan', unit1: 295, unit2: 288, totalEnergy: 583, target: 560, avgFlow: 2.45, cf: 78.4 },
  { label: 'Feb', unit1: 275, unit2: 270, totalEnergy: 545, target: 510, avgFlow: 2.42, cf: 81.1 },
  { label: 'Mar', unit1: 310, unit2: 305, totalEnergy: 615, target: 580, avgFlow: 2.56, cf: 82.7 },
  { label: 'Apr', unit1: 285, unit2: 280, totalEnergy: 565, target: 550, avgFlow: 2.39, cf: 78.5 },
  { label: 'Mei', unit1: 260, unit2: 255, totalEnergy: 515, target: 520, avgFlow: 2.28, cf: 69.2 },
  { label: 'Jun', unit1: 245, unit2: 240, totalEnergy: 485, target: 500, avgFlow: 2.15, cf: 67.4 },
  { label: 'Jul', unit1: 230, unit2: 235, totalEnergy: 465, target: 480, avgFlow: 2.05, cf: 62.5 },
  { label: 'Ags', unit1: 220, unit2: 225, totalEnergy: 445, target: 470, avgFlow: 1.98, cf: 59.8 },
  { label: 'Sep', unit1: 270, unit2: 268, totalEnergy: 538, target: 530, avgFlow: 2.30, cf: 74.7 },
  { label: 'Okt', unit1: 142, unit2: 139, totalEnergy: 281, target: 270, avgFlow: 2.48, cf: 81.5 },
];

const initialTableRecords: ProductionRecord[] = [
  {
    id: 1,
    date: '2026-10-05',
    timeSlot: 'Shift 2 (14:00 - 22:00)',
    unit_id: 1,
    unit_name: 'Unit 1 (PLTMH)',
    running_hours: 8.0,
    avg_power_kw: 465,
    energy_kwh: 3720,
    avg_flow_m3s: 2.51,
    water_utilization_pct: 94.7,
    capacity_factor_pct: 93.0,
    availability_pct: 100.0,
    revenue_estimation_idr: 3906000,
    status: 'OPTIMAL'
  },
  {
    id: 2,
    date: '2026-10-05',
    timeSlot: 'Shift 2 (14:00 - 22:00)',
    unit_id: 2,
    unit_name: 'Unit 2 (PLTMH)',
    running_hours: 8.0,
    avg_power_kw: 458,
    energy_kwh: 3664,
    avg_flow_m3s: 2.48,
    water_utilization_pct: 93.6,
    capacity_factor_pct: 91.6,
    availability_pct: 100.0,
    revenue_estimation_idr: 3847200,
    status: 'OPTIMAL'
  },
  {
    id: 3,
    date: '2026-10-05',
    timeSlot: 'Shift 1 (06:00 - 14:00)',
    unit_id: 1,
    unit_name: 'Unit 1 (PLTMH)',
    running_hours: 8.0,
    avg_power_kw: 470,
    energy_kwh: 3760,
    avg_flow_m3s: 2.54,
    water_utilization_pct: 95.8,
    capacity_factor_pct: 94.0,
    availability_pct: 100.0,
    revenue_estimation_idr: 3948000,
    status: 'OPTIMAL'
  },
  {
    id: 4,
    date: '2026-10-05',
    timeSlot: 'Shift 1 (06:00 - 14:00)',
    unit_id: 2,
    unit_name: 'Unit 2 (PLTMH)',
    running_hours: 8.0,
    avg_power_kw: 462,
    energy_kwh: 3696,
    avg_flow_m3s: 2.50,
    water_utilization_pct: 94.3,
    capacity_factor_pct: 92.4,
    availability_pct: 100.0,
    revenue_estimation_idr: 3880800,
    status: 'OPTIMAL'
  },
  {
    id: 5,
    date: '2026-10-04',
    timeSlot: 'Shift 3 (22:00 - 06:00)',
    unit_id: 1,
    unit_name: 'Unit 1 (PLTMH)',
    running_hours: 8.0,
    avg_power_kw: 430,
    energy_kwh: 3440,
    avg_flow_m3s: 2.34,
    water_utilization_pct: 88.3,
    capacity_factor_pct: 86.0,
    availability_pct: 100.0,
    revenue_estimation_idr: 3612000,
    status: 'NORMAL'
  },
  {
    id: 6,
    date: '2026-10-04',
    timeSlot: 'Shift 3 (22:00 - 06:00)',
    unit_id: 2,
    unit_name: 'Unit 2 (PLTMH)',
    running_hours: 8.0,
    avg_power_kw: 425,
    energy_kwh: 3400,
    avg_flow_m3s: 2.30,
    water_utilization_pct: 86.8,
    capacity_factor_pct: 85.0,
    availability_pct: 100.0,
    revenue_estimation_idr: 3570000,
    status: 'NORMAL'
  },
  {
    id: 7,
    date: '2026-10-02',
    timeSlot: 'Shift 2 (14:00 - 22:00)',
    unit_id: 1,
    unit_name: 'Unit 1 (PLTMH)',
    running_hours: 5.5,
    avg_power_kw: 320,
    energy_kwh: 1760,
    avg_flow_m3s: 1.85,
    water_utilization_pct: 69.8,
    capacity_factor_pct: 44.0,
    availability_pct: 68.7,
    revenue_estimation_idr: 1848000,
    status: 'MAINTENANCE'
  },
  {
    id: 8,
    date: '2026-10-02',
    timeSlot: 'Shift 2 (14:00 - 22:00)',
    unit_id: 2,
    unit_name: 'Unit 2 (PLTMH)',
    running_hours: 8.0,
    avg_power_kw: 445,
    energy_kwh: 3560,
    avg_flow_m3s: 2.40,
    water_utilization_pct: 90.6,
    capacity_factor_pct: 89.0,
    availability_pct: 100.0,
    revenue_estimation_idr: 3738000,
    status: 'OPTIMAL'
  }
];

const ProduksiEnergi = () => {
  const [selectedUnit, setSelectedUnit] = useState<string>('ALL');
  const [timePeriod, setTimePeriod] = useState<'today' | '7d' | '30d' | 'year'>('7d');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [searchTableQuery, setSearchTableQuery] = useState<string>('');
  const [selectedRecordDetail, setSelectedRecordDetail] = useState<ProductionRecord | null>(null);

  // Filter Table Data
  const filteredTableRecords = useMemo(() => {
    return initialTableRecords.filter((rec) => {
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
  }, [selectedUnit, fromDate, toDate, searchTableQuery]);

  // Dynamic Chart Data based on timePeriod and selectedUnit
  const currentChartData = useMemo(() => {
    let sourceData = [];
    if (timePeriod === 'today') sourceData = hourlyTodayData;
    else if (timePeriod === '7d') sourceData = weekly7DaysData;
    else if (timePeriod === '30d') sourceData = monthly30DaysData;
    else sourceData = yearlyMonthsData;

    return sourceData.map((d: any) => {
      let energyValue = d.totalEnergy;
      if (selectedUnit === '1') energyValue = d.unit1;
      else if (selectedUnit === '2') energyValue = d.unit2;

      let targetValue = d.target;
      if (selectedUnit === '1' || selectedUnit === '2') targetValue = d.target / 2;

      return {
        ...d,
        displayEnergy: energyValue,
        displayTarget: targetValue,
      };
    });
  }, [timePeriod, selectedUnit]);

  // Analytics Metrics strictly calculated from RULES.md formulas
  // 3.1 Availability = (Running Hours / Periode Jam) * 100
  // 3.2 Capacity Factor = (Energi Aktual kWh / (Kapasitas Terpasang kW * Jam)) * 100
  // 3.3 Energy Production = Sum(energy_kwh)
  // 3.4 Water Utilization = (Debit Rata-rata / Debit Desain) * 100 (Debit Desain = 2.65 m3/s per unit)
  const metrics = useMemo(() => {
    const isSingleUnit = selectedUnit !== 'ALL';
    const installedCapacityKw = isSingleUnit ? 500 : 1000;
    const designFlowM3s = isSingleUnit ? 2.65 : 5.30;

    let totalEnergyKwh = 0;
    let periodHours = 168; // default 7 days = 168 hours
    let avgFlow = 2.45;
    let runningHours = 164.5;
    let prevEnergyKwh = 132000;
    let prevCf = 78.5;
    let prevAvailability = 97.2;

    if (timePeriod === 'today') {
      periodHours = 24;
      totalEnergyKwh = isSingleUnit ? 5450 : 10850;
      prevEnergyKwh = isSingleUnit ? 5200 : 10400;
      avgFlow = 2.48;
      runningHours = 24;
      prevCf = 86.6;
      prevAvailability = 100;
    } else if (timePeriod === '7d') {
      periodHours = 168;
      totalEnergyKwh = isSingleUnit ? 69800 : 139400;
      prevEnergyKwh = isSingleUnit ? 66500 : 133000;
      avgFlow = 2.45;
      runningHours = 164.5;
      prevCf = 79.2;
      prevAvailability = 96.5;
    } else if (timePeriod === '30d') {
      periodHours = 720;
      totalEnergyKwh = isSingleUnit ? 279500 : 558500;
      prevEnergyKwh = isSingleUnit ? 268000 : 536000;
      avgFlow = 2.44;
      runningHours = 708;
      prevCf = 74.4;
      prevAvailability = 97.0;
    } else {
      // 10 Months YTD in MWh converted to kWh
      periodHours = 7300;
      totalEnergyKwh = isSingleUnit ? 2450000 : 4900000;
      prevEnergyKwh = isSingleUnit ? 2320000 : 4640000;
      avgFlow = 2.32;
      runningHours = 7120;
      prevCf = 64.2;
      prevAvailability = 96.0;
    }

    // Capacity Factor (%) = (Energi Aktual / (Kapasitas Terpasang * Jam)) * 100
    const capacityFactor = Math.min(100, (totalEnergyKwh / (installedCapacityKw * periodHours)) * 100);
    // Availability (%) = (Running Hours / Jam Periode) * 100
    const availability = Math.min(100, (runningHours / periodHours) * 100);
    // Water Utilization (%) = (Debit Aktual / Debit Desain) * 100
    const waterUtilization = Math.min(100, (avgFlow / designFlowM3s) * 100);
    // Hydraulic Efficiency (kWh produced per m3 water)
    const totalWaterVolumeM3 = avgFlow * periodHours * 3600;
    const waterEfficiency = totalWaterVolumeM3 > 0 ? (totalEnergyKwh / (totalWaterVolumeM3 / 1000)).toFixed(2) : '0.18';

    // Deltas vs previous period (RULES.md 3.5)
    const energyDeltaPct = Number((((totalEnergyKwh - prevEnergyKwh) / prevEnergyKwh) * 100).toFixed(1));
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
                  Kapasitas terpasang {metrics.installedCapacityKw} kW &middot; +{metrics.energyDeltaPct}% vs prev
                </div>
              </div>

              <div className={`${card} p-4`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-500">Capacity Factor (CF)</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium text-slate-700 bg-slate-100 border border-slate-200">
                    Target &gt;70%
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-[28px] leading-8 font-semibold text-slate-900 tabular-nums">
                    {metrics.capacityFactor}%
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Tren {metrics.cfDelta > 0 ? `+${metrics.cfDelta}%` : `${metrics.cfDelta}%`} vs periode lalu
                </div>
              </div>

              <div className={`${card} p-4`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-500">Availability Factor (AF)</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium text-slate-700 bg-slate-100 border border-slate-200">
                    Target &gt;95%
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-[28px] leading-8 font-semibold text-slate-900 tabular-nums">
                    {metrics.availability}%
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Operasi {metrics.runningHours} dari {metrics.periodHours} jam
                </div>
              </div>

              <div className={`${card} p-4`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-500">Water Utilization Rate</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium text-slate-700 bg-slate-100 border border-slate-200">
                    {metrics.avgFlow} m³/s
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-[28px] leading-8 font-semibold text-slate-900 tabular-nums">
                    {metrics.waterUtilization}%
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Efisiensi hidrolik: {metrics.waterEfficiency} kWh/m³
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
                    <option value="1">Unit 1 (500 kW)</option>
                    <option value="2">Unit 2 (500 kW)</option>
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
                      <Zap size={14} className="text-[#0F4C81]" />
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
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
                  <div>Rata-rata: <strong className="text-slate-800">96.8% Target</strong></div>
                  <div>Toleransi Deviasi: <strong className="text-emerald-700">&plusmn;5% Normal</strong></div>
                </div>
              </div>

              {/* Grafik 2: Korelasi Daya & Debit Air */}
              <div className={`${card} p-5`}>
                <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                      <Activity size={14} className="text-cyan-700" />
                      Korelasi Output Daya (kW) &amp; Debit Aliran Air (m³/s)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Efisiensi hidrolik turbin: hubungan laju aliran debit dengan daya generator
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium text-slate-700 bg-slate-100 border border-slate-200">
                    Dual Axis
                  </span>
                </div>

                <div className="h-[240px] w-full mt-3">
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
                        domain={[1.5, 3.0]}
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
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
                  <div>Q Desain Intake: <strong className="text-slate-800">2.65 m³/s / unit</strong></div>
                  <div>Spesifik: <strong className="text-blue-700">~180 W / L/s</strong></div>
                </div>
              </div>
            </div>

            {/* Technical Comparison Table: Unit 1 vs Unit 2 Operational Distribution */}
            <div className={`${card} overflow-hidden`}>
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers size={14} className="text-[#0F4C81]" />
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
                    <tr className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-4 font-medium text-slate-900">
                        PLTMH Unit 1
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium text-slate-700 bg-slate-100 border border-slate-200 whitespace-nowrap">
                          RUNNING
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-600">500 kW</td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-900">475 kW</td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-900">50.8%</td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-900">82.4%</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">165.2 Jam</td>
                      <td className="py-2.5 px-3 text-right text-slate-900">2.51 m³/s</td>
                      <td className="py-2.5 px-4 text-right text-slate-900">76°C (Waspada)</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-4 font-medium text-slate-900">
                        PLTMH Unit 2
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium text-slate-700 bg-slate-100 border border-slate-200 whitespace-nowrap">
                          RUNNING
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-600">500 kW</td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-900">460 kW</td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-900">49.2%</td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-900">80.1%</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">163.8 Jam</td>
                      <td className="py-2.5 px-3 text-right text-slate-900">2.48 m³/s</td>
                      <td className="py-2.5 px-4 text-right text-slate-900">68°C (Normal)</td>
                    </tr>
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
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium text-slate-700 bg-slate-100 border border-slate-200 whitespace-nowrap">
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
