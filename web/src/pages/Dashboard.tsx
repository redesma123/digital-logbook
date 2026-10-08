import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import {
  dashboardApi,
  analyticsApi,
  incidentApi,
  maintenanceApi,
  type DashboardSummary,
  type PerformanceAnalytics,
  type IncidentItem,
  type MaintenanceItem
} from '@/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [performance, setPerformance] = useState<PerformanceAnalytics | null>(null);
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [maintenances, setMaintenances] = useState<MaintenanceItem[]>([]);
  const [trendData, setTrendData] = useState<{ time: string; power: number }[]>([]);
  const [energyData] = useState<{ time: string; energy: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userRole = localStorage.getItem('user_role');
    if (userRole === 'OPERATOR') {
      navigate('/history-operasi', { replace: true });
      return;
    }

    const fetchData = async () => {
      try {
        const now = new Date();
        const toDate = now.toISOString().split('T')[0];
        const fromDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

        const [sumRes, perfRes, incRes, maintRes, chartRes] = await Promise.allSettled([
          dashboardApi.getSummary(1),
          analyticsApi.getPerformance(1, fromDate, toDate),
          incidentApi.list({ limit: 3 }),
          maintenanceApi.list({ limit: 3 }),
          dashboardApi.getChart(1, 'active_power_kw'),
        ]);

        if (sumRes.status === 'fulfilled') setSummary(sumRes.value);
        if (perfRes.status === 'fulfilled') setPerformance(perfRes.value);
        if (incRes.status === 'fulfilled') {
          const val = incRes.value as any;
          const incArr = Array.isArray(val) ? val : Array.isArray(val?.data) ? val.data : [];
          setIncidents(incArr);
        }
        if (maintRes.status === 'fulfilled') {
          const val = maintRes.value as any;
          const maintArr = Array.isArray(val) ? val : Array.isArray(val?.data) ? val.data : [];
          setMaintenances(maintArr);
        }
        if (chartRes.status === 'fulfilled' && Array.isArray(chartRes.value) && chartRes.value.length > 0) {
          setTrendData(chartRes.value.map((c) => ({
            time: c.shift ? `Shift ${c.shift}` : c.date,
            power: c.value
          })));
        } else {
          setTrendData([]);
        }
      } catch (err) {
        console.error('Failed to load supervisor dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const currentPowerKw = summary?.latest_entry?.electrical?.active_power_kw ?? 0;
  const currentFreqHz = summary?.latest_entry?.electrical?.frequency_hz ?? 0;
  const currentFlowM3s = summary?.latest_entry?.hydraulic?.water_flow_m3_s ?? 0;
  const availabilityPct = performance?.metrics?.availability_pct != null
    ? performance.metrics.availability_pct.toFixed(1) 
    : '0';
  const unitStatus = summary?.unit?.current_status ?? (isLoading ? 'MEMUAT' : 'STANDBY');
  const todayEnergy = summary?.today_energy_kwh 
    ? summary.today_energy_kwh.toLocaleString('id-ID') 
    : '0';

  return (
    <div className="flex h-screen bg-[#F1F5F9] text-slate-800 font-sans">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header />

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Top Section - Kondisi Unit */}
            <Card className="bg-white border-slate-200 shadow-sm rounded-sm">
              <CardHeader className="pb-3 px-6 pt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[0.65rem] font-bold text-slate-500 tracking-widest uppercase mb-1">MONITORING OPERASIONAL {isLoading && '(Memuat data...)'}</p>
                    <CardTitle className="text-lg text-slate-800 font-semibold">Kondisi Unit — PLTMH {summary?.unit.name || 'Unit 1'}</CardTitle>
                  </div>
                  <span className={`text-xs font-bold uppercase ${
                    unitStatus === 'RUNNING' 
                      ? 'text-green-600' 
                      : unitStatus === 'TRIP'
                      ? 'text-red-600'
                      : 'text-amber-600'
                  }`}>
                    {unitStatus}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#F8FAFC] p-4 rounded-sm border border-slate-100">
                    <p className="text-[0.65rem] font-bold text-slate-500 tracking-wider uppercase mb-1">DAYA (POWER)</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-slate-800">{currentPowerKw}</span>
                      <span className="text-xs font-semibold text-slate-500">kW</span>
                    </div>
                  </div>
                  <div className="bg-[#F8FAFC] p-4 rounded-sm border border-slate-100">
                    <p className="text-[0.65rem] font-bold text-slate-500 tracking-wider uppercase mb-1">FREKUENSI</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-slate-800">{currentFreqHz}</span>
                      <span className="text-xs font-semibold text-slate-500">Hz</span>
                    </div>
                  </div>
                  <div className="bg-[#F8FAFC] p-4 rounded-sm border border-slate-100">
                    <p className="text-[0.65rem] font-bold text-slate-500 tracking-wider uppercase mb-1">DEBIT AIR (FLOW)</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-slate-800">{currentFlowM3s}</span>
                      <span className="text-xs font-semibold text-slate-500">m³/s</span>
                    </div>
                  </div>
                  <div className="bg-[#F0F9FF] p-4 rounded-sm border border-blue-100">
                    <p className="text-[0.65rem] font-bold text-blue-600 tracking-wider uppercase mb-1">AVAILABILITY BULAN INI</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-blue-700">{availabilityPct}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trend Parameter */}
              <Card className="bg-white border-slate-200 shadow-sm rounded-sm">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base text-slate-800 font-semibold">Trend Parameter</CardTitle>
                      <CardDescription className="text-xs text-slate-500 mt-0.5">Profil operasional daya pembangkit</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] w-full mt-4 bg-slate-50/50 rounded-sm border border-slate-100 flex items-center justify-center">
                    {trendData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dx={-10} />
                          <RechartsTooltip />
                          <Line type="monotone" dataKey="power" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 3, fill: '#0ea5e9', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <span className="text-xs text-slate-400">Belum ada data rekaman parameter hari ini</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-4 text-xs">
                    <div className="text-slate-500">Daya Terkini: <span className="font-semibold text-slate-800">{currentPowerKw > 0 ? `${currentPowerKw} kW` : '-'}</span></div>
                    <div className="text-slate-500">Status Grid: <span className="font-semibold text-slate-800">{unitStatus}</span></div>
                  </div>
                </CardContent>
              </Card>

              {/* Produksi Energi */}
              <Card className="bg-white border-slate-200 shadow-sm rounded-sm">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base text-slate-800 font-semibold">Produksi Energi</CardTitle>
                      <CardDescription className="text-xs text-slate-500 mt-0.5">Total akumulasi daya tersalurkan hari ini</CardDescription>
                    </div>
                    <div className="text-right bg-slate-50 px-3 py-2 rounded-sm border border-slate-100">
                      <div className="text-[0.65rem] font-bold text-slate-400 tracking-wider uppercase mb-0.5">PRODUKSI HARI INI</div>
                      <div className="text-xl font-bold text-slate-800 leading-none">{todayEnergy} <span className="text-xs font-semibold text-slate-500">kWh</span></div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] w-full mt-2 flex items-center justify-center bg-slate-50/50 rounded-sm border border-slate-100">
                    {energyData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={energyData} margin={{ top: 10, right: 0, bottom: 5, left: -20 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                          <RechartsTooltip cursor={{fill: '#f1f5f9'}} />
                          <Bar dataKey="energy" radius={[2, 2, 0, 0]} barSize={16}>
                            {energyData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={index === energyData.length - 1 ? '#0284c7' : '#93c5fd'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <span className="text-xs text-slate-400">Belum ada grafik distribusi energi hari ini</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-4 text-xs border-t border-slate-100 pt-3">
                    <div className="text-slate-500">Total Akumulasi: <span className="font-semibold text-slate-800">{todayEnergy} kWh</span></div>
                    <div className="text-slate-500">Status Ekspor: <span className="font-semibold text-emerald-600">{unitStatus === 'RUNNING' ? 'Normal Grid Feed' : 'Siaga / Standby'}</span></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bottom Section - Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gangguan Terbaru */}
              <Card className="bg-white border-slate-200 shadow-sm rounded-sm">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-base text-slate-800 font-semibold">Gangguan Terbaru</CardTitle>
                      <CardDescription className="text-xs text-slate-500 mt-0.5">Catatan anomali dan alarm operasional</CardDescription>
                    </div>
                    <Link to="/gangguan" className="text-xs font-semibold text-blue-600 hover:text-blue-800">Lihat Log Gangguan</Link>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-sm text-left">
                    <thead className="text-[0.65rem] text-slate-500 bg-slate-50/80 font-bold uppercase tracking-wider border-y border-slate-200">
                      <tr>
                        <th className="px-6 py-3">WAKTU</th>
                        <th className="px-6 py-3">GANGGUAN</th>
                        <th className="px-6 py-3 text-right">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {Array.isArray(incidents) && incidents.length > 0 ? (
                        incidents.map((inc) => {
                          const rawDate = (inc as any).occurred_at || inc.reported_at || (inc as any).created_at;
                          const timeStr = rawDate && !isNaN(new Date(rawDate).getTime())
                            ? new Date(rawDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
                            : 'Hari ini';
                          return (
                            <tr key={inc.id} className="hover:bg-slate-50">
                              <td className="px-6 py-3 text-xs font-medium text-slate-700">
                                {timeStr}
                              </td>
                              <td className="px-6 py-3 text-xs text-slate-700 font-medium">{inc.equipment}: {inc.description}</td>
                              <td className="px-6 py-3 text-right">
                                <span className={`text-xs font-semibold ${
                                  inc.status === 'OPEN'
                                    ? 'text-rose-600'
                                    : inc.status === 'PROCESS'
                                    ? 'text-amber-600'
                                    : 'text-emerald-600'
                                }`}>
                                  {inc.status === 'OPEN' ? 'Baru (Open)' : inc.status === 'PROCESS' ? 'Dalam Proses' : 'Selesai (Closed)'}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-6 py-8 text-center text-xs text-slate-400">
                            Belum ada catatan gangguan operasional di database.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              {/* Maintenance Terbaru */}
              <Card className="bg-white border-slate-200 shadow-sm rounded-sm">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-base text-slate-800 font-semibold">Maintenance Terbaru</CardTitle>
                      <CardDescription className="text-xs text-slate-500 mt-0.5">Kegiatan pemeliharaan preventif & korektif</CardDescription>
                    </div>
                    <Link to="/maintenance" className="text-xs font-semibold text-blue-600 hover:text-blue-800">Jadwal Kalender</Link>
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="space-y-4">
                    {Array.isArray(maintenances) && maintenances.length > 0 ? (
                      maintenances.map((m) => {
                        const schedDate = m.scheduled_date && !isNaN(new Date(m.scheduled_date).getTime())
                          ? new Date(m.scheduled_date).toLocaleDateString('id-ID')
                          : 'Terjadwal';
                        return (
                          <div key={m.id} className="flex justify-between items-start pb-4 border-b border-slate-100">
                            <div>
                              <h4 className="text-sm font-semibold text-slate-800">{m.work_type}: {m.equipment}</h4>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Jadwal: <span className="font-semibold text-slate-700">{schedDate}</span> • Teknisi: {m.technician || 'Tim Mekanik'}
                              </p>
                            </div>
                            <span className={`text-xs font-semibold ${
                              m.status === 'PLAN'
                                ? 'text-blue-600'
                                : m.status === 'PROCESS'
                                ? 'text-amber-600'
                                : 'text-emerald-600'
                            }`}>
                              {m.status === 'PLAN' ? 'Rencana' : m.status === 'PROCESS' ? 'Berlangsung' : 'Selesai'}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-8 text-center text-xs text-slate-400">
                        Belum ada jadwal pemeliharaan tercatat di database.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Histori Operasi Terakhir */}
            <Card className="bg-white border-slate-200 shadow-sm rounded-sm">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base text-slate-800 font-semibold">Histori Operasi Terakhir</CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-0.5">Pencatatan shift berjalan dari database</CardDescription>
                  </div>
                  <Link to="/history" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center">Lihat semua histori →</Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm text-left">
                  <thead className="text-[0.65rem] text-slate-500 bg-slate-50/80 font-bold uppercase tracking-wider border-y border-slate-200">
                    <tr>
                      <th className="px-6 py-3">WAKTU</th>
                      <th className="px-6 py-3">STATUS</th>
                      <th className="px-6 py-3">POWER</th>
                      <th className="px-6 py-3">FREQUENCY</th>
                      <th className="px-6 py-3">FLOW</th>
                      <th className="px-6 py-3">KETERANGAN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summary?.latest_entry ? (
                      <tr className="hover:bg-slate-50">
                        <td className="px-6 py-3 text-xs font-medium text-slate-700">
                          {summary.latest_entry.date} (Shift {summary.latest_entry.shift})
                        </td>
                        <td className="px-6 py-3">
                          <span className={`text-xs font-semibold uppercase ${
                            summary.latest_entry.unit_status === 'RUNNING' ? 'text-green-600' : 'text-amber-600'
                          }`}>
                            {summary.latest_entry.unit_status}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-xs font-bold text-slate-700">{summary.latest_entry.electrical?.active_power_kw ?? 0} kW</td>
                        <td className="px-6 py-3 text-xs font-medium text-slate-600">{summary.latest_entry.electrical?.frequency_hz ?? 0} Hz</td>
                        <td className="px-6 py-3 text-xs font-medium text-slate-600">{summary.latest_entry.hydraulic?.water_flow_m3_s ?? 0} m³/s</td>
                        <td className="px-6 py-3 text-xs text-slate-600">{summary.latest_entry.notes || 'Operasional normal'}</td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-xs text-slate-400">
                          Belum ada rekaman entri logbook operasi pada hari ini di database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
