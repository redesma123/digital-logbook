import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { RefreshCw, Zap, Settings, Droplets, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { dashboardApi, DashboardSummary } from '../api/dashboard.api';
import { unitApi, UnitItem } from '../api/unit.api';

const UnitCondition: React.FC = () => {
  const [units, setUnits] = useState<UnitItem[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<number | undefined>(undefined);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [expandedCategory, setExpandedCategory] = useState<'electrical' | 'mechanical' | 'hydraulic' | null>('electrical');

  const toggleCategory = (cat: 'electrical' | 'mechanical' | 'hydraulic') => {
    setExpandedCategory(expandedCategory === cat ? null : cat);
  };

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

  const fetchUnitSummary = async () => {
    if (selectedUnitId === undefined) return;
    setLoading(true);
    try {
      const data = await dashboardApi.getSummary(selectedUnitId);
      if (data) {
        setSummary(data);
      }
    } catch (err) {
      console.error('Gagal mengambil ringkasan kondisi unit:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUnitId !== undefined) {
      fetchUnitSummary();
    }
  }, [selectedUnitId]);

  const activeUnit = units.find((u) => u.id === selectedUnitId);
  const latest = summary?.latest_entry;
  const electrical = latest?.electrical;
  const mechanical = latest?.mechanical;
  const hydraulic = latest?.hydraulic;

  // Nilai telemetri murni database (0 jika belum ada entri)
  const activePower = electrical?.active_power_kw ?? 0;
  const voltage = electrical?.voltage_v ?? 0;
  const frequency = electrical?.frequency_hz ?? 0;
  const flow = hydraulic?.water_flow_m3_s ?? 0;
  const waterLevel = hydraulic?.water_level_m ?? 0;
  const statusUnit = latest?.unit_status || summary?.unit?.current_status || (loading ? 'MEMUAT' : 'STANDBY');

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
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Kondisi Unit & Status Operasional</h2>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">UNIT:</label>
                    <select
                      value={selectedUnitId ?? ''}
                      onChange={(e) => setSelectedUnitId(e.target.value ? Number(e.target.value) : undefined)}
                      className="h-8 text-sm font-semibold border border-slate-200 rounded bg-white text-slate-800 px-2 outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                      {units.length === 0 && <option value="">PLTMH Unit 1 — 500 kW</option>}
                    </select>
                  </div>
                </div>
              </div>
              <Button
                type="button"
                onClick={fetchUnitSummary}
                disabled={loading}
                className="w-auto text-xs h-8 flex items-center gap-2 bg-white text-slate-600 border border-slate-300 hover:bg-slate-50 px-3"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                {loading ? 'Memuat...' : 'Refresh Data'}
              </Button>
            </div>

            {/* RINGKASAN KONDISI UNIT */}
            <Card className="bg-white border-slate-200 shadow-sm rounded-sm">
              <CardHeader className="pb-2 pt-4 px-6 border-b border-slate-100 flex flex-row items-center justify-between">
                <p className="text-[0.65rem] font-bold text-slate-500 tracking-widest uppercase">
                  RINGKASAN TELEMETRI REALTIME — {activeUnit?.name || 'PLTMH UNIT 1'}
                </p>
                {latest && (
                  <span className="text-xs text-slate-400 font-mono">
                    Data shift {latest.shift} · {latest.date}
                  </span>
                )}
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-2 md:grid-cols-6 divide-x divide-slate-100">
                  <div className="p-4">
                    <p className="text-[0.65rem] font-bold text-slate-500 tracking-wider uppercase mb-2">STATUS UNIT</p>
                    <div className="font-bold text-green-700 text-base">
                      {statusUnit}
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-[0.65rem] font-bold text-slate-500 tracking-wider uppercase mb-1">ACTIVE POWER</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-[#0F4C81]">{activePower}</span>
                      <span className="text-xs font-semibold text-slate-500">kW</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-[0.65rem] font-bold text-slate-500 tracking-wider uppercase mb-1">VOLTAGE</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-slate-800">{voltage}</span>
                      <span className="text-xs font-semibold text-slate-500">V</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-[0.65rem] font-bold text-slate-500 tracking-wider uppercase mb-1">FREQUENCY</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-slate-800">{frequency}</span>
                      <span className="text-xs font-semibold text-slate-500">Hz</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-[0.65rem] font-bold text-slate-500 tracking-wider uppercase mb-1">FLOW</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-slate-800">{flow}</span>
                      <span className="text-xs font-semibold text-slate-500">m³/s</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-[0.65rem] font-bold text-slate-500 tracking-wider uppercase mb-1">WATER LEVEL</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-slate-800">{waterLevel}</span>
                      <span className="text-xs font-semibold text-slate-500">m</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3 PARAMETER KONDISI CARDS (ELECTRICAL, MECHANICAL, HYDRAULIC) */}
            <div className="space-y-4">
              {/* Card 1: Electrical System */}
              <Card className="bg-white border-slate-200 shadow-sm rounded-sm overflow-hidden">
                <div
                  onClick={() => toggleCategory('electrical')}
                  className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 transition-colors select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-slate-100 text-[#0F4C81]">
                      <Zap size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Parameter Kelistrikan (Electrical)</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Tegangan, arus, frekuensi, active power, reactive power, cos phi, dan energi
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-semibold text-slate-700 font-mono">
                      {activePower > 0 ? `${activePower} kW` : '-'}
                    </span>
                    {expandedCategory === 'electrical' ? (
                      <ChevronUp size={16} className="text-slate-400" />
                    ) : (
                      <ChevronDown size={16} className="text-slate-400" />
                    )}
                  </div>
                </div>

                {expandedCategory === 'electrical' && (
                  <CardContent className="p-0 border-t border-slate-100">
                    <table className="w-full text-sm text-left">
                      <thead className="text-[0.65rem] text-slate-500 bg-slate-50/80 font-bold uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-2.5 w-1/2">PARAMETER</th>
                          <th className="px-6 py-2.5 text-right">NILAI</th>
                          <th className="px-6 py-2.5 text-left">SATUAN</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr className="hover:bg-slate-50">
                          <td className="px-6 py-2.5 text-xs text-slate-800 font-medium">Voltage</td>
                          <td className="px-6 py-2.5 text-right font-bold text-slate-800">{voltage}</td>
                          <td className="px-6 py-2.5 text-xs text-slate-500">V</td>
                        </tr>
                        <tr className="hover:bg-slate-50 bg-slate-50/30">
                          <td className="px-6 py-2.5 text-xs text-slate-800 font-medium">Current</td>
                          <td className="px-6 py-2.5 text-right font-bold text-slate-800">{electrical?.current_a ?? 0}</td>
                          <td className="px-6 py-2.5 text-xs text-slate-500">A</td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="px-6 py-2.5 text-xs text-slate-800 font-medium">Frequency</td>
                          <td className="px-6 py-2.5 text-right font-bold text-slate-800">{frequency}</td>
                          <td className="px-6 py-2.5 text-xs text-slate-500">Hz</td>
                        </tr>
                        <tr className="hover:bg-slate-50 bg-slate-50/30">
                          <td className="px-6 py-2.5 text-xs font-bold text-[#0F4C81]">Active Power</td>
                          <td className="px-6 py-2.5 text-right font-bold text-[#0F4C81]">{activePower}</td>
                          <td className="px-6 py-2.5 text-xs text-slate-500">kW</td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="px-6 py-2.5 text-xs text-slate-800 font-medium">Reactive Power</td>
                          <td className="px-6 py-2.5 text-right font-bold text-slate-800">{electrical?.reactive_power_kvar ?? 0}</td>
                          <td className="px-6 py-2.5 text-xs text-slate-500">kVar</td>
                        </tr>
                        <tr className="hover:bg-slate-50 bg-slate-50/30">
                          <td className="px-6 py-2.5 text-xs text-slate-800 font-medium">Power Factor (Cos Phi)</td>
                          <td className="px-6 py-2.5 text-right font-bold text-slate-800">{electrical?.power_factor ?? 0}</td>
                          <td className="px-6 py-2.5 text-xs text-slate-500">—</td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="px-6 py-2.5 text-xs text-slate-800 font-medium">Today Energy Production</td>
                          <td className="px-6 py-2.5 text-right font-bold text-slate-800">
                            {summary?.today_energy_kwh != null ? summary.today_energy_kwh.toLocaleString('id-ID') : '0'}
                          </td>
                          <td className="px-6 py-2.5 text-xs text-slate-500">kWh</td>
                        </tr>
                      </tbody>
                    </table>
                  </CardContent>
                )}
              </Card>

              {/* Card 2: Mechanical System */}
              <Card className="bg-white border-slate-200 shadow-sm rounded-sm overflow-hidden">
                <div
                  onClick={() => toggleCategory('mechanical')}
                  className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 transition-colors select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-slate-100 text-slate-700">
                      <Settings size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Parameter Mekanikal (Mechanical)</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Putaran turbin, temperatur bearing, generator, turbin, dan level vibrasi
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-semibold text-slate-700 font-mono">
                      {mechanical?.bearing_temp_c ? `${mechanical.bearing_temp_c} °C` : '-'}
                    </span>
                    {expandedCategory === 'mechanical' ? (
                      <ChevronUp size={16} className="text-slate-400" />
                    ) : (
                      <ChevronDown size={16} className="text-slate-400" />
                    )}
                  </div>
                </div>

                {expandedCategory === 'mechanical' && (
                  <CardContent className="p-0 border-t border-slate-100">
                    <table className="w-full text-sm text-left">
                      <thead className="text-[0.65rem] text-slate-500 bg-slate-50/80 font-bold uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-2.5 w-1/2">PARAMETER</th>
                          <th className="px-6 py-2.5 text-right">NILAI</th>
                          <th className="px-6 py-2.5 text-left">SATUAN</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr className="hover:bg-slate-50">
                          <td className="px-6 py-2.5 text-xs text-slate-800 font-medium">Turbine RPM</td>
                          <td className="px-6 py-2.5 text-right font-bold text-slate-800">{mechanical?.rpm ?? 0}</td>
                          <td className="px-6 py-2.5 text-xs text-slate-500">RPM</td>
                        </tr>
                        <tr className="hover:bg-slate-50 bg-slate-50/30">
                          <td className="px-6 py-2.5 text-xs text-slate-800 font-medium">Bearing Temperature</td>
                          <td className="px-6 py-2.5 text-right font-bold text-slate-800">{mechanical?.bearing_temp_c ?? 0}</td>
                          <td className="px-6 py-2.5 text-xs text-slate-500">°C</td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="px-6 py-2.5 text-xs text-slate-800 font-medium">Generator Temperature</td>
                          <td className="px-6 py-2.5 text-right font-bold text-slate-800">{mechanical?.generator_temp_c ?? 0}</td>
                          <td className="px-6 py-2.5 text-xs text-slate-500">°C</td>
                        </tr>
                        <tr className="hover:bg-slate-50 bg-slate-50/30">
                          <td className="px-6 py-2.5 text-xs text-slate-800 font-medium">Turbine Temperature</td>
                          <td className="px-6 py-2.5 text-right font-bold text-slate-800">{mechanical?.turbine_temp_c ?? 0}</td>
                          <td className="px-6 py-2.5 text-xs text-slate-500">°C</td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="px-6 py-2.5 text-xs text-slate-800 font-medium">Vibration Level</td>
                          <td className="px-6 py-2.5 text-right font-bold text-slate-800">
                            {mechanical?.vibration_mm_s ?? mechanical?.vibration_mms ?? 0}
                          </td>
                          <td className="px-6 py-2.5 text-xs text-slate-500">mm/s</td>
                        </tr>
                      </tbody>
                    </table>
                  </CardContent>
                )}
              </Card>

              {/* Card 3: Hydraulic System */}
              <Card className="bg-white border-slate-200 shadow-sm rounded-sm overflow-hidden">
                <div
                  onClick={() => toggleCategory('hydraulic')}
                  className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 transition-colors select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-slate-100 text-cyan-700">
                      <Droplets size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Parameter Hidrolik (Hydraulic)</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Debit aliran air sungai, water level, head efektif, dan tekanan penstock
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-semibold text-slate-700 font-mono">
                      {flow > 0 ? `${flow} m³/s` : '-'}
                    </span>
                    {expandedCategory === 'hydraulic' ? (
                      <ChevronUp size={16} className="text-slate-400" />
                    ) : (
                      <ChevronDown size={16} className="text-slate-400" />
                    )}
                  </div>
                </div>

                {expandedCategory === 'hydraulic' && (
                  <CardContent className="p-0 border-t border-slate-100">
                    <table className="w-full text-sm text-left">
                      <thead className="text-[0.65rem] text-slate-500 bg-slate-50/80 font-bold uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-2.5 w-1/2">PARAMETER</th>
                          <th className="px-6 py-2.5 text-right">NILAI</th>
                          <th className="px-6 py-2.5 text-left">SATUAN</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr className="hover:bg-slate-50">
                          <td className="px-6 py-2.5 text-xs text-slate-800 font-medium">Debit air (Flow Rate)</td>
                          <td className="px-6 py-2.5 text-right font-bold text-slate-800">{flow}</td>
                          <td className="px-6 py-2.5 text-xs text-slate-500">m³/s</td>
                        </tr>
                        <tr className="hover:bg-slate-50 bg-slate-50/30">
                          <td className="px-6 py-2.5 text-xs text-slate-800 font-medium">Water Level</td>
                          <td className="px-6 py-2.5 text-right font-bold text-slate-800">{waterLevel}</td>
                          <td className="px-6 py-2.5 text-xs text-slate-500">m</td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="px-6 py-2.5 text-xs text-slate-800 font-medium">Effective Head</td>
                          <td className="px-6 py-2.5 text-right font-bold text-slate-800">{hydraulic?.head_m ?? 0}</td>
                          <td className="px-6 py-2.5 text-xs text-slate-500">m</td>
                        </tr>
                        <tr className="hover:bg-slate-50 bg-slate-50/30">
                          <td className="px-6 py-2.5 text-xs text-slate-800 font-medium">Penstock Pressure</td>
                          <td className="px-6 py-2.5 text-right font-bold text-slate-800">{hydraulic?.pressure_bar ?? 0}</td>
                          <td className="px-6 py-2.5 text-xs text-slate-500">bar</td>
                        </tr>
                      </tbody>
                    </table>
                  </CardContent>
                )}
              </Card>
            </div>

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
                      <span className="text-sm font-bold text-slate-900 font-mono">
                        {latest?.running_hours != null ? `${latest.running_hours} jam` : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center px-6 py-3 hover:bg-slate-50">
                      <span className="text-sm text-slate-600">Status Unit</span>
                      <span className="text-xs font-bold text-green-700 uppercase">
                        {statusUnit}
                      </span>
                    </div>
                    <div className="flex justify-between items-center px-6 py-3 hover:bg-slate-50">
                      <span className="text-sm text-slate-600">Start / Stop Terakhir</span>
                      <span className="text-xs font-semibold text-slate-700 font-mono">
                        {latest ? `${latest.date} (Shift ${latest.shift})` : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center px-6 py-3 hover:bg-slate-50">
                      <span className="text-sm text-slate-600">Active Incidents</span>
                      <span className="text-xs font-semibold text-slate-700">
                        {summary?.active_incidents_count ?? 0} kejadian aktif
                      </span>
                    </div>
                    <div className="flex justify-between items-center px-6 py-3 hover:bg-slate-50">
                      <span className="text-sm text-slate-600">Active Maintenance</span>
                      <span className="text-xs font-semibold text-slate-700">
                        {summary?.active_maintenance_count ?? 0} pemeliharaan aktif
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Catatan Operasional */}
              <Card className="bg-white border-slate-200 shadow-sm rounded-sm">
                <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                  <CardTitle className="text-base text-slate-800 font-bold">Catatan Operasional & Log</CardTitle>
                  <p className="text-[0.65rem] font-bold text-slate-500 tracking-widest uppercase">CATATAN OPERATOR</p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="bg-slate-50 border border-slate-200 rounded p-4">
                    <p className="text-xs font-bold text-slate-700 mb-2">Catatan Shift Terakhir:</p>
                    <p className="text-sm text-slate-600 italic">
                      "{latest?.notes || 'Belum ada catatan logbook yang tersimpan di database.'}"
                    </p>
                  </div>
                  <div className="mt-4 text-xs text-slate-500 space-y-1">
                    <p>• Frekuensi logging: Setiap 1 jam oleh operator shift</p>
                    <p>• Standar operasional: Manual book PLTMH & SOP K3 Kelistrikan</p>
                  </div>
                </CardContent>
              </Card>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default UnitCondition;
