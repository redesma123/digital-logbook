import { Card, CardContent } from '../components/ui/card';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { Download, Filter } from 'lucide-react';
import { Button } from '../components/ui/button';

const HistoryOperasi = () => {
  return (
    <div className="flex h-screen bg-[#F1F5F9] text-slate-800 font-sans">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header />

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-[1400px] mx-auto space-y-4">

            {/* Page Header */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Histori Operasi (Logbook Harian)</h2>
              <p className="text-sm font-medium text-slate-500 mt-1">Riwayat pencatatan operasi unit berdasarkan logsheet operator.</p>
            </div>

            {/* Filter Section */}
            <Card className="bg-slate-50 border-slate-200 shadow-sm rounded-sm">
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4 items-end justify-between">
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <label className="text-[0.65rem] font-bold text-slate-500 tracking-widest uppercase">UNIT:</label>
                      <select className="h-8 text-sm border-slate-200 rounded bg-white text-slate-700 font-semibold px-2 outline-none focus:ring-1 focus:ring-blue-500">
                        <option>PLTMH Unit 1 — 500 kW</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-[0.65rem] font-bold text-slate-500 tracking-widest uppercase">TANGGAL:</label>
                      <input type="date" defaultValue="2024-10-24" className="h-8 text-sm border-slate-200 rounded bg-white text-slate-700 px-2 outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-[0.65rem] font-bold text-slate-500 tracking-widest uppercase">SHIFT:</label>
                      <select className="h-8 text-sm border-slate-200 rounded bg-white text-slate-700 px-2 outline-none focus:ring-1 focus:ring-blue-500">
                        <option>Shift Pagi (07:00–15:00)</option>
                        <option>Shift Siang (15:00–23:00)</option>
                        <option>Shift Malam (23:00–07:00)</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-[0.65rem] font-bold text-slate-500 tracking-widest uppercase">OPERATOR:</label>
                      <select className="h-8 text-sm border-slate-200 rounded bg-white text-slate-700 px-2 outline-none focus:ring-1 focus:ring-blue-500">
                        <option>Semua Operator</option>
                        <option>Pratama</option>
                        <option>Rian</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-2 md:mt-0 w-full lg:w-auto ml-auto">
                    <Button className="text-xs h-8 bg-white text-slate-600 border-slate-300 w-fit px-3 whitespace-nowrap">
                      <Download size={14} className="mr-2" />
                      Ekspor CSV / PDF
                    </Button>
                    <Button className="text-xs h-8 bg-[#0F172A] hover:bg-slate-800 text-white border-none w-fit px-3 whitespace-nowrap">
                      <Filter size={14} className="mr-2" />
                      Terapkan Filter
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Info Bar */}
            <div className="flex items-center gap-2 px-1">
              <p className="text-xs font-semibold text-slate-600">8 entri tercatat · Shift Pagi (07:00–15:00 WIB) · Operator Jaga: Pratama & Rian</p>
            </div>

            {/* Main Table */}
            <Card className="bg-white border-slate-200 shadow-sm rounded-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="text-[0.65rem] text-slate-600 bg-slate-100/80 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 border-l-2 border-transparent">JAM</th>
                      <th className="px-4 py-3">STATUS</th>
                      <th className="px-4 py-3 text-right">DAYA AKTIF</th>
                      <th className="px-4 py-3 text-right">TEGANGAN</th>
                      <th className="px-4 py-3 text-right">FREKUENSI</th>
                      <th className="px-4 py-3 text-right">DEBIT AIR</th>
                      <th className="px-4 py-3 text-right">WATER LEVEL</th>
                      <th className="px-4 py-3 text-right">SUHU BEARING</th>
                      <th className="px-4 py-3">OPERATOR</th>
                      <th className="px-4 py-3 w-1/4">CATATAN OPERASI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">

                    {/* Row 1 (Active) */}
                    <tr className="bg-blue-50/30 hover:bg-slate-50 cursor-pointer">
                      <td className="px-4 py-3 border-l-2 border-blue-500 font-bold text-slate-900">14:00</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[0.6rem] font-bold bg-green-50 text-green-700 border border-green-200 uppercase">
                          <span className="bg-green-500"></span>
                          RUNNING
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">450 kW</td>
                      <td className="px-4 py-3 text-right text-slate-700">400 V</td>
                      <td className="px-4 py-3 text-right text-slate-700">50,02 Hz</td>
                      <td className="px-4 py-3 text-right text-slate-700">2,50 m³/s</td>
                      <td className="px-4 py-3 text-right text-slate-700">1,80 m</td>
                      <td className="px-4 py-3 text-right text-slate-700">48,5 °C</td>
                      <td className="px-4 py-3 font-semibold text-slate-700">Pratama</td>
                      <td className="px-4 py-3 text-slate-500 truncate max-w-[200px]">Beban puncak siang, grid PLN stabil</td>
                    </tr>

                    {/* Row 2 */}
                    <tr className="hover:bg-slate-50 cursor-pointer">
                      <td className="px-4 py-3 border-l-2 border-transparent font-bold text-slate-900">13:00</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[0.6rem] font-bold bg-green-50 text-green-700 border border-green-200 uppercase">
                          <span className="bg-green-500"></span>
                          RUNNING
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">448 kW</td>
                      <td className="px-4 py-3 text-right text-slate-700">400 V</td>
                      <td className="px-4 py-3 text-right text-slate-700">50,01 Hz</td>
                      <td className="px-4 py-3 text-right text-slate-700">2,49 m³/s</td>
                      <td className="px-4 py-3 text-right text-slate-700">1,80 m</td>
                      <td className="px-4 py-3 text-right text-slate-700">48,2 °C</td>
                      <td className="px-4 py-3 font-semibold text-slate-700">Pratama</td>
                      <td className="px-4 py-3 text-slate-500 truncate max-w-[200px]">Kondisi transmisi 20 kV normal</td>
                    </tr>

                    {/* Row 3 */}
                    <tr className="bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                      <td className="px-4 py-3 border-l-2 border-transparent font-bold text-slate-900">12:00</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[0.6rem] font-bold bg-green-50 text-green-700 border border-green-200 uppercase">
                          <span className="bg-green-500"></span>
                          RUNNING
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">455 kW</td>
                      <td className="px-4 py-3 text-right text-slate-700">401 V</td>
                      <td className="px-4 py-3 text-right text-slate-700">50,04 Hz</td>
                      <td className="px-4 py-3 text-right text-slate-700">2,51 m³/s</td>
                      <td className="px-4 py-3 text-right text-slate-700">1,82 m</td>
                      <td className="px-4 py-3 text-right text-slate-700">49,0 °C</td>
                      <td className="px-4 py-3 font-semibold text-slate-700">Pratama</td>
                      <td className="px-4 py-3 text-slate-500 truncate max-w-[200px]">Beban puncak stabil, cuaca cerah</td>
                    </tr>

                    {/* Row 4 */}
                    <tr className="hover:bg-slate-50 cursor-pointer">
                      <td className="px-4 py-3 border-l-2 border-transparent font-bold text-slate-900">11:00</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[0.6rem] font-bold bg-green-50 text-green-700 border border-green-200 uppercase">
                          <span className="bg-green-500"></span>
                          RUNNING
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">442 kW</td>
                      <td className="px-4 py-3 text-right text-slate-700">399 V</td>
                      <td className="px-4 py-3 text-right text-slate-700">49,98 Hz</td>
                      <td className="px-4 py-3 text-right text-slate-700">2,48 m³/s</td>
                      <td className="px-4 py-3 text-right text-slate-700">1,79 m</td>
                      <td className="px-4 py-3 text-right text-slate-700">48,0 °C</td>
                      <td className="px-4 py-3 font-semibold text-slate-700">Pratama</td>
                      <td className="px-4 py-3 text-slate-500 truncate max-w-[200px]">Pergantian cuaca cerah</td>
                    </tr>

                    {/* Row 5 */}
                    <tr className="bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                      <td className="px-4 py-3 border-l-2 border-transparent font-bold text-slate-900">10:00</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[0.6rem] font-bold bg-green-50 text-green-700 border border-green-200 uppercase">
                          <span className="bg-green-500"></span>
                          RUNNING
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">438 kW</td>
                      <td className="px-4 py-3 text-right text-slate-700">400 V</td>
                      <td className="px-4 py-3 text-right text-slate-700">50,00 Hz</td>
                      <td className="px-4 py-3 text-right text-slate-700">2,46 m³/s</td>
                      <td className="px-4 py-3 text-right text-slate-700">1,78 m</td>
                      <td className="px-4 py-3 text-right text-slate-700">47,6 °C</td>
                      <td className="px-4 py-3 font-semibold text-slate-700">Rian</td>
                      <td className="px-4 py-3 text-slate-500 truncate max-w-[200px]">Pembersihan berkala trashrack intake</td>
                    </tr>

                    {/* Row 6 */}
                    <tr className="hover:bg-slate-50 cursor-pointer">
                      <td className="px-4 py-3 border-l-2 border-transparent font-bold text-slate-900">09:00</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[0.6rem] font-bold bg-green-50 text-green-700 border border-green-200 uppercase">
                          <span className="bg-green-500"></span>
                          RUNNING
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">430 kW</td>
                      <td className="px-4 py-3 text-right text-slate-700">398 V</td>
                      <td className="px-4 py-3 text-right text-slate-700">49,95 Hz</td>
                      <td className="px-4 py-3 text-right text-slate-700">2,42 m³/s</td>
                      <td className="px-4 py-3 text-right text-slate-700">1,75 m</td>
                      <td className="px-4 py-3 text-right text-slate-700">47,2 °C</td>
                      <td className="px-4 py-3 font-semibold text-slate-700">Rian</td>
                      <td className="px-4 py-3 text-slate-500 truncate max-w-[200px]">Peningkatan bertahap daya reaktif</td>
                    </tr>

                    {/* Row 7 */}
                    <tr className="bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                      <td className="px-4 py-3 border-l-2 border-transparent font-bold text-slate-900">08:00</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[0.6rem] font-bold bg-green-50 text-green-700 border border-green-200 uppercase">
                          <span className="bg-green-500"></span>
                          RUNNING
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">425 kW</td>
                      <td className="px-4 py-3 text-right text-slate-700">400 V</td>
                      <td className="px-4 py-3 text-right text-slate-700">50,01 Hz</td>
                      <td className="px-4 py-3 text-right text-slate-700">2,40 m³/s</td>
                      <td className="px-4 py-3 text-right text-slate-700">1,74 m</td>
                      <td className="px-4 py-3 text-right text-slate-700">46,8 °C</td>
                      <td className="px-4 py-3 font-semibold text-slate-700">Rian</td>
                      <td className="px-4 py-3 text-slate-500 truncate max-w-[200px]">Handover shift selesai, param aman</td>
                    </tr>

                    {/* Row 8 */}
                    <tr className="hover:bg-slate-50 cursor-pointer">
                      <td className="px-4 py-3 border-l-2 border-transparent font-bold text-slate-900">07:00</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[0.6rem] font-bold bg-green-50 text-green-700 border border-green-200 uppercase">
                          <span className="bg-green-500"></span>
                          RUNNING
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">420 kW</td>
                      <td className="px-4 py-3 text-right text-slate-700">400 V</td>
                      <td className="px-4 py-3 text-right text-slate-700">50,00 Hz</td>
                      <td className="px-4 py-3 text-right text-slate-700">2,38 m³/s</td>
                      <td className="px-4 py-3 text-right text-slate-700">1,72 m</td>
                      <td className="px-4 py-3 text-right text-slate-700">46,5 °C</td>
                      <td className="px-4 py-3 font-semibold text-slate-700">Rian</td>
                      <td className="px-4 py-3 text-slate-500 truncate max-w-[200px]">Awal shift pagi, sinkron grid lancar</td>
                    </tr>

                  </tbody>
                </table>
              </div>
              <div className="bg-slate-100/50 px-4 py-3 flex justify-between items-center border-t border-slate-200">
                <p className="text-xs text-slate-500">Batas nominal voltage: 380–415 V · Toleransi frequency: 49,8–50,2 Hz · Maks. suhu bearing: &lt; 65 °C</p>
                <p className="text-xs font-bold text-blue-600">PLTMH Unit 1 • Logsheet Valid</p>
              </div>
            </Card>

            {/* Detail Section */}
            <Card className="bg-slate-50 border-slate-200 shadow-sm rounded-sm mt-6">
              <CardContent className="p-5">
                <div className="flex flex-wrap items-center gap-2 mb-4 border-b border-slate-200 pb-3">
                  <h3 className="text-base font-bold text-slate-800">Detail Log Operasi — Jam 14:00 WIB</h3>
                  <span className="text-slate-400">·</span>
                  <p className="text-sm text-slate-600">Operator: Pratama</p>
                  <span className="text-slate-400">·</span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[0.65rem] font-bold bg-green-100 text-green-700 border border-green-200 uppercase">
                    <span className="bg-green-500"></span>
                    RUNNING
                  </span>
                  <span className="text-slate-400">·</span>
                  <p className="text-sm text-slate-500 italic">Catatan: "Beban puncak siang, grid PLN stabil"</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Electrical */}
                  <div className="bg-white border border-slate-200 rounded p-4">
                    <p className="text-[0.65rem] font-bold text-blue-600 tracking-widest uppercase mb-3 flex items-center gap-1.5">
                      <span></span> ELECTRICAL
                    </p>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Voltage:</span>
                        <span className="font-bold text-slate-800">400 V</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Current:</span>
                        <span className="font-bold text-slate-800">648 A</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Frequency:</span>
                        <span className="font-bold text-slate-800">50,02 Hz</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Active Power:</span>
                        <span className="font-bold text-slate-800">450 kW</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Reactive Power:</span>
                        <span className="font-bold text-slate-800">180 kVAR</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Power Factor:</span>
                        <span className="font-bold text-slate-800">0,88</span>
                      </div>
                    </div>
                  </div>

                  {/* Mechanical */}
                  <div className="bg-white border border-slate-200 rounded p-4">
                    <p className="text-[0.65rem] font-bold text-blue-600 tracking-widest uppercase mb-3 flex items-center gap-1.5">
                      <span></span> MECHANICAL
                    </p>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">RPM:</span>
                        <span className="font-bold text-slate-800">750 RPM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Bearing Temp:</span>
                        <span className="font-bold text-slate-800">48,5 °C</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Generator Temp:</span>
                        <span className="font-bold text-slate-800">52,1 °C</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Turbine Temp:</span>
                        <span className="font-bold text-slate-800">45,0 °C</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Vibration:</span>
                        <span className="font-bold text-slate-800">2,1 mm/s</span>
                      </div>
                    </div>
                  </div>

                  {/* Hydraulic */}
                  <div className="bg-white border border-slate-200 rounded p-4">
                    <p className="text-[0.65rem] font-bold text-blue-600 tracking-widest uppercase mb-3 flex items-center gap-1.5">
                      <span></span> HYDRAULIC
                    </p>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Debit Air:</span>
                        <span className="font-bold text-slate-800">2,50 m³/s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Water Level:</span>
                        <span className="font-bold text-slate-800">1,80 m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Head:</span>
                        <span className="font-bold text-slate-800">24,5 m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Pressure:</span>
                        <span className="font-bold text-slate-800">2,42 bar</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Intake Condition:</span>
                        <span className="font-bold text-emerald-600">Bersih / Normal</span>
                      </div>
                    </div>
                  </div>

                  {/* Operational */}
                  <div className="bg-white border border-slate-200 rounded p-4">
                    <p className="text-[0.65rem] font-bold text-blue-600 tracking-widest uppercase mb-3 flex items-center gap-1.5">
                      <span></span> OPERATIONAL
                    </p>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Running Hours:</span>
                        <span className="font-bold text-slate-800">14 jam 30 mnt</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Start/Stop:</span>
                        <span className="font-bold text-slate-800">07:00 (Normal)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Trip Proteksi:</span>
                        <span className="font-bold text-emerald-600">Nihil</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Shutdown:</span>
                        <span className="font-bold text-emerald-600">Nihil</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Maintenance:</span>
                        <span className="font-bold text-slate-800">Preventif Normal</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Gangguan:</span>
                        <span className="font-bold text-emerald-600">Nihil</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
};

export default HistoryOperasi;
