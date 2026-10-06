import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { Download, Filter, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { logbookApi, LogbookItem, ShiftType } from '../api/logbook.api';
import { unitApi, UnitItem } from '../api/unit.api';
import { exportApi } from '../api/export.api';

const HistoryOperasi: React.FC = () => {
  const [units, setUnits] = useState<UnitItem[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<number | undefined>(undefined);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState<string>('ALL');
  const [operatorFilter, setOperatorFilter] = useState<string>('ALL');

  const [dbEntries, setDbEntries] = useState<LogbookItem[]>([]);
  const [selectedDbEntry, setSelectedDbEntry] = useState<LogbookItem | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Ambil daftar unit
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

  // Ambil logbook
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const shiftParam = (shift === 'ALL' ? undefined : (shift as ShiftType));
      const res = await logbookApi.list({
        unit_id: selectedUnitId,
        from: date,
        to: date,
        shift: shiftParam
      });

      if (res && res.data && res.data.length > 0) {
        setDbEntries(res.data);
        setSelectedDbEntry(res.data[0]);
      } else {
        setDbEntries([]);
        setSelectedDbEntry(null);
      }
    } catch (err) {
      console.error('Gagal mengambil entri logbook:', err);
      setDbEntries([]);
      setSelectedDbEntry(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUnitId !== undefined) {
      fetchLogs();
    }
  }, [selectedUnitId]);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const shiftParam = (shift === 'ALL' ? undefined : (shift as ShiftType));
      await exportApi.downloadLogbook({
        unit_id: selectedUnitId,
        from: date,
        to: date,
        shift: shiftParam,
        format: 'csv'
      });
    } catch (err) {
      console.error('Gagal ekspor logbook:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const hasDbData = dbEntries.length > 0;
  const filteredDbEntries = operatorFilter === 'ALL'
    ? dbEntries
    : dbEntries.filter((e) => e.operator?.full_name?.toLowerCase().includes(operatorFilter.toLowerCase()));

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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Histori Operasi (Logbook Harian)</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">Riwayat pencatatan operasi unit berdasarkan logsheet operator.</p>
              </div>
              <Button
                type="button"
                onClick={fetchLogs}
                disabled={loading}
                className="w-auto h-8 text-xs bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 px-3"
              >
                <RefreshCw size={14} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
            </div>

            {/* Filter Section */}
            <Card className="bg-slate-50 border-slate-200 shadow-sm rounded-sm">
              <CardContent className="p-4">
                <form onSubmit={handleFilter} className="flex flex-wrap gap-4 items-end justify-between">
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <label className="text-[0.65rem] font-bold text-slate-500 tracking-widest uppercase">UNIT:</label>
                      <select
                        value={selectedUnitId ?? ''}
                        onChange={(e) => setSelectedUnitId(e.target.value ? Number(e.target.value) : undefined)}
                        className="h-8 text-sm border-slate-200 rounded bg-white text-slate-700 font-semibold px-2 outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {units.length > 0 ? (
                          units.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name}
                            </option>
                          ))
                        ) : (
                          <option value="">PLTMH Unit 1 — 500 kW</option>
                        )}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-[0.65rem] font-bold text-slate-500 tracking-widest uppercase">TANGGAL:</label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="h-8 text-sm border-slate-200 rounded bg-white text-slate-700 px-2 outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-[0.65rem] font-bold text-slate-500 tracking-widest uppercase">SHIFT:</label>
                      <select
                        value={shift}
                        onChange={(e) => setShift(e.target.value)}
                        className="h-8 text-sm border-slate-200 rounded bg-white text-slate-700 px-2 outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="ALL">Semua Shift</option>
                        <option value="PAGI">Shift Pagi (07:00–15:00)</option>
                        <option value="SIANG">Shift Siang (15:00–23:00)</option>
                        <option value="MALAM">Shift Malam (23:00–07:00)</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-[0.65rem] font-bold text-slate-500 tracking-widest uppercase">OPERATOR:</label>
                      <select
                        value={operatorFilter}
                        onChange={(e) => setOperatorFilter(e.target.value)}
                        className="h-8 text-sm border-slate-200 rounded bg-white text-slate-700 px-2 outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="ALL">Semua Operator</option>
                        <option value="Pratama">Pratama</option>
                        <option value="Rian">Rian</option>
                        <option value="Operator">Operator Lain</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-2 md:mt-0 w-full lg:w-auto ml-auto">
                    <Button
                      type="button"
                      onClick={handleExport}
                      disabled={isExporting}
                      className="text-xs h-8 bg-white hover:bg-slate-50 text-slate-600 border border-slate-300 w-fit px-3 whitespace-nowrap"
                    >
                      <Download size={14} className="mr-2" />
                      {isExporting ? 'Mengunduh...' : 'Ekspor CSV'}
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="text-xs h-8 bg-[#0F172A] hover:bg-slate-800 text-white border-none w-fit px-3 whitespace-nowrap"
                    >
                      <Filter size={14} className="mr-2" />
                      Terapkan Filter
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Info Bar */}
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-semibold text-slate-600">
                {filteredDbEntries.length} entri tercatat · Shift {shift} · Tanggal {date}
              </p>
              {loading && <p className="text-xs text-blue-600 font-medium animate-pulse">Memuat data dari database...</p>}
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
                    {hasDbData ? (
                      filteredDbEntries.map((row) => {
                        const isSelected = selectedDbEntry?.id === row.id;
                        const el = row.params_electrical;
                        const hy = row.params_hydraulic;
                        const me = row.params_mechanical;
                        return (
                          <tr
                            key={row.id}
                            onClick={() => setSelectedDbEntry(row)}
                            className={`cursor-pointer transition-colors ${
                              isSelected ? 'bg-blue-50/50' : 'bg-white hover:bg-slate-50'
                            }`}
                          >
                            <td className={`px-4 py-3 border-l-2 ${isSelected ? 'border-blue-500 font-bold text-slate-900' : 'border-transparent font-medium text-slate-700'}`}>
                              {row.created_at ? new Date(row.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`text-xs font-bold uppercase ${
                                  row.unit_status === 'RUNNING'
                                    ? 'text-green-700'
                                    : 'text-amber-700'
                                }`}
                              >
                                {row.unit_status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-slate-900">{el?.active_power_kw != null ? `${el.active_power_kw} kW` : '-'}</td>
                            <td className="px-4 py-3 text-right text-slate-700">{el?.voltage_v != null ? `${el.voltage_v} V` : '-'}</td>
                            <td className="px-4 py-3 text-right text-slate-700">{el?.frequency_hz != null ? `${el.frequency_hz} Hz` : '-'}</td>
                            <td className="px-4 py-3 text-right text-slate-700">{hy?.water_flow_m3_s != null ? `${hy.water_flow_m3_s} m³/s` : '-'}</td>
                            <td className="px-4 py-3 text-right text-slate-700">{hy?.water_level_m != null ? `${hy.water_level_m} m` : '-'}</td>
                            <td className="px-4 py-3 text-right text-slate-700">{me?.bearing_temp_c != null ? `${me.bearing_temp_c} °C` : '-'}</td>
                            <td className="px-4 py-3 font-semibold text-slate-700">{row.operator?.full_name || 'Operator'}</td>
                            <td className="px-4 py-3 text-slate-500 truncate max-w-[200px]">{row.notes || 'Operasi normal'}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={10} className="px-4 py-12 text-center text-slate-400">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <p className="text-sm font-semibold text-slate-600">Tidak ada entri logbook untuk filter ini</p>
                            <p className="text-xs text-slate-400">Belum ada pencatatan operasional di database untuk tanggal {date}.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="bg-slate-100/50 px-4 py-3 flex justify-between items-center border-t border-slate-200">
                <p className="text-xs text-slate-500">Batas nominal voltage: 380–415 V · Toleransi frequency: 49,8–50,2 Hz · Maks. suhu bearing: &lt; 65 °C</p>
                <p className="text-xs font-bold text-blue-600">PLTMH Unit 1 • Logsheet Valid</p>
              </div>
            </Card>

            {/* Detail Section */}
            {selectedDbEntry && (
              <Card className="bg-slate-50 border-slate-200 shadow-sm rounded-sm mt-6">
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-center gap-2 mb-4 border-b border-slate-200 pb-3">
                    <h3 className="text-base font-bold text-slate-800">
                      Detail Log Operasi — Jam {selectedDbEntry.created_at ? new Date(selectedDbEntry.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'} WIB
                    </h3>
                    <span className="text-slate-400">·</span>
                    <p className="text-sm text-slate-600">
                      Operator: {selectedDbEntry.operator?.full_name || 'Operator'}
                    </p>
                    <span className="text-slate-400">·</span>
                    <span className="text-xs font-bold uppercase text-green-700">
                      {selectedDbEntry.unit_status}
                    </span>
                    <span className="text-slate-400">·</span>
                    <p className="text-sm text-slate-500 italic">
                      Catatan: "{selectedDbEntry.notes || 'Operasi normal tanpa kendala'}"
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Electrical */}
                    <div className="bg-white border border-slate-200 rounded p-4">
                      <p className="text-[0.65rem] font-bold text-blue-600 tracking-widest uppercase mb-3 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> ELECTRICAL
                      </p>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Voltage:</span>
                          <span className="font-bold text-slate-800">{selectedDbEntry.params_electrical?.voltage_v != null ? `${selectedDbEntry.params_electrical.voltage_v} V` : '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Current:</span>
                          <span className="font-bold text-slate-800">{selectedDbEntry.params_electrical?.current_a != null ? `${selectedDbEntry.params_electrical.current_a} A` : '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Frequency:</span>
                          <span className="font-bold text-slate-800">{selectedDbEntry.params_electrical?.frequency_hz != null ? `${selectedDbEntry.params_electrical.frequency_hz} Hz` : '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Active Power:</span>
                          <span className="font-bold text-slate-800">{selectedDbEntry.params_electrical?.active_power_kw != null ? `${selectedDbEntry.params_electrical.active_power_kw} kW` : '-'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Mechanical */}
                    <div className="bg-white border border-slate-200 rounded p-4">
                      <p className="text-[0.65rem] font-bold text-blue-600 tracking-widest uppercase mb-3 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> MECHANICAL
                      </p>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Bearing Temp:</span>
                          <span className="font-bold text-slate-800">{selectedDbEntry.params_mechanical?.bearing_temp_c != null ? `${selectedDbEntry.params_mechanical.bearing_temp_c} °C` : '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Winding Temp:</span>
                          <span className="font-bold text-slate-800">{selectedDbEntry.params_mechanical?.winding_temp_c != null ? `${selectedDbEntry.params_mechanical.winding_temp_c} °C` : '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Vibration:</span>
                          <span className="font-bold text-slate-800">{selectedDbEntry.params_mechanical?.vibration_mm_s != null ? `${selectedDbEntry.params_mechanical.vibration_mm_s} mm/s` : '-'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Hydrology */}
                    <div className="bg-white border border-slate-200 rounded p-4">
                      <p className="text-[0.65rem] font-bold text-blue-600 tracking-widest uppercase mb-3 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> HYDROLOGY
                      </p>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Water Flow:</span>
                          <span className="font-bold text-slate-800">{selectedDbEntry.params_hydraulic?.water_flow_m3_s != null ? `${selectedDbEntry.params_hydraulic.water_flow_m3_s} m³/s` : '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Water Level:</span>
                          <span className="font-bold text-slate-800">{selectedDbEntry.params_hydraulic?.water_level_m != null ? `${selectedDbEntry.params_hydraulic.water_level_m} m` : '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Intake Condition:</span>
                          <span className="font-bold text-slate-700">{(selectedDbEntry.params_hydraulic as any)?.intake_condition || 'Normal'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Operational */}
                    <div className="bg-white border border-slate-200 rounded p-4">
                      <p className="text-[0.65rem] font-bold text-blue-600 tracking-widest uppercase mb-3 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> OPERATIONAL
                      </p>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Running Hours:</span>
                          <span className="font-bold text-slate-800">{selectedDbEntry.running_hours != null ? `${selectedDbEntry.running_hours} jam` : '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Trip Proteksi:</span>
                          <span className="font-bold text-emerald-600">Nihil</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Status Operasi:</span>
                          <span className="font-bold text-slate-800">{selectedDbEntry.unit_status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default HistoryOperasi;
