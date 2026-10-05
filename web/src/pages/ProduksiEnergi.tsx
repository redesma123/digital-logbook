import { useState, useMemo } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Zap,
  Gauge,
  CheckCircle2,
  Droplets,
  TrendingUp,
  Filter,
  FileSpreadsheet,
  RefreshCw,
  Layers,
  Activity,
  Eye,
  X
} from 'lucide-react';
import {
  Area,
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

  return (
    <div className="flex h-screen bg-[#F1F5F9] text-slate-800 font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-[1400px] mx-auto space-y-5">
            {/* Top Bar / Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Analisis & Pemantauan Produksi Energi
                  </h2>
                </div>
                <p className="text-sm font-medium text-slate-500 mt-1">
                  Statistik output energi listrik PLTMH, korelasi debit air, rasio Capacity Factor, dan pemenuhan target suplai PLN.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center flex-wrap gap-2.5">
                <Button
                  onClick={handleExportCSV}
                  className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs h-9 px-3.5 shadow-sm rounded flex items-center"
                >
                  <FileSpreadsheet size={15} className="mr-1.5 text-emerald-600" />
                  Ekspor Laporan (CSV)
                </Button>

                <Button
                  onClick={() => alert('Data telemetri produksi energi telah diperbarui secara realtime.')}
                  className="bg-[#0F4C81] hover:bg-[#0c3d66] text-white font-semibold text-xs h-9 px-3.5 shadow-sm rounded flex items-center"
                >
                  <RefreshCw size={14} className="mr-1.5" />
                  Perbarui Data
                </Button>
              </div>
            </div>

            {/* KPI STAT CARDS (Sesuai Rumus RULES.md 3.1 - 3.5 & DESIGN_SYSTEM.md) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Produksi Energi (RULES 3.3) */}
              <Card className="bg-white border-slate-200 shadow-sm rounded-md p-4 bg-gradient-to-br from-white to-blue-50/40">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest">
                      Total Produksi Energi
                    </p>
                    <p className="text-2xl font-black text-[#0F4C81] mt-1">
                      {metrics.totalEnergyFormatted}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-[0.7rem] font-medium text-emerald-700">
                      <TrendingUp size={13} className="text-emerald-600" />
                      <span>+{metrics.energyDeltaPct}% vs periode lalu</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#0F4C81]">
                    <Zap size={20} />
                  </div>
                </div>
              </Card>

              {/* Capacity Factor (RULES 3.2) */}
              <Card className="bg-white border-slate-200 shadow-sm rounded-md p-4 bg-gradient-to-br from-white to-emerald-50/40">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest">
                      Capacity Factor (CF)
                    </p>
                    <p className="text-2xl font-black text-emerald-700 mt-1">
                      {metrics.capacityFactor}%
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-[0.7rem] font-medium text-slate-500">
                      <span>Kapasitas: {metrics.installedCapacityKw} kW</span>
                      <span className="text-emerald-600 font-bold ml-1">({metrics.cfDelta > 0 ? `+${metrics.cfDelta}%` : `${metrics.cfDelta}%`})</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <Gauge size={20} />
                  </div>
                </div>
              </Card>

              {/* Availability Factor (RULES 3.1) */}
              <Card className="bg-white border-slate-200 shadow-sm rounded-md p-4 bg-gradient-to-br from-white to-slate-50/80">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest">
                      Availability Factor (AF)
                    </p>
                    <p className="text-2xl font-black text-slate-900 mt-1">
                      {metrics.availability}%
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-[0.7rem] font-medium text-slate-500">
                      <span>Operasi: {metrics.runningHours} / {metrics.periodHours} Jam</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                    <CheckCircle2 size={20} />
                  </div>
                </div>
              </Card>

              {/* Water Utilization (RULES 3.4) */}
              <Card className="bg-white border-slate-200 shadow-sm rounded-md p-4 bg-gradient-to-br from-white to-cyan-50/40">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest">
                      Water Utilization
                    </p>
                    <p className="text-2xl font-black text-cyan-700 mt-1">
                      {metrics.waterUtilization}%
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-[0.7rem] font-medium text-slate-500">
                      <span>Debit Rerata: {metrics.avgFlow} m³/s</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600">
                    <Droplets size={20} />
                  </div>
                </div>
              </Card>
            </div>

            {/* Filter Section (SRS F-40: Filter Unit & Rentang Waktu) */}
            <Card className="bg-slate-50 border-slate-200 shadow-sm rounded-sm">
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4 items-end justify-between">
                  <div className="flex flex-wrap gap-4 items-center">
                    {/* Unit Select */}
                    <div className="flex items-center gap-2">
                      <label className="text-[0.65rem] font-bold text-slate-500 tracking-widest uppercase">
                        UNIT PLTMH:
                      </label>
                      <select
                        value={selectedUnit}
                        onChange={(e) => setSelectedUnit(e.target.value)}
                        className="h-8 text-xs border border-slate-200 rounded bg-white text-slate-700 font-semibold px-2.5 outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="ALL">Semua Unit (Unit 1 & 2 - 1.000 kW)</option>
                        <option value="1">Unit 1 (500 kW)</option>
                        <option value="2">Unit 2 (500 kW)</option>
                      </select>
                    </div>

                    {/* Quick Period Buttons */}
                    <div className="flex items-center gap-2">
                      <label className="text-[0.65rem] font-bold text-slate-500 tracking-widest uppercase">
                        PERIODE:
                      </label>
                      <div className="bg-white border border-slate-200 rounded p-0.5 flex text-xs font-semibold">
                        <button
                          type="button"
                          onClick={() => setTimePeriod('today')}
                          className={`px-3 py-1 rounded transition-colors ${
                            timePeriod === 'today'
                              ? 'bg-[#0F4C81] text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Hari Ini (24 Jam)
                        </button>
                        <button
                          type="button"
                          onClick={() => setTimePeriod('7d')}
                          className={`px-3 py-1 rounded transition-colors ${
                            timePeriod === '7d'
                              ? 'bg-[#0F4C81] text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          7 Hari
                        </button>
                        <button
                          type="button"
                          onClick={() => setTimePeriod('30d')}
                          className={`px-3 py-1 rounded transition-colors ${
                            timePeriod === '30d'
                              ? 'bg-[#0F4C81] text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          30 Hari
                        </button>
                        <button
                          type="button"
                          onClick={() => setTimePeriod('year')}
                          className={`px-3 py-1 rounded transition-colors ${
                            timePeriod === 'year'
                              ? 'bg-[#0F4C81] text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Tahun 2026
                        </button>
                      </div>
                    </div>

                    {/* Date Range Inputs */}
                    <div className="flex items-center gap-2">
                      <label className="text-[0.65rem] font-bold text-slate-500 tracking-widest uppercase">
                        DARI:
                      </label>
                      <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="h-8 text-xs border border-slate-200 rounded bg-white text-slate-700 font-medium px-2 outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-[0.65rem] font-bold text-slate-500 tracking-widest uppercase">
                        SAMPAI:
                      </label>
                      <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="h-8 text-xs border border-slate-200 rounded bg-white text-slate-700 font-medium px-2 outline-none focus:ring-1 focus:ring-blue-500"
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
                      className="text-xs h-8 bg-white border border-slate-300 text-slate-600 hover:bg-slate-100 font-semibold px-3"
                    >
                      <Filter size={13} className="mr-1.5 text-slate-400" />
                      Reset Filter
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* VISUAL CHARTS SECTION (SRS F-39, F-41) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Grafik 1: Produksi Energi Aktual vs Target PLN */}
              <Card className="bg-white border-slate-200 shadow-sm rounded-md">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base text-slate-800 font-bold flex items-center gap-2">
                        <Zap size={16} className="text-[#0F4C81]" />
                        Produksi Energi vs Target Kontrak PLN
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500 mt-0.5">
                        Komparasi daya tersalurkan aktual (kWh / MWh) dengan komitmen pasokan grid
                      </CardDescription>
                    </div>
                    <span className="text-[0.65rem] font-bold bg-blue-50 text-[#0F4C81] px-2 py-0.5 rounded border border-blue-200">
                      {selectedUnit === 'ALL' ? 'Unit 1 & 2' : `Unit ${selectedUnit}`}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[270px] w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={currentChartData} margin={{ top: 10, right: 10, bottom: 5, left: -10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                          dataKey={timePeriod === 'today' ? 'time' : timePeriod === '7d' ? 'date' : 'label'}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: '#64748b' }}
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                        <RechartsTooltip
                          formatter={(value: any, name: any) => [
                            timePeriod === 'year' ? `${value} MWh` : `${value.toLocaleString('id-ID')} kWh`,
                            name === 'displayEnergy' ? 'Produksi Aktual' : 'Target PLN'
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
                          formatter={(val) => (val === 'displayEnergy' ? 'Produksi Aktual' : 'Target Kontrak')}
                        />
                        <Bar dataKey="displayEnergy" name="displayEnergy" fill="#0F4C81" radius={[4, 4, 0, 0]} barSize={22} />
                        <Line
                          type="monotone"
                          dataKey="displayTarget"
                          name="displayTarget"
                          stroke="#10B981"
                          strokeWidth={2.5}
                          strokeDasharray="4 4"
                          dot={{ r: 3, fill: '#10B981' }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                    <div>
                      Rata-rata: <span className="font-bold text-slate-800">96.8% dari target</span>
                    </div>
                    <div>
                      Toleransi Kontrak: <span className="font-semibold text-emerald-600">&plusmn;5% Normal</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Grafik 2: Korelasi Output Daya (kW) & Debit Air (m3/s) */}
              <Card className="bg-white border-slate-200 shadow-sm rounded-md">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base text-slate-800 font-bold flex items-center gap-2">
                        <Activity size={16} className="text-cyan-600" />
                        Korelasi Daya Listrik (kW) & Debit Air (m³/s)
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500 mt-0.5">
                        Efisiensi hidrolik turbin: hubungan antara laju aliran air dengan daya generator
                      </CardDescription>
                    </div>
                    <span className="text-[0.65rem] font-bold bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded border border-cyan-200">
                      Dual Axis Telemetri
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[270px] w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={currentChartData} margin={{ top: 10, right: 10, bottom: 5, left: -10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                          dataKey={timePeriod === 'today' ? 'time' : timePeriod === '7d' ? 'date' : 'label'}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: '#64748b' }}
                        />
                        {/* Left Axis for Power / Energy */}
                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                        {/* Right Axis for Flow */}
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: '#06b6d4' }}
                          domain={[1.5, 3.0]}
                        />
                        <RechartsTooltip
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
                          formatter={(val) => (val === 'displayEnergy' ? 'Daya/Energi Output' : 'Debit Air (m³/s)')}
                        />
                        <Area
                          yAxisId="left"
                          type="monotone"
                          dataKey="displayEnergy"
                          name="displayEnergy"
                          fill="#38bdf8"
                          fillOpacity={0.25}
                          stroke="#0284c7"
                          strokeWidth={2}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey={timePeriod === 'today' ? 'flow' : 'avgFlow'}
                          name={timePeriod === 'today' ? 'flow' : 'avgFlow'}
                          stroke="#06b6d4"
                          strokeWidth={2.5}
                          dot={{ r: 3, fill: '#06b6d4' }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                    <div>
                      Debit Desain Intake: <span className="font-bold text-slate-800">2.65 m³/s / unit</span>
                    </div>
                    <div>
                      Spesifik Output: <span className="font-semibold text-blue-700">~180 W per L/detik</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Breakdown Unit 1 vs Unit 2 Summary Card */}
            <Card className="bg-white border-slate-200 shadow-sm rounded-md p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Layers size={16} className="text-[#0F4C81]" />
                    Distribusi Kontribusi Pembangkit (Unit 1 & Unit 2)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Perbandingan beban kontribusi energi dan jam operasi antara kedua turbin PLTMH
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
                    Total Daya Terpasang: <strong className="text-slate-900">1.000 kW (2 × 500 kW)</strong>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {/* Unit 1 Progress Card */}
                <div className="p-4 bg-slate-50 rounded-md border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                      <span className="font-bold text-sm text-slate-900">PLTMH Unit 1</span>
                      <span className="text-[0.65rem] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                        RUNNING
                      </span>
                    </div>
                    <span className="font-mono font-bold text-xs text-slate-800">
                      {selectedUnit === '2' ? '0%' : '50.8% Total'}
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: selectedUnit === '2' ? '0%' : '50.8%' }}></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-slate-600 pt-1 border-t border-slate-200">
                    <div>
                      <span className="text-[0.65rem] text-slate-400 block font-semibold uppercase">Output Daya</span>
                      <span className="font-bold text-slate-900">475 kW</span>
                    </div>
                    <div>
                      <span className="text-[0.65rem] text-slate-400 block font-semibold uppercase">Capacity Factor</span>
                      <span className="font-bold text-emerald-700">82.4%</span>
                    </div>
                    <div>
                      <span className="text-[0.65rem] text-slate-400 block font-semibold uppercase">Running Hours</span>
                      <span className="font-bold text-slate-900">165.2 Jam</span>
                    </div>
                  </div>
                </div>

                {/* Unit 2 Progress Card */}
                <div className="p-4 bg-slate-50 rounded-md border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-cyan-600"></div>
                      <span className="font-bold text-sm text-slate-900">PLTMH Unit 2</span>
                      <span className="text-[0.65rem] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                        RUNNING
                      </span>
                    </div>
                    <span className="font-mono font-bold text-xs text-slate-800">
                      {selectedUnit === '1' ? '0%' : '49.2% Total'}
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-cyan-600 rounded-full" style={{ width: selectedUnit === '1' ? '0%' : '49.2%' }}></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-slate-600 pt-1 border-t border-slate-200">
                    <div>
                      <span className="text-[0.65rem] text-slate-400 block font-semibold uppercase">Output Daya</span>
                      <span className="font-bold text-slate-900">460 kW</span>
                    </div>
                    <div>
                      <span className="text-[0.65rem] text-slate-400 block font-semibold uppercase">Capacity Factor</span>
                      <span className="font-bold text-emerald-700">80.1%</span>
                    </div>
                    <div>
                      <span className="text-[0.65rem] text-slate-400 block font-semibold uppercase">Running Hours</span>
                      <span className="font-bold text-slate-900">163.8 Jam</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* TABEL RINCIAN LOGGING PRODUKSI ENERGI (F-38, F-41) */}
            <Card className="bg-white border-slate-200 shadow-sm rounded-md overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Tabel Rekapitulasi Rincian Produksi Energi
                  </h3>
                  <p className="text-xs text-slate-500">
                    Logging berkala per shift operasional sesuai data transmisi meteran kWh
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Cari tanggal, shift, unit..."
                    value={searchTableQuery}
                    onChange={(e) => setSearchTableQuery(e.target.value)}
                    className="h-8 pl-3 pr-3 text-xs border border-slate-300 rounded bg-white text-slate-700 font-medium placeholder-slate-400 w-52 outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[0.65rem] text-slate-600 bg-slate-100 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Tanggal & Shift</th>
                      <th className="py-3 px-4">Unit PLTMH</th>
                      <th className="py-3 px-4 text-center">Running Hours</th>
                      <th className="py-3 px-4 text-right">Daya Rerata (kW)</th>
                      <th className="py-3 px-4 text-right">Energi (kWh)</th>
                      <th className="py-3 px-4 text-right">Debit (m³/s)</th>
                      <th className="py-3 px-4 text-center">Capacity Factor</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTableRecords.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-10 text-center text-slate-400 text-sm">
                          Tidak ada data rincian produksi energi yang sesuai dengan kriteria filter.
                        </td>
                      </tr>
                    ) : (
                      filteredTableRecords.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-xs text-slate-900">{item.date}</div>
                            <div className="text-[0.65rem] text-slate-500">{item.timeSlot}</div>
                          </td>
                          <td className="py-3 px-4 text-xs font-semibold text-slate-800">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              {item.unit_name}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-700 text-center font-mono">
                            {item.running_hours.toFixed(1)} Jam
                          </td>
                          <td className="py-3 px-4 text-xs font-bold text-slate-900 text-right font-mono">
                            {item.avg_power_kw.toLocaleString('id-ID')} kW
                          </td>
                          <td className="py-3 px-4 text-xs font-bold text-[#0F4C81] text-right font-mono">
                            {item.energy_kwh.toLocaleString('id-ID')} kWh
                          </td>
                          <td className="py-3 px-4 text-xs text-cyan-700 text-right font-mono font-medium">
                            {item.avg_flow_m3s.toFixed(2)} m³/s
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded text-[0.65rem] font-bold ${
                                item.capacity_factor_pct >= 85
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : item.capacity_factor_pct >= 70
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {item.capacity_factor_pct.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {item.status === 'OPTIMAL' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                OPTIMAL
                              </span>
                            ) : item.status === 'NORMAL' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                NORMAL
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                MT / DOWNTIME
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Button
                              onClick={() => setSelectedRecordDetail(item)}
                              className="text-xs h-7 px-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded shadow-none inline-flex items-center"
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
            </Card>
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
