import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { TrendingUp, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { dashboardApi } from '../api/dashboard.api';
import { unitApi, UnitItem } from '../api/unit.api';

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0F172A] border border-slate-700 text-white p-3 rounded-md shadow-lg text-xs">
        <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-2">
          <span className="font-bold">{label}</span>
          <span className="bg-blue-600 text-[0.6rem] px-1.5 py-0.5 rounded ml-3">TELEMETRI</span>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-300">Nilai Parameter:</span>
            <span className="font-bold">{payload[0]?.value ?? '-'}</span>
          </div>
          {payload[1] && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-300">Debit Air:</span>
              <span className="font-bold text-emerald-400">{payload[1].value} m³/s</span>
            </div>
          )}
          {payload[0]?.payload?.freq && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-300">Frekuensi:</span>
              <span className="font-bold">{payload[0].payload.freq} Hz</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const TrendParameter: React.FC = () => {
  const [units, setUnits] = useState<UnitItem[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<number | undefined>(undefined);
  const [period, setPeriod] = useState<string>('today');
  const [parameterType, setParameterType] = useState<string>('power');
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const data = await unitApi.list();
        if (data && data.length > 0) {
          setUnits(data);
          setSelectedUnitId(data[0].id);
        }
      } catch (err) {
        console.error('Gagal mengambil daftar unit:', err);
      }
    };
    fetchUnits();
  }, []);

  const fetchChart = async () => {
    if (selectedUnitId === undefined) return;
    setLoading(true);
    try {
      const today = new Date();
      let fromDate = today.toISOString().split('T')[0];
      if (period === '7d') {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        fromDate = d.toISOString().split('T')[0];
      } else if (period === '30d') {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        fromDate = d.toISOString().split('T')[0];
      }

      const paramKey = parameterType === 'voltage' ? 'voltage_v' : 'active_power_kw';
      const data = await dashboardApi.getChart(selectedUnitId, paramKey, fromDate, today.toISOString().split('T')[0]);

      if (data && data.length > 0) {
        const mapped = data.map((item) => ({
          time: item.shift ? `Shift ${item.shift}` : item.date,
          power: item.value || 0,
          flow: 0,
          freq: 0
        }));
        setChartData(mapped);
      } else {
        setChartData([]);
      }
    } catch (err) {
      console.error('Gagal mengambil data tren:', err);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUnitId !== undefined) {
      fetchChart();
    }
  }, [selectedUnitId, period, parameterType]);

  // Statistik Dinamis
  const stats = useMemo(() => {
    const powers = chartData.map((d) => Number(d.power) || 0).filter((v) => v > 0);
    if (powers.length === 0) return { min: 0, avg: 0, max: 0 };
    const min = Math.min(...powers);
    const max = Math.max(...powers);
    const avg = Math.round(powers.reduce((a, b) => a + b, 0) / powers.length);
    return { min, avg, max };
  }, [chartData]);

  const activeUnit = units.find((u) => u.id === selectedUnitId);

  return (
    <div className="flex h-screen bg-[#F1F5F9] text-slate-800 font-sans">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header />

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-[1400px] mx-auto space-y-6">
            
            {/* Page Header */}
            <div className="bg-slate-50 border border-slate-200 shadow-sm rounded-md p-5 flex flex-wrap justify-between items-start gap-4">
              <div>
                <p className="text-[0.65rem] font-bold text-blue-600 tracking-widest uppercase flex items-center gap-1.5 mb-1">
                TELEMETRI OPERASIONAL {activeUnit?.name || 'PLTMH UNIT 1'}
                </p>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Trend Parameter Pembangkit</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">Analisis perubahan parameter operasional unit terhadap waktu berbasis data SCADA & Logbook.</p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <label className="block text-[0.65rem] font-bold text-slate-500 tracking-widest uppercase mb-1">UNIT</label>
                  <select
                    value={selectedUnitId ?? ''}
                    onChange={(e) => setSelectedUnitId(e.target.value ? Number(e.target.value) : undefined)}
                    className="h-8 text-sm border border-slate-200 rounded bg-white text-slate-700 px-3 outline-none focus:ring-1 focus:ring-blue-500 min-w-[140px]"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                    {units.length === 0 && <option value="">PLTMH Unit 1</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-[0.65rem] font-bold text-slate-500 tracking-widest uppercase mb-1">PERIODE</label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="h-8 text-sm border border-slate-200 rounded bg-white text-slate-700 px-3 outline-none focus:ring-1 focus:ring-blue-500 min-w-[140px]"
                  >
                    <option value="today">Hari Ini (24 Jam)</option>
                    <option value="7d">7 Hari Terakhir</option>
                    <option value="30d">30 Hari Terakhir</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[0.65rem] font-bold text-slate-500 tracking-widest uppercase mb-1">PARAMETER</label>
                  <select
                    value={parameterType}
                    onChange={(e) => setParameterType(e.target.value)}
                    className="h-8 text-sm border border-slate-200 rounded bg-white text-slate-700 px-3 outline-none focus:ring-1 focus:ring-blue-500 min-w-[150px]"
                  >
                    <option value="power">Power vs Time</option>
                    <option value="voltage">Voltage & Frequency</option>
                  </select>
                </div>

                <div className="self-end">
                  <Button
                    type="button"
                    onClick={fetchChart}
                    disabled={loading}
                    className="w-auto h-8 text-xs bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 px-3"
                  >
                    <RefreshCw size={14} className={`mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <Card className="bg-slate-50 border-slate-200 shadow-sm rounded-md">
              <CardHeader className="pb-2 flex flex-row flex-wrap items-start justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900">
                    {parameterType === 'voltage' ? 'Voltage (V) & Telemetri' : 'Power vs Time (kW)'}
                  </CardTitle>
                  <p className="text-xs font-mono text-slate-500 mt-1">
                    SCADA Telemetri Realtime • Sumbu Kiri ({parameterType === 'voltage' ? 'Volt' : 'kW'}) & Sumbu Kanan (Debit m³/s)
                  </p>
                </div>
                
                {/* Legends */}
                <div className="flex items-center gap-6 mt-2 sm:mt-0">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-1 bg-[#0284c7] rounded"></div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 leading-none">
                        {parameterType === 'voltage' ? 'Tegangan (V)' : 'Daya Aktif (kW)'}
                      </p>
                      <p className="text-[0.6rem] text-slate-500 mt-0.5">[Sumbu Kiri]</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-1 bg-[#10b981] rounded"></div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 leading-none">Debit Air (m³/s)</p>
                      <p className="text-[0.6rem] text-slate-500 mt-0.5">[Sumbu Kanan]</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="min-h-[350px] w-full mt-4 flex items-center justify-center">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="time" 
                          axisLine={{ stroke: '#cbd5e1' }} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600, fontFamily: 'monospace' }} 
                          dy={10} 
                        />
                        <YAxis 
                          yAxisId="left"
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }}
                          tickFormatter={(value) => `${value} ${parameterType === 'voltage' ? 'V' : 'kW'}`}
                          width={70}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="power" 
                          stroke="#0284c7" 
                          strokeWidth={3}
                          dot={{ r: 4, fill: '#0284c7', strokeWidth: 0 }}
                          activeDot={{ r: 6, fill: '#0ea5e9' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[350px] w-full flex flex-col items-center justify-center text-slate-400 bg-white rounded border border-slate-200">
                      <TrendingUp size={36} className="text-slate-300 mb-2" />
                      <p className="text-sm font-semibold text-slate-600">Belum ada rekaman data tren</p>
                      <p className="text-xs text-slate-400 mt-0.5">Database belum memiliki rekaman telemetri untuk parameter dan periode ini.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Statistics Section */}
            <div className="bg-slate-50 border border-slate-200 shadow-sm rounded-md p-6">
              <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-2">
                <p className="text-xs font-bold text-slate-600 tracking-widest uppercase">
                  STATISTIK PARAMETER TERPILIH: {parameterType === 'voltage' ? 'TEGANGAN (VOLTAGE)' : 'DAYA AKTIF (POWER)'}
                </p>
                <p className="text-xs text-slate-500 font-medium">Rentang Observasi: Data Aktif</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                <div className="px-4 first:pl-0 pt-4 md:pt-0">
                  <p className="text-[0.65rem] font-bold text-slate-500 tracking-widest uppercase mb-2">NILAI MINIMUM</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500 flex items-center gap-1">Nilai terendah terdeteksi</p>
                    <p className="text-4xl font-bold text-slate-900 tracking-tighter">
                      {stats.min} <span className="text-sm font-semibold text-slate-500 tracking-normal">{parameterType === 'voltage' ? 'V' : 'kW'}</span>
                    </p>
                  </div>
                </div>
                <div className="px-4 pt-4 md:pt-0">
                  <p className="text-[0.65rem] font-bold text-slate-500 tracking-widest uppercase mb-2">NILAI RATA-RATA</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">Operasi Normal Kontinu</p>
                    <p className="text-4xl font-bold text-slate-900 tracking-tighter">
                      {stats.avg} <span className="text-sm font-semibold text-slate-500 tracking-normal">{parameterType === 'voltage' ? 'V' : 'kW'}</span>
                    </p>
                  </div>
                </div>
                <div className="px-4 pt-4 md:pt-0">
                  <p className="text-[0.65rem] font-bold text-slate-500 tracking-widest uppercase mb-2">NILAI MAKSIMUM</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500 flex items-center gap-1">Puncak operasional</p>
                    <p className="text-4xl font-bold text-slate-900 tracking-tighter">
                      {stats.max} <span className="text-sm font-semibold text-slate-500 tracking-normal">{parameterType === 'voltage' ? 'V' : 'kW'}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Table */}
            <Card className="bg-slate-50 border-slate-200 shadow-sm rounded-md">
              <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-slate-200">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">Ringkasan Trend Parameter</CardTitle>
                  <p className="text-xs font-medium text-slate-500 mt-1">Data terukur nilai minimum, rata-rata, dan maksimum seluruh parameter operasional unit.</p>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-600 bg-slate-100 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">PARAMETER</th>
                      <th className="px-6 py-3 text-right">MIN</th>
                      <th className="px-6 py-3 text-right">RATA-RATA</th>
                      <th className="px-6 py-3 text-right">MAX</th>
                      <th className="px-6 py-3 text-center">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs font-mono">
                    {chartData.length > 0 ? (
                      <tr className="hover:bg-slate-100/50">
                        <td className="px-6 py-3 font-sans font-semibold text-slate-800">
                          {parameterType === 'voltage' ? 'Tegangan (V)' : 'Daya Aktif (kW)'}
                        </td>
                        <td className="px-6 py-3 text-right text-slate-600">{stats.min}</td>
                        <td className="px-6 py-3 text-right font-bold text-slate-900">{stats.avg}</td>
                        <td className="px-6 py-3 text-right text-slate-600">{stats.max}</td>
                        <td className="px-6 py-3 text-center">
                          <span className="bg-green-100 text-green-700 font-sans font-bold text-[0.65rem] px-2 py-0.5 rounded border border-green-200">NORMAL</span>
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-xs text-slate-400 font-sans">
                          Belum ada rekaman statistik parameter pada periode ini di database.
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

export default TrendParameter;
