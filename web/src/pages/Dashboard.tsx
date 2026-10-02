import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const trendData = [
  { time: '00:00', power: 400 },
  { time: '02:00', power: 410 },
  { time: '04:00', power: 405 },
  { time: '06:00', power: 420 },
  { time: '08:00', power: 435 },
  { time: '10:00', power: 445 },
  { time: '12:00', power: 450 },
  { time: '14:00', power: 448 },
];

const energyData = [
  { time: '00:00', energy: 300 },
  { time: '02:00', energy: 290 },
  { time: '04:00', energy: 300 },
  { time: '06:00', energy: 310 },
  { time: '08:00', energy: 330 },
  { time: '10:00', energy: 340 },
  { time: '12:00', energy: 350 },
  { time: '14:00', energy: 345 },
];

const Dashboard = () => {
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
                    <p className="text-[0.65rem] font-bold text-slate-500 tracking-widest uppercase mb-1">MONITORING OPERASIONAL</p>
                    <CardTitle className="text-lg text-slate-800 font-semibold">Kondisi Unit — PLTMH Unit 1</CardTitle>
                  </div>
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 border border-green-200">
                    <div className="bg-green-500"></div>
                    RUNNING
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#F8FAFC] p-4 rounded-sm border border-slate-100">
                    <p className="text-[0.65rem] font-bold text-slate-500 tracking-wider uppercase mb-1">DAYA (POWER)</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-slate-800">450</span>
                      <span className="text-xs font-semibold text-slate-500">kW</span>
                    </div>
                    <p className="text-xs text-green-600 font-semibold mt-1"> Beban 90%</p>
                  </div>
                  <div className="bg-[#F8FAFC] p-4 rounded-sm border border-slate-100">
                    <p className="text-[0.65rem] font-bold text-slate-500 tracking-wider uppercase mb-1">FREKUENSI</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-slate-800">50.0</span>
                      <span className="text-xs font-semibold text-slate-500">Hz</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Sinkron Grid PLN</p>
                  </div>
                  <div className="bg-[#F8FAFC] p-4 rounded-sm border border-slate-100">
                    <p className="text-[0.65rem] font-bold text-slate-500 tracking-wider uppercase mb-1">DEBIT AIR (FLOW)</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-slate-800">2.50</span>
                      <span className="text-xs font-semibold text-slate-500">m³/s</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Target: 2.45 m³/s</p>
                  </div>
                  <div className="bg-[#F0F9FF] p-4 rounded-sm border border-blue-100">
                    <p className="text-[0.65rem] font-bold text-blue-600 tracking-wider uppercase mb-1">AVAILABILITY BULAN INI</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-blue-700">98.5</span>
                      <span className="text-xs font-semibold text-blue-600">%</span>
                    </div>
                    <p className="text-xs text-green-600 font-semibold mt-1">Target KPI {'>'}95%</p>
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
                      <CardDescription className="text-xs text-slate-500 mt-0.5">Profil operasional harian pembangkit</CardDescription>
                    </div>
                    <div className="bg-slate-100 rounded-sm p-0.5 flex text-xs font-medium">
                      <button className="bg-slate-900 text-white px-3 py-1 rounded-sm shadow-sm">Hari Ini</button>
                      <button className="text-slate-500 px-3 py-1 hover:text-slate-800">7 Hari</button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] w-full mt-4 bg-slate-50/50 rounded-sm border border-slate-100 pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} domain={[350, 500]} dx={-10} />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey="power" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 3, fill: '#0ea5e9', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-between items-center mt-4 text-xs">
                    <div className="text-slate-500">Rata-rata Harian: <span className="font-semibold text-slate-800">432 kW</span></div>
                    <div className="text-slate-500">Puncak (Peak): <span className="font-semibold text-slate-800">455 kW (12:00)</span></div>
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
                      <div className="text-xl font-bold text-slate-800 leading-none">4.250 <span className="text-xs font-semibold text-slate-500">kWh</span></div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={energyData} margin={{ top: 10, right: 0, bottom: 5, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                        <RechartsTooltip cursor={{fill: '#f1f5f9'}} />
                        <Bar dataKey="energy" radius={[2, 2, 0, 0]} barSize={16}>
                          {energyData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={index === energyData.length - 1 || index === energyData.length - 2 ? '#0284c7' : '#93c5fd'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-between items-center mt-4 text-xs border-t border-slate-100 pt-3">
                    <div className="text-slate-500">Rerata Jam: <span className="font-semibold text-slate-800">303,5 kWh/jam</span></div>
                    <div className="text-slate-500">Status Ekspor: <span className="font-semibold text-emerald-600">Normal Grid feed</span></div>
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
                    <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-800">Lihat Log Gangguan</a>
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
                      <tr className="hover:bg-slate-50">
                        <td className="px-6 py-3 text-xs font-medium text-slate-700">13:15 WIB</td>
                        <td className="px-6 py-3 text-xs text-slate-700 font-medium">Vibrasi bearing generator</td>
                        <td className="px-6 py-3 text-right">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[0.65rem] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Ditangani
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="px-6 py-3 text-xs font-medium text-slate-700">09:40 WIB</td>
                        <td className="px-6 py-3 text-xs text-slate-600">Fluktuasi level air intake</td>
                        <td className="px-6 py-3 text-right">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[0.65rem] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Selesai
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="px-6 py-3 text-xs font-medium text-slate-400">Kemarin</td>
                        <td className="px-6 py-3 text-xs text-slate-500">Trip tegangan switchyard</td>
                        <td className="px-6 py-3 text-right">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[0.65rem] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            Selesai
                          </span>
                        </td>
                      </tr>
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
                    <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-800">Jadwal Kalender</a>
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="space-y-4">
                    {/* Item 1 */}
                    <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800">Pemeriksaan viskositas bearing</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Jadwal: <span className="font-semibold text-slate-700">Hari Ini (Shift 2)</span> • Teknisi: Bambang</p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[0.65rem] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Berlangsung
                      </span>
                    </div>
                    {/* Item 2 */}
                    <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800">Inspeksi rutin turbin Francis</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Jadwal: 22 Okt 2024 • Hasil: Celah runner aman, tidak ada kavitasi</p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[0.65rem] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Selesai
                      </span>
                    </div>
                    {/* Item 3 */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800">Kalibrasi sensor level air</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Jadwal: 18 Okt 2024 • Deviasi 0.01m (Diterima)</p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[0.65rem] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Selesai
                      </span>
                    </div>
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
                    <CardDescription className="text-xs text-slate-500 mt-0.5">Logging per jam pada shift berjalan (Shift 1 & 2)</CardDescription>
                  </div>
                  <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center">Lihat semua histori →</a>
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
                    <tr className="hover:bg-slate-50">
                      <td className="px-6 py-3 text-xs font-medium text-slate-700">14:00 WIB</td>
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[0.65rem] font-bold bg-green-50 text-green-700 border border-green-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          Running
                        </span>
                      </td>
                      <td className="px-6 py-3 text-xs font-bold text-slate-700">450 kW</td>
                      <td className="px-6 py-3 text-xs font-medium text-slate-600">50.0 Hz</td>
                      <td className="px-6 py-3 text-xs font-medium text-slate-600">2.50 m³/s</td>
                      <td className="px-6 py-3 text-xs text-slate-600">Operasional normal, pembebanan optimal</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-6 py-3 text-xs font-medium text-slate-700">13:00 WIB</td>
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[0.65rem] font-bold bg-green-50 text-green-700 border border-green-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          Running
                        </span>
                      </td>
                      <td className="px-6 py-3 text-xs font-bold text-slate-700">448 kW</td>
                      <td className="px-6 py-3 text-xs font-medium text-slate-600">50.0 Hz</td>
                      <td className="px-6 py-3 text-xs font-medium text-slate-600">2.49 m³/s</td>
                      <td className="px-6 py-3 text-xs text-slate-600">Kondisi stabil, debit intake konstan</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-6 py-3 text-xs font-medium text-slate-700">12:00 WIB</td>
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[0.65rem] font-bold bg-green-50 text-green-700 border border-green-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          Running
                        </span>
                      </td>
                      <td className="px-6 py-3 text-xs font-bold text-slate-700">455 kW</td>
                      <td className="px-6 py-3 text-xs font-medium text-slate-600">50.0 Hz</td>
                      <td className="px-6 py-3 text-xs font-medium text-slate-600">2.51 m³/s</td>
                      <td className="px-6 py-3 text-xs text-slate-600">Beban puncak siang hari</td>
                    </tr>
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
