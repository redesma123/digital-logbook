import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';

const UnitCondition = () => {
  return (
    <div className="flex h-screen bg-[#F1F5F9] text-slate-800 font-sans">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header />

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Page Header */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Kondisi Unit & Status Operasional</h2>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-sm font-semibold text-slate-700">PLTMH Unit 1 — 500 kW</p>
                </div>
              </div>
              <Button className="text-xs h-8 flex items-center gap-2 bg-white text-slate-600 border-slate-200 hover:bg-slate-50 w-fit px-3">
                <RefreshCw size={14} />
                Refresh Data
              </Button>
            </div>

            {/* RINGKASAN KONDISI UNIT */}
            <Card className="bg-white border-slate-200 shadow-sm rounded-sm">
              <CardHeader className="pb-2 pt-4 px-6 border-b border-slate-100">
                <p className="text-[0.65rem] font-bold text-slate-500 tracking-widest uppercase">RINGKASAN KONDISI UNIT</p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-2 md:grid-cols-6 divide-x divide-slate-100">
                  <div className="p-4">
                    <p className="text-[0.65rem] font-bold text-slate-500 tracking-wider uppercase mb-2">STATUS UNIT</p>
                    <div className="flex items-center gap-2 font-bold text-green-700 text-base">
                      <div className="bg-green-500"></div>
                      RUNNING
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-[0.65rem] font-bold text-slate-500 tracking-wider uppercase mb-1">ACTIVE POWER</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-[#0F4C81]">450</span>
                      <span className="text-xs font-semibold text-slate-500">kW</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-[0.65rem] font-bold text-slate-500 tracking-wider uppercase mb-1">VOLTAGE</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-slate-800">400</span>
                      <span className="text-xs font-semibold text-slate-500">V</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-[0.65rem] font-bold text-slate-500 tracking-wider uppercase mb-1">FREQUENCY</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-slate-800">50</span>
                      <span className="text-xs font-semibold text-slate-500">Hz</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-[0.65rem] font-bold text-slate-500 tracking-wider uppercase mb-1">FLOW</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-slate-800">2,5</span>
                      <span className="text-xs font-semibold text-slate-500">m³/s</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-[0.65rem] font-bold text-slate-500 tracking-wider uppercase mb-1">WATER LEVEL</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-slate-800">1,8</span>
                      <span className="text-xs font-semibold text-slate-500">m</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* PARAMETER KONDISI TABLE */}
            <Card className="bg-white border-slate-200 shadow-sm rounded-sm">
              <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-slate-100">
                <div>
                  <CardTitle className="text-base text-slate-800 font-bold">Parameter Kondisi</CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">Pencatatan parameter operasional elektrik, mekanik, dan hidrolik unit</p>
                </div>
                <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-800">Lihat Detail Parameter →</a>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-600 bg-slate-100/50 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 w-1/4">KELOMPOK</th>
                      <th className="px-6 py-3 w-1/2">PARAMETER</th>
                      <th className="px-6 py-3 text-right">NILAI</th>
                      <th className="px-6 py-3 text-left">SATUAN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* Electrical */}
                    <tr className="hover:bg-slate-50">
                      <td className="px-6 py-2.5 text-xs font-semibold text-slate-600">Electrical</td>
                      <td className="px-6 py-2.5 text-xs text-slate-800">Voltage</td>
                      <td className="px-6 py-2.5 text-right font-bold text-slate-800">400</td>
                      <td className="px-6 py-2.5 text-xs text-slate-500">V</td>
                    </tr>
                    <tr className="hover:bg-slate-50 bg-slate-50/30">
                      <td className="px-6 py-2.5 text-xs font-semibold text-slate-600">Electrical</td>
                      <td className="px-6 py-2.5 text-xs text-slate-800">Current</td>
                      <td className="px-6 py-2.5 text-right font-bold text-slate-800">648</td>
                      <td className="px-6 py-2.5 text-xs text-slate-500">A</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-6 py-2.5 text-xs font-semibold text-slate-600">Electrical</td>
                      <td className="px-6 py-2.5 text-xs text-slate-800">Frequency</td>
                      <td className="px-6 py-2.5 text-right font-bold text-slate-800">50</td>
                      <td className="px-6 py-2.5 text-xs text-slate-500">Hz</td>
                    </tr>
                    <tr className="hover:bg-slate-50 bg-slate-50/30">
                      <td className="px-6 py-2.5 text-xs font-semibold text-slate-600">Electrical</td>
                      <td className="px-6 py-2.5 text-xs font-bold text-[#0F4C81]">Active Power</td>
                      <td className="px-6 py-2.5 text-right font-bold text-[#0F4C81]">450</td>
                      <td className="px-6 py-2.5 text-xs text-slate-500">kW</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-6 py-2.5 text-xs font-semibold text-slate-600">Electrical</td>
                      <td className="px-6 py-2.5 text-xs text-slate-800">Reactive Power</td>
                      <td className="px-6 py-2.5 text-right font-bold text-slate-800">220</td>
                      <td className="px-6 py-2.5 text-xs text-slate-500">kVar</td>
                    </tr>
                    <tr className="hover:bg-slate-50 bg-slate-50/30">
                      <td className="px-6 py-2.5 text-xs font-semibold text-slate-600">Electrical</td>
                      <td className="px-6 py-2.5 text-xs text-slate-800">Power Factor</td>
                      <td className="px-6 py-2.5 text-right font-bold text-slate-800">0,88</td>
                      <td className="px-6 py-2.5 text-xs text-slate-500">—</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-6 py-2.5 text-xs font-semibold text-slate-600">Electrical</td>
                      <td className="px-6 py-2.5 text-xs text-slate-800">Energy Production</td>
                      <td className="px-6 py-2.5 text-right font-bold text-slate-800">4.250</td>
                      <td className="px-6 py-2.5 text-xs text-slate-500">kWh</td>
                    </tr>
                    <tr className="hover:bg-slate-50 bg-slate-50/30">
                      <td className="px-6 py-2.5 text-xs font-semibold text-slate-600">Electrical</td>
                      <td className="px-6 py-2.5 text-xs text-slate-800">Generator Status</td>
                      <td className="px-6 py-2.5 text-right font-bold text-emerald-600">Sinkron</td>
                      <td className="px-6 py-2.5 text-xs text-slate-500">—</td>
                    </tr>

                    {/* Mechanical */}
                    <tr className="hover:bg-slate-50 border-t border-slate-200">
                      <td className="px-6 py-2.5 text-xs font-semibold text-slate-600">Mechanical</td>
                      <td className="px-6 py-2.5 text-xs text-slate-800">RPM</td>
                      <td className="px-6 py-2.5 text-right font-bold text-slate-800">750</td>
                      <td className="px-6 py-2.5 text-xs text-slate-500">RPM</td>
                    </tr>
                    <tr className="hover:bg-slate-50 bg-slate-50/30">
                      <td className="px-6 py-2.5 text-xs font-semibold text-slate-600">Mechanical</td>
                      <td className="px-6 py-2.5 text-xs text-slate-800">Bearing Temperature</td>
                      <td className="px-6 py-2.5 text-right font-bold text-slate-800">48,5</td>
                      <td className="px-6 py-2.5 text-xs text-slate-500">°C</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-6 py-2.5 text-xs font-semibold text-slate-600">Mechanical</td>
                      <td className="px-6 py-2.5 text-xs text-slate-800">Generator Temperature</td>
                      <td className="px-6 py-2.5 text-right font-bold text-slate-800">52,1</td>
                      <td className="px-6 py-2.5 text-xs text-slate-500">°C</td>
                    </tr>
                    <tr className="hover:bg-slate-50 bg-slate-50/30">
                      <td className="px-6 py-2.5 text-xs font-semibold text-slate-600">Mechanical</td>
                      <td className="px-6 py-2.5 text-xs text-slate-800">Turbine Temperature</td>
                      <td className="px-6 py-2.5 text-right font-bold text-slate-800">45,0</td>
                      <td className="px-6 py-2.5 text-xs text-slate-500">°C</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-6 py-2.5 text-xs font-semibold text-slate-600">Mechanical</td>
                      <td className="px-6 py-2.5 text-xs text-slate-800">Vibration</td>
                      <td className="px-6 py-2.5 text-right font-bold text-slate-800">2,1</td>
                      <td className="px-6 py-2.5 text-xs text-slate-500">mm/s</td>
                    </tr>

                    {/* Hydraulic */}
                    <tr className="hover:bg-slate-50 border-t border-slate-200">
                      <td className="px-6 py-2.5 text-xs font-semibold text-slate-600">Hydraulic</td>
                      <td className="px-6 py-2.5 text-xs text-slate-800">Debit air (Flow)</td>
                      <td className="px-6 py-2.5 text-right font-bold text-slate-800">2,5</td>
                      <td className="px-6 py-2.5 text-xs text-slate-500">m³/s</td>
                    </tr>
                    <tr className="hover:bg-slate-50 bg-slate-50/30">
                      <td className="px-6 py-2.5 text-xs font-semibold text-slate-600">Hydraulic</td>
                      <td className="px-6 py-2.5 text-xs text-slate-800">Water Level</td>
                      <td className="px-6 py-2.5 text-right font-bold text-slate-800">1,8</td>
                      <td className="px-6 py-2.5 text-xs text-slate-500">m</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-6 py-2.5 text-xs font-semibold text-slate-600">Hydraulic</td>
                      <td className="px-6 py-2.5 text-xs text-slate-800">Head</td>
                      <td className="px-6 py-2.5 text-right font-bold text-slate-800">24,5</td>
                      <td className="px-6 py-2.5 text-xs text-slate-500">m</td>
                    </tr>
                    <tr className="hover:bg-slate-50 bg-slate-50/30">
                      <td className="px-6 py-2.5 text-xs font-semibold text-slate-600">Hydraulic</td>
                      <td className="px-6 py-2.5 text-xs text-slate-800">Pressure</td>
                      <td className="px-6 py-2.5 text-right font-bold text-slate-800">2,42</td>
                      <td className="px-6 py-2.5 text-xs text-slate-500">bar</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-6 py-2.5 text-xs font-semibold text-slate-600">Hydraulic</td>
                      <td className="px-6 py-2.5 text-xs text-slate-800">Intake Condition</td>
                      <td className="px-6 py-2.5 text-right font-bold text-emerald-600">Aman</td>
                      <td className="px-6 py-2.5 text-xs text-slate-500">—</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Kondisi Operasional */}
              <Card className="bg-white border-slate-200 shadow-sm rounded-sm">
                <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                  <CardTitle className="text-base text-slate-800 font-bold">Kondisi Operasional</CardTitle>
                  <p className="text-[0.65rem] font-bold text-slate-500 tracking-widest uppercase">KELOMPOK OPERATIONAL</p>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100">
                    <div className="flex justify-between items-center px-6 py-3 hover:bg-slate-50">
                      <span className="text-sm text-slate-600">Running Hours</span>
                      <span className="text-sm font-bold text-slate-900 font-mono">14 jam 30 menit</span>
                    </div>
                    <div className="flex justify-between items-center px-6 py-3 hover:bg-slate-50">
                      <span className="text-sm text-slate-600">Status Unit</span>
                      <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-sm flex items-center gap-1.5 uppercase">
                        <div className="bg-green-500"></div>
                        RUNNING
                      </span>
                    </div>
                    <div className="flex justify-between items-center px-6 py-3 hover:bg-slate-50">
                      <span className="text-sm text-slate-600">Start / Stop Terakhir</span>
                      <span className="text-xs font-semibold text-slate-700 font-mono">07:00 WIB (Normal Start)</span>
                    </div>
                    <div className="flex justify-between items-center px-6 py-3 hover:bg-slate-50">
                      <span className="text-sm text-slate-600">Trip</span>
                      <span className="text-sm font-medium text-slate-400">— (Nihil)</span>
                    </div>
                    <div className="flex justify-between items-center px-6 py-3 hover:bg-slate-50">
                      <span className="text-sm text-slate-600">Shutdown</span>
                      <span className="text-sm font-medium text-slate-400">— (Nihil)</span>
                    </div>
                    <div className="flex justify-between items-center px-6 py-3 hover:bg-slate-50">
                      <span className="text-sm text-slate-600">Maintenance</span>
                      <span className="text-sm font-semibold text-green-700">Preventif Sesuai Jadwal</span>
                    </div>
                    <div className="flex justify-between items-center px-6 py-3 hover:bg-slate-50">
                      <span className="text-sm text-slate-600">Gangguan</span>
                      <span className="text-sm font-medium text-slate-400">— (Nihil)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Kondisi Komponen */}
              <Card className="bg-white border-slate-200 shadow-sm rounded-sm">
                <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                  <CardTitle className="text-base text-slate-800 font-bold">Kondisi Komponen</CardTitle>
                  <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-800">Lihat Detail →</a>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100">
                    <div className="flex justify-between items-center px-6 py-2.5 bg-slate-50">
                      <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">KOMPONEN</span>
                      <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">STATUS KONDISI</span>
                    </div>
                    <div className="flex justify-between items-center px-6 py-3 hover:bg-slate-50">
                      <span className="text-sm font-bold text-slate-800">Turbin</span>
                      <span className="text-xs font-semibold text-green-700 flex items-center gap-1.5"><div className="bg-green-500"></div>Normal</span>
                    </div>
                    <div className="flex justify-between items-center px-6 py-3 hover:bg-slate-50">
                      <span className="text-sm font-bold text-slate-800">Generator</span>
                      <span className="text-xs font-semibold text-green-700 flex items-center gap-1.5"><div className="bg-green-500"></div>Normal</span>
                    </div>
                    <div className="flex justify-between items-center px-6 py-3 hover:bg-slate-50">
                      <span className="text-sm font-bold text-slate-800">Intake</span>
                      <span className="text-xs font-semibold text-green-700 flex items-center gap-1.5"><div className="bg-green-500"></div>Normal</span>
                    </div>
                    <div className="flex justify-between items-center px-6 py-3 hover:bg-slate-50">
                      <span className="text-sm font-bold text-slate-800">Sistem Pendukung</span>
                      <span className="text-xs font-semibold text-green-700 flex items-center gap-1.5"><div className="bg-green-500"></div>Normal</span>
                    </div>
                  </div>
                  <div className="px-6 py-4 bg-slate-50/50 mt-4 border-t border-slate-100 flex justify-between items-center">
                    <p className="text-xs text-slate-500">Pemeriksaan visual & sensorik berkala</p>
                    <p className="text-xs font-bold text-green-700">4 Komponen Siap Operasi</p>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Checklist Fisik Terakhir */}
            <Card className="bg-slate-50 border-slate-200 shadow-none rounded-sm">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <h4 className="text-sm font-bold text-slate-800">Checklist Fisik Terakhir</h4>
                    <span className="text-xs text-slate-400">•</span>
                    <p className="text-xs font-medium text-slate-600">Shift Siang — 14:00 WIB • D. Pratama - Operator Jaga</p>
                  </div>
                  <p className="text-sm text-slate-600 italic">"Pelumasan bearing normal, kebocoran seal nihil, getaran stabil, saringan sampah bersih."</p>
                  
                  <div className="flex gap-2 mt-3">
                    <div className="bg-green-100/50 border border-green-200 text-green-700 px-2 py-1 rounded text-xs flex items-center gap-1.5">
                      <div className="bg-green-500"></div>
                      Pelumasan OK
                    </div>
                    <div className="bg-green-100/50 border border-green-200 text-green-700 px-2 py-1 rounded text-xs flex items-center gap-1.5">
                      <div className="g-green-500"></div>
                      Mechanical Seal Utuh
                    </div>
                    <div className="bg-green-100/50 border border-green-200 text-green-700 px-2 py-1 rounded text-xs flex items-center gap-1.5">
                      <div className="g-green-500"></div>
                      Trashrack Clear
                    </div>
                  </div>
                </div>
                <Button className="text-xs h-9 bg-white border-slate-300 font-semibold text-slate-800 w-fit px-4 whitespace-nowrap">
                  Buka Logbook Lengkap →
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
};

export default UnitCondition;
