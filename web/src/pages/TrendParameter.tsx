import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { Download, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const trendData = [
  { time: '00:00', power: 420, flow: 2.22, freq: 50.01 },
  { time: '02:00', power: 410, flow: 2.18, freq: 49.98 },
  { time: '04:00', power: 415, flow: 2.21, freq: 50.00 },
  { time: '06:00', power: 430, flow: 2.33, freq: 49.95 },
  { time: '08:00', power: 445, flow: 2.42, freq: 50.02 },
  { time: '10:00', power: 452, flow: 2.48, freq: 50.04 },
  { time: '12:00', power: 455, flow: 2.51, freq: 50.04 },
  { time: '14:00 (Live)', power: 450, flow: 2.50, freq: 50.02 },
];

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0F172A] border border-slate-700 text-white p-3 rounded-md shadow-lg text-xs">
        <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-2">
          <span className="font-bold">{label}</span>
          <span className="bg-blue-600 text-[0.6rem] px-1.5 py-0.5 rounded ml-3">BEBAN PUNCAK</span>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-300">Daya Aktif:</span>
            <span className="font-bold">{payload[0].value} kW</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-300">Debit Air:</span>
            <span className="font-bold text-emerald-400">{payload[1].value} m³/s</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-300">Frekuensi:</span>
            <span className="font-bold">{payload[0].payload.freq} Hz</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const TrendParameter = () => {
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
                  <TrendingUp size={12} /> TELEMETRI OPERASIONAL PLTMH UNIT 1
                </p>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Trend Parameter Pembangkit</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">Analisis perubahan parameter operasional PLTMH Unit 1 terhadap waktu.</p>
              </div>

              <div className="flex gap-4">
                <div>
                  <label className="block text-[0.65rem] font-bold text-slate-500 tracking-widest uppercase mb-1">PERIODE</label>
                  <select className="h-8 text-sm border border-slate-200 rounded bg-slate-100 text-slate-700 px-3 outline-none focus:ring-1 focus:ring-blue-500 min-w-[150px]">
                    <option>Hari Ini (24 Jam)</option>
                    <option>7 Hari Terakhir</option>
                    <option>30 Hari Terakhir</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[0.65rem] font-bold text-slate-500 tracking-widest uppercase mb-1">PARAMETER</label>
                  <select className="h-8 text-sm border border-slate-200 rounded bg-slate-100 text-slate-700 px-3 outline-none focus:ring-1 focus:ring-blue-500 min-w-[150px]">
                    <option>Power vs Time</option>
                    <option>Voltage & Frequency</option>
                    <option>Temperature</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <Card className="bg-slate-50 border-slate-200 shadow-sm rounded-md">
              <CardHeader className="pb-2 flex flex-row flex-wrap items-start justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900">Power vs Time (kW)</CardTitle>
                  <p className="text-xs font-mono text-slate-500 mt-1">SCADA Telemetri Realtime • Dual Axis Sumbu Kiri (kW) & Sumbu Kanan (m³/s)</p>
                </div>
                
                {/* Legends */}
                <div className="flex items-center gap-6 mt-2 sm:mt-0">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-1 bg-[#0284c7] rounded"></div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 leading-none">Daya Aktif (kW)</p>
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
                <div className="h-[350px] w-full mt-4 bg-slate-50">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#e2e8f0" />
                      
                      {/* X Axis */}
                      <XAxis 
                        dataKey="time" 
                        axisLine={{ stroke: '#cbd5e1' }} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600, fontFamily: 'monospace' }} 
                        dy={10} 
                      />
                      
                      {/* Left Y Axis (Power) */}
                      <YAxis 
                        yAxisId="left"
                        domain={[380, 480]}
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }}
                        tickFormatter={(value) => `${value} kW`}
                        width={60}
                      />
                      
                      {/* Right Y Axis (Flow) */}
                      <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        domain={[2.0, 2.8]}
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#10b981', fontFamily: 'monospace' }}
                        tickFormatter={(value) => `${value.toFixed(1)} m³/s`}
                        width={60}
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
                      
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="flow" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: '#34d399' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Statistics Section */}
            <div className="bg-slate-50 border border-slate-200 shadow-sm rounded-md p-6">
              <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-2">
                <p className="text-xs font-bold text-slate-600 tracking-widest uppercase">STATISTIK PARAMETER TERPILIH: DAYA AKTIF (POWER)</p>
                <p className="text-xs text-slate-500 font-medium">Rentang Observasi: 24 Jam Terakhir</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                <div className="px-4 first:pl-0 pt-4 md:pt-0">
                  <p className="text-[0.65rem] font-bold text-slate-500 tracking-widest uppercase mb-2">NILAI MINIMUM</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500 flex items-center gap-1"><span className="text-slate-400">🕒</span> pada 02:15 WIB</p>
                    <p className="text-4xl font-bold text-slate-900 tracking-tighter">410 <span className="text-sm font-semibold text-slate-500 tracking-normal">kW</span></p>
                  </div>
                </div>
                <div className="px-4 pt-4 md:pt-0">
                  <p className="text-[0.65rem] font-bold text-slate-500 tracking-widest uppercase mb-2">NILAI RATA-RATA</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">Operasi Normal Kontinu</p>
                    <p className="text-4xl font-bold text-slate-900 tracking-tighter">442 <span className="text-sm font-semibold text-slate-500 tracking-normal">kW</span></p>
                  </div>
                </div>
                <div className="px-4 pt-4 md:pt-0">
                  <p className="text-[0.65rem] font-bold text-slate-500 tracking-widest uppercase mb-2">NILAI MAKSIMUM</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500 flex items-center gap-1"><span className="text-slate-400">🕒</span> pada 12:00 WIB</p>
                    <p className="text-4xl font-bold text-slate-900 tracking-tighter">455 <span className="text-sm font-semibold text-slate-500 tracking-normal">kW</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Table */}
            <Card className="bg-slate-50 border-slate-200 shadow-sm rounded-md">
              <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-slate-200">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">Ringkasan Trend Parameter</CardTitle>
                  <p className="text-xs font-medium text-slate-500 mt-1">Data terukur nilai minimum, rata-rata, dan maksimum seluruh parameter operasional PLTMH Unit 1.</p>
                </div>
                <Button className="text-xs h-8 bg-slate-100 text-slate-700 border-slate-300 font-semibold">
                  <Download size={14} className="mr-2" />
                  Ekspor Data CSV
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="text-[0.65rem] text-slate-600 bg-slate-100 font-bold uppercase tracking-widest border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4">PARAMETER</th>
                        <th className="px-6 py-4 text-center">MINIMUM</th>
                        <th className="px-6 py-4 text-center">RATA-RATA</th>
                        <th className="px-6 py-4 text-center">MAKSIMUM</th>
                        <th className="px-6 py-4 text-center">SATUAN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-xs font-medium">
                      <tr className="hover:bg-white/50">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900 text-sm">Power (Daya Aktif)</p>
                          <p className="text-[0.65rem] text-slate-400 mt-0.5">Sensor Wattmeter SUTM 20kV</p>
                        </td>
                        <td className="px-6 py-4 text-center text-slate-700 font-mono">410</td>
                        <td className="px-6 py-4 text-center font-bold text-slate-900 font-mono">442</td>
                        <td className="px-6 py-4 text-center text-slate-700 font-mono">455</td>
                        <td className="px-6 py-4 text-center font-bold text-slate-500">kW</td>
                      </tr>
                      <tr className="hover:bg-white/50">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900 text-sm">Voltage (Tegangan)</p>
                          <p className="text-[0.65rem] text-slate-400 mt-0.5">Tegangan Terminal Generator L-N</p>
                        </td>
                        <td className="px-6 py-4 text-center text-slate-700 font-mono">398</td>
                        <td className="px-6 py-4 text-center font-bold text-slate-900 font-mono">400</td>
                        <td className="px-6 py-4 text-center text-slate-700 font-mono">401</td>
                        <td className="px-6 py-4 text-center font-bold text-slate-500">V</td>
                      </tr>
                      <tr className="hover:bg-white/50">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900 text-sm">Frequency (Frekuensi)</p>
                          <p className="text-[0.65rem] text-slate-400 mt-0.5">Sinkronisasi Jaringan PLN Grid</p>
                        </td>
                        <td className="px-6 py-4 text-center text-slate-700 font-mono">49,95</td>
                        <td className="px-6 py-4 text-center font-bold text-slate-900 font-mono">50,02</td>
                        <td className="px-6 py-4 text-center text-slate-700 font-mono">50,05</td>
                        <td className="px-6 py-4 text-center font-bold text-slate-500">Hz</td>
                      </tr>
                      <tr className="hover:bg-white/50">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900 text-sm">Flow (Debit Air)</p>
                          <p className="text-[0.65rem] text-slate-400 mt-0.5">Sensor Ultrasonik Kanal Terbuka Intake</p>
                        </td>
                        <td className="px-6 py-4 text-center text-slate-700 font-mono">2,38</td>
                        <td className="px-6 py-4 text-center font-bold text-slate-900 font-mono">2,44</td>
                        <td className="px-6 py-4 text-center text-slate-700 font-mono">2,51</td>
                        <td className="px-6 py-4 text-center font-bold text-slate-500">m³/s</td>
                      </tr>
                      <tr className="hover:bg-white/50">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900 text-sm">Water Level (Forebay)</p>
                          <p className="text-[0.65rem] text-slate-400 mt-0.5">Level Transmitter Kolam Penenang</p>
                        </td>
                        <td className="px-6 py-4 text-center text-slate-700 font-mono">1,72</td>
                        <td className="px-6 py-4 text-center font-bold text-slate-900 font-mono">1,78</td>
                        <td className="px-6 py-4 text-center text-slate-700 font-mono">1,82</td>
                        <td className="px-6 py-4 text-center font-bold text-slate-500">m</td>
                      </tr>
                      <tr className="hover:bg-white/50">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900 text-sm">Suhu Bearing Turbin</p>
                          <p className="text-[0.65rem] text-slate-400 mt-0.5">Sensor RTD Pt100 Drive End</p>
                        </td>
                        <td className="px-6 py-4 text-center text-slate-700 font-mono">45,0</td>
                        <td className="px-6 py-4 text-center font-bold text-slate-900 font-mono">47,8</td>
                        <td className="px-6 py-4 text-center text-slate-700 font-mono">49,0</td>
                        <td className="px-6 py-4 text-center font-bold text-slate-500">°C</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
};

export default TrendParameter;
