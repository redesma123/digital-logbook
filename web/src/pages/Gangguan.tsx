import { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Filter,
  Search,
  Eye,
  X,
  History,
  Camera,
  ChevronRight,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';

export type IncidentStatus = 'OPEN' | 'PROCESS' | 'CLOSED';

export interface StatusHistory {
  id: number;
  from_status: IncidentStatus | null;
  to_status: IncidentStatus;
  changed_by: string;
  role: 'OPERATOR' | 'SUPERVISOR';
  changed_at: string;
  notes: string;
}

export interface Incident {
  id: number;
  code: string;
  unit_id: number;
  unit_name: string;
  equipment: string;
  incident_type: string;
  description: string;
  operator_action: string;
  status: IncidentStatus;
  occurred_at: string;
  resolved_at: string | null;
  reported_by: string;
  has_attachment: boolean;
  attachment_name?: string;
  attachment_size?: string;
  histories: StatusHistory[];
}

const initialIncidents: Incident[] = [
  {
    id: 1,
    code: 'INC-2026-001',
    unit_id: 1,
    unit_name: 'Unit 1 (PLTMH)',
    equipment: 'Turbine Runner & Shaft',
    incident_type: 'Vibrasi Tinggi (> 18 mm/s)',
    description: 'Terjadi anomali getaran mekanis pada shaft turbin saat beban dinaikkan di atas 1.200 kW. Indikasi resonansi atau kavitasi pada sudu turbin.',
    operator_action: 'Beban generator segera diturunkan ke 800 kW, membuka bypass aliran air, dan memantau temperatur bearing.',
    status: 'OPEN',
    occurred_at: '2026-10-02 08:30',
    resolved_at: null,
    reported_by: 'Budi Santoso (Operator)',
    has_attachment: true,
    attachment_name: 'vibrasi_shaft_sensor_log.jpg',
    attachment_size: '1.4 MB',
    histories: [
      {
        id: 1,
        from_status: null,
        to_status: 'OPEN',
        changed_by: 'Budi Santoso',
        role: 'OPERATOR',
        changed_at: '2026-10-02 08:35',
        notes: 'Laporan insiden dibuat pertama kali setelah alarm getaran menyala.'
      }
    ]
  },
  {
    id: 2,
    code: 'INC-2026-002',
    unit_id: 1,
    unit_name: 'Unit 1 (PLTMH)',
    equipment: 'Generator Thrust Bearing',
    incident_type: 'Overheat Bearing Temp (86°C)',
    description: 'Suhu bearing thrust generator meningkat perlahan melampaui batas aman (normal maks 75°C). Sirkulasi oli pendingin terindikasi mengalami penurunan laju aliran.',
    operator_action: 'Pembersihan strainer oil filter jalur sirkulasi oli dan penambahan pelumas darurat.',
    status: 'PROCESS',
    occurred_at: '2026-10-01 14:15',
    resolved_at: null,
    reported_by: 'Ahmad Hidayat (Operator)',
    has_attachment: true,
    attachment_name: 'kondisi_oil_filter.jpg',
    attachment_size: '2.1 MB',
    histories: [
      {
        id: 2,
        from_status: null,
        to_status: 'OPEN',
        changed_by: 'Ahmad Hidayat',
        role: 'OPERATOR',
        changed_at: '2026-10-01 14:20',
        notes: 'Alarm sensor suhu bearing berbunyi saat shift siang.'
      },
      {
        id: 3,
        from_status: 'OPEN',
        to_status: 'PROCESS',
        changed_by: 'Ahmad Hidayat',
        role: 'OPERATOR',
        changed_at: '2026-10-01 14:45',
        notes: 'Tim operator mulai pembersihan filter strainer dan pemantauan termal kontinu.'
      }
    ]
  },
  {
    id: 3,
    code: 'INC-2026-003',
    unit_id: 2,
    unit_name: 'Unit 2 (PLTMH)',
    equipment: 'Exciter & Automatic Voltage Regulator (AVR)',
    incident_type: 'Fluktuasi Tegangan Terminal (360V - 425V)',
    description: 'Tegangan terminal generator tidak stabil saat peralihan beban jaringan PLN. Respon AVR lambat dan memicu warning proteksi over/under voltage.',
    operator_action: 'Alihkan mode eksitasi ke manual potentiometer, lakukan kalibrasi sensing resistor dan pengencangan terminal kabel proteksi.',
    status: 'CLOSED',
    occurred_at: '2026-09-29 19:10',
    resolved_at: '2026-09-30 11:30',
    reported_by: 'Siti Rahma (Operator)',
    has_attachment: true,
    attachment_name: 'avr_sensing_module.png',
    attachment_size: '890 KB',
    histories: [
      {
        id: 4,
        from_status: null,
        to_status: 'OPEN',
        changed_by: 'Siti Rahma',
        role: 'OPERATOR',
        changed_at: '2026-09-29 19:15',
        notes: 'Tegangan berosilasi pada shift malam.'
      },
      {
        id: 5,
        from_status: 'OPEN',
        to_status: 'PROCESS',
        changed_by: 'Hendra Wijaya',
        role: 'SUPERVISOR',
        changed_at: '2026-09-30 08:00',
        notes: 'Penanganan tim teknisi elektrikal untuk penggantian modul sensing AVR.'
      },
      {
        id: 6,
        from_status: 'PROCESS',
        to_status: 'CLOSED',
        changed_by: 'Hendra Wijaya',
        role: 'SUPERVISOR',
        changed_at: '2026-09-30 11:30',
        notes: 'Modul sensing diganti baru, uji tegangan stabil di 398V beban penuh. Unit kembali normal.'
      }
    ]
  },
  {
    id: 4,
    code: 'INC-2026-004',
    unit_id: 2,
    unit_name: 'Unit 2 (PLTMH)',
    equipment: 'Main Inlet Valve (MIV)',
    incident_type: 'Kebocoran Oli Hidrolik Tekanan Tinggi',
    description: 'Ditemukan rembesan oli hidrolik pada sambungan selang actuating cylinder MIV saat proses sinkronisasi unit.',
    operator_action: 'Isolasi saluran pipa hidrolik, menempatkan oil drip tray penampung, dan mempersiapkan seal cadangan.',
    status: 'CLOSED',
    occurred_at: '2026-09-26 10:00',
    resolved_at: '2026-09-27 15:00',
    reported_by: 'Budi Santoso (Operator)',
    has_attachment: false,
    histories: [
      {
        id: 7,
        from_status: null,
        to_status: 'OPEN',
        changed_by: 'Budi Santoso',
        role: 'OPERATOR',
        changed_at: '2026-09-26 10:05',
        notes: 'Rembesan terdeteksi saat inspeksi visual shift pagi.'
      },
      {
        id: 8,
        from_status: 'OPEN',
        to_status: 'PROCESS',
        changed_by: 'Hendra Wijaya',
        role: 'SUPERVISOR',
        changed_at: '2026-09-26 11:30',
        notes: 'Pemberian instruksi ganti seal O-ring hidrolik.'
      },
      {
        id: 9,
        from_status: 'PROCESS',
        to_status: 'CLOSED',
        changed_by: 'Hendra Wijaya',
        role: 'SUPERVISOR',
        changed_at: '2026-09-27 15:00',
        notes: 'O-ring baru terpasang, tekanan hidrolik 120 bar tidak ada kebocoran.'
      }
    ]
  }
];

const Gangguan = () => {
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [selectedUnit, setSelectedUnit] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Simulasi peran pengguna saat ini (untuk menguji batas hak akses sesuai aturan)
  const currentRole: 'SUPERVISOR' | 'OPERATOR'= 'SUPERVISOR';

  // Modal State
  const [detailIncident, setDetailIncident] = useState<Incident | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [statusNote, setStatusNote] = useState<string>('');

  // Form State Lapor Gangguan Baru
  const [formUnit, setFormUnit] = useState<number>(1);
  const [formEquipment, setFormEquipment] = useState<string>('');
  const [formIncidentType, setFormIncidentType] = useState<string>('');
  const [formOccurredAt, setFormOccurredAt] = useState<string>('2026-10-02 10:00');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formOperatorAction, setFormOperatorAction] = useState<string>('');
  const [formAttachmentName, setFormAttachmentName] = useState<string>('');

  // Filtered Data
  const filteredIncidents = incidents.filter((item) => {
    if (selectedUnit !== 'ALL' && item.unit_id.toString() !== selectedUnit) {
      return false;
    }
    if (selectedStatus !== 'ALL' && item.status !== selectedStatus) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const match =
        item.code.toLowerCase().includes(q) ||
        item.equipment.toLowerCase().includes(q) ||
        item.incident_type.toLowerCase().includes(q) ||
        item.reported_by.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // KPI Counts
  const totalCount = incidents.length;
  const openCount = incidents.filter((i) => i.status === 'OPEN').length;
  const processCount = incidents.filter((i) => i.status === 'PROCESS').length;
  const closedCount = incidents.filter((i) => i.status === 'CLOSED').length;

  // Handle Form Submission
  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEquipment || !formIncidentType || !formDescription) {
      alert('Mohon lengkapi bagian peralatan, jenis gangguan, dan deskripsi kejadian.');
      return;
    }

    const newId = incidents.length + 1;
    const newCode = `INC-2026-${String(newId).padStart(3, '0')}`;
    const newIncident: Incident = {
      id: newId,
      code: newCode,
      unit_id: formUnit,
      unit_name: formUnit === 1 ? 'Unit 1 (PLTMH)' : 'Unit 2 (PLTMH)',
      equipment: formEquipment,
      incident_type: formIncidentType,
      description: formDescription,
      operator_action: formOperatorAction || 'Belum ada tindakan awal',
      status: 'OPEN',
      occurred_at: formOccurredAt,
      resolved_at: null,
      reported_by: currentRole === 'SUPERVISOR' ? 'Hendra Wijaya (Supervisor)' : 'Budi Santoso (Operator)',
      has_attachment: !!formAttachmentName,
      attachment_name: formAttachmentName || undefined,
      attachment_size: formAttachmentName ? '1.2 MB' : undefined,
      histories: [
        {
          id: Date.now(),
          from_status: null,
          to_status: 'OPEN',
          changed_by: currentRole === 'SUPERVISOR' ? 'Hendra Wijaya' : 'Budi Santoso',
          role: currentRole,
          changed_at: new Date().toISOString().slice(0, 16).replace('T', ' '),
          notes: 'Laporan gangguan baru dibuat.'
        }
      ]
    };

    setIncidents([newIncident, ...incidents]);
    setIsCreateOpen(false);
    // Reset Form
    setFormEquipment('');
    setFormIncidentType('');
    setFormDescription('');
    setFormOperatorAction('');
    setFormAttachmentName('');
  };

  // Status Change Logic adhering strictly to RULES.md
  // OPEN -> PROCESS (Operator / Supervisor)
  // PROCESS -> CLOSED (Supervisor only)
  // CLOSED -> PROCESS (Supervisor only with notes)
  const handleUpdateStatus = (targetStatus: IncidentStatus) => {
    if (!detailIncident) return;

    if (targetStatus === 'CLOSED' && currentRole !== 'SUPERVISOR') {
      alert('Perhatian: Status gangguan hanya dapat diselesaikan (CLOSED) oleh Supervisor.');
      return;
    }

    if (detailIncident.status === 'CLOSED' && targetStatus === 'PROCESS' && currentRole !== 'SUPERVISOR') {
      alert('Perhatian: Hanya Supervisor yang dapat membuka kembali (Reopen) gangguan yang telah ditutup.');
      return;
    }

    if (!statusNote.trim()) {
      alert('Wajib mengisi catatan/alasan perubahan status sesuai aturan audit trail.');
      return;
    }

    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const newHistory: StatusHistory = {
      id: Date.now(),
      from_status: detailIncident.status,
      to_status: targetStatus,
      changed_by: currentRole === 'SUPERVISOR' ? 'Hendra Wijaya' : 'Budi Santoso',
      role: currentRole,
      changed_at: now,
      notes: statusNote
    };

    const updated: Incident = {
      ...detailIncident,
      status: targetStatus,
      resolved_at: targetStatus === 'CLOSED' ? now : null,
      histories: [...detailIncident.histories, newHistory]
    };

    setIncidents(incidents.map((i) => (i.id === updated.id ? updated : i)));
    setDetailIncident(updated);
    setStatusNote('');
  };

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 animate-pulse"></span>
            OPEN
          </span>
        );
      case 'PROCESS':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
            PROCESS
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} className="mr-1 text-emerald-600" />
            CLOSED
          </span>
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#F1F5F9] text-slate-800 font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-[1400px] mx-auto space-y-5">
            {/* Top Bar / Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Laporan Gangguan Unit (Incidents)</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">
                  Monitoring insiden peralatan, tindakan penanganan darurat, dan pelacakan alur penyelesaian (OPEN &rarr; PROCESS &rarr; CLOSED).
                </p>
              </div>

              {/* Action Buttons & Role Selector Simulation */}
              <div className="flex items-center flex-wrap gap-2.5">
                <Button
                  onClick={() => alert('Fitur ekspor rekapan data gangguan ke CSV/Excel.')}
                  className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs h-9 px-3 shadow-sm rounded flex items-center"
                >
                  <FileSpreadsheet size={15} className="mr-1.5 text-emerald-600" />
                  Ekspor CSV
                </Button>
              </div>
            </div>

            {/* KPI Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white border-slate-200 shadow-sm rounded-md p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest">Total Gangguan Terdata</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{totalCount}</p>
                    <span className="text-[0.7rem] text-slate-400 font-medium">Rekapitulasi seluruh unit</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    <AlertTriangle size={20} />
                  </div>
                </div>
              </Card>

              <Card className="bg-white border-rose-200 shadow-sm rounded-md p-4 bg-gradient-to-br from-white to-rose-50/40">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[0.65rem] font-bold text-rose-600 uppercase tracking-widest">Status: OPEN (Perlu Tindakan)</p>
                    <p className="text-2xl font-black text-rose-700 mt-1">{openCount}</p>
                    <span className="text-[0.7rem] text-rose-600/80 font-medium">Menunggu respon/investigasi</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                    <Clock size={20} />
                  </div>
                </div>
              </Card>

              <Card className="bg-white border-amber-200 shadow-sm rounded-md p-4 bg-gradient-to-br from-white to-amber-50/40">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[0.65rem] font-bold text-amber-600 uppercase tracking-widest">Status: PROCESS (Sedang Ditangani)</p>
                    <p className="text-2xl font-black text-amber-700 mt-1">{processCount}</p>
                    <span className="text-[0.7rem] text-amber-600/80 font-medium">Proses perbaikan aktif</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                    <RefreshCw size={20} />
                  </div>
                </div>
              </Card>

              <Card className="bg-white border-emerald-200 shadow-sm rounded-md p-4 bg-gradient-to-br from-white to-emerald-50/40">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[0.65rem] font-bold text-emerald-600 uppercase tracking-widest">Status: CLOSED (Selesai)</p>
                    <p className="text-2xl font-black text-emerald-700 mt-1">{closedCount}</p>
                    <span className="text-[0.7rem] text-emerald-600/80 font-medium">Telah diverifikasi supervisor</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 size={20} />
                  </div>
                </div>
              </Card>
            </div>

            {/* Filter Section */}
            <Card className="bg-slate-50 border-slate-200 shadow-sm rounded-sm">
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4 items-end justify-between">
                  <div className="flex flex-wrap gap-3 items-center">
                    {/* Unit Select */}
                    <div className="flex items-center gap-2">
                      <label className="text-[0.65rem] font-bold text-slate-500 tracking-widest uppercase">UNIT:</label>
                      <select
                        value={selectedUnit}
                        onChange={(e) => setSelectedUnit(e.target.value)}
                        className="h-8 text-xs border border-slate-200 rounded bg-white text-slate-700 font-semibold px-2.5 outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="ALL">Semua Unit</option>
                        <option value="1">Unit 1</option>
                        <option value="2">Unit 2</option>
                      </select>
                    </div>

                    {/* Status Select */}
                    <div className="flex items-center gap-2">
                      <label className="text-[0.65rem] font-bold text-slate-500 tracking-widest uppercase">STATUS:</label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="h-8 text-xs border border-slate-200 rounded bg-white text-slate-700 font-semibold px-2.5 outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="ALL">Semua Status</option>
                        <option value="OPEN">OPEN (Belum Ditangani)</option>
                        <option value="PROCESS">PROCESS (Sedang Ditangani)</option>
                        <option value="CLOSED">CLOSED (Telah Selesai)</option>
                      </select>
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                      <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cari peralatan, kode, atau masalah..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 pl-8 pr-3 text-xs border border-slate-200 rounded bg-white text-slate-700 font-medium placeholder-slate-400 w-56 md:w-64 outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Reset Filter Button */}
                  {(selectedUnit !== 'ALL' || selectedStatus !== 'ALL' || searchQuery !== '') && (
                    <Button
                      onClick={() => {
                        setSelectedUnit('ALL');
                        setSelectedStatus('ALL');
                        setSearchQuery('');
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

            {/* Incidents Table */}
            <Card className="bg-white border-slate-200 shadow-sm rounded-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[0.65rem] text-slate-600 bg-slate-100/90 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">No / ID Insiden</th>
                      <th className="py-3 px-4">Waktu Kejadian</th>
                      <th className="py-3 px-4">Unit PLTMH</th>
                      <th className="py-3 px-4">Peralatan Terdampak</th>
                      <th className="py-3 px-4">Jenis Gangguan</th>
                      <th className="py-3 px-4">Pelapor</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredIncidents.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-10 text-center text-slate-400 text-sm">
                          Tidak ada data gangguan yang sesuai dengan filter pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredIncidents.map((incident) => (
                        <tr key={incident.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-xs text-slate-900">
                            {incident.code}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-600 font-medium">
                            {incident.occurred_at}
                          </td>
                          <td className="py-3.5 px-4 text-xs font-semibold text-slate-800">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              {incident.unit_name}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs font-bold text-slate-900">
                            {incident.equipment}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-700">
                            <span className="font-medium text-slate-900">{incident.incident_type}</span>
                            {incident.has_attachment && (
                              <span className="ml-2 inline-flex items-center text-[0.65rem] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                <Camera size={10} className="mr-0.5" /> Foto
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-600">
                            {incident.reported_by}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {getStatusBadge(incident.status)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <Button
                              onClick={() => {
                                setDetailIncident(incident);
                                setStatusNote('');
                              }}
                              className="text-xs h-7 px-3 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded shadow-none inline-flex items-center"
                            >
                              <Eye size={13} className="mr-1 text-slate-500" />
                              Detail & Alur
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

      {/* MODAL: DETAIL GANGGUAN & ALUR STATUS */}
      {detailIncident && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-sm bg-slate-200 px-2 py-0.5 rounded text-slate-800">
                  {detailIncident.code}
                </span>
                <h3 className="font-bold text-slate-900 text-base">{detailIncident.equipment}</h3>
                {getStatusBadge(detailIncident.status)}
              </div>
              <button
                onClick={() => setDetailIncident(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Grid Ringkasan Insiden */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-md border border-slate-200">
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[0.65rem]">Unit PLTMH</span>
                  <span className="font-bold text-slate-800 text-sm">{detailIncident.unit_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[0.65rem]">Waktu Kejadian</span>
                  <span className="font-semibold text-slate-700">{detailIncident.occurred_at} WIB</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[0.65rem]">Jenis Gangguan</span>
                  <span className="font-bold text-rose-700">{detailIncident.incident_type}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[0.65rem]">Pelapor</span>
                  <span className="font-semibold text-slate-700">{detailIncident.reported_by}</span>
                </div>
              </div>

              {/* Deskripsi Masalah */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">Deskripsi Kronologi Kejadian:</h4>
                <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs leading-relaxed text-slate-700 font-medium">
                  {detailIncident.description}
                </div>
              </div>

              {/* Tindakan Awal Operator */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">Tindakan Sementara Operator:</h4>
                <div className="p-3 bg-amber-50/60 rounded border border-amber-200 text-xs leading-relaxed text-amber-900 font-medium">
                  {detailIncident.operator_action}
                </div>
              </div>

              {/* Lampiran Foto (Mock Attachment sesuai skema) */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">Lampiran Foto Bukti Lapangan:</h4>
                {detailIncident.has_attachment ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                        <Camera size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{detailIncident.attachment_name}</p>
                        <p className="text-[0.65rem] text-slate-500 font-medium">
                          Ukuran: {detailIncident.attachment_size} • Format valid (JPEG/PNG/WebP) • Pengecualian retensi selama aktif
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                      Tersedia
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded text-xs text-slate-400 italic">
                    Tidak ada lampiran foto yang diunggah saat pelaporan insiden ini.
                  </div>
                )}
              </div>

              {/* ALUR PERUBAHAN STATUS (RULES.md COMPLIANCE) */}
              <div className="border-t border-slate-200 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
                    <RefreshCw size={14} className="mr-1.5 text-blue-600" />
                    Alur Perubahan Status (Workflow)
                  </h4>
                  <span className="text-[0.7rem] font-semibold text-slate-500">
                    Mode Akses Saat Ini: <span className="text-blue-700 font-bold">{currentRole}</span>
                  </span>
                </div>

                <div className="bg-blue-50/50 border border-blue-200 rounded p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <span>Status Saat Ini:</span>
                    {getStatusBadge(detailIncident.status)}
                    <ChevronRight size={14} className="text-slate-400 mx-1" />
                    <span className="text-slate-500 font-normal">Pilih langkah transisi berikut:</span>
                  </div>

                  {/* Input Catatan Perubahan (Audit Trail Note) */}
                  <div>
                    <label className="text-[0.7rem] font-bold text-slate-600 block mb-1">
                      Catatan / Alasan Perubahan Status (Wajib untuk Audit Trail):
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Tim mekanik mulai membongkar casing / Pekerjaan perbaikan selesai diuji beban..."
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      className="w-full h-8 px-3 text-xs border border-slate-300 rounded bg-white text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Tombol Transisi Alur */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {detailIncident.status === 'OPEN' && (
                      <Button
                        onClick={() => handleUpdateStatus('PROCESS')}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold h-8 px-4 rounded shadow-sm"
                      >
                        Mulai Tangani &rarr; Ubah ke PROCESS
                      </Button>
                    )}

                    {detailIncident.status === 'PROCESS' && (
                      <Button
                        onClick={() => handleUpdateStatus('CLOSED')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold h-8 px-4 rounded shadow-sm"
                      >
                        Selesaikan Gangguan &rarr; Ubah ke CLOSED
                      </Button>
                    )}

                    {detailIncident.status === 'CLOSED' && (
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-emerald-800 font-medium bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                          Gangguan ini telah berstatus CLOSED (Selesai pada {detailIncident.resolved_at} WIB).
                        </span>
                        {currentRole === 'SUPERVISOR' && (
                          <Button
                            onClick={() => handleUpdateStatus('PROCESS')}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold h-8 px-3 rounded"
                          >
                            Buka Kembali (Reopen ke PROCESS)
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* AUDIT TRAIL / RIWAYAT PERUBAHAN STATUS */}
              <div className="border-t border-slate-200 pt-5">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center">
                  <History size={14} className="mr-1.5 text-slate-600" />
                  Rekam Jejak Status (Audit Trail)
                </h4>
                <div className="space-y-3">
                  {detailIncident.histories.map((hist, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs bg-slate-50 p-3 rounded border border-slate-200">
                      <div className="mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">
                            {hist.from_status ? `${hist.from_status} → ${hist.to_status}` : `Status Awal: ${hist.to_status}`}
                          </span>
                          <span className="text-[0.65rem] text-slate-400 font-medium">{hist.changed_at}</span>
                        </div>
                        <p className="text-slate-600 mt-0.5 text-xs">{hist.notes}</p>
                        <p className="text-[0.65rem] text-slate-400 mt-1">
                          Oleh: <span className="font-semibold text-slate-600">{hist.changed_by}</span> ({hist.role})
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <Button
                onClick={() => setDetailIncident(null)}
                className="text-xs h-8 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-4 rounded"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LAPOR GANGGUAN BARU */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-rose-600" />
                <h3 className="font-bold text-slate-900 text-base">Input Laporan Gangguan Baru</h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateIncident}>
              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
                {/* Unit & Waktu */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Unit PLTMH Terdampak *</label>
                    <select
                      value={formUnit}
                      onChange={(e) => setFormUnit(Number(e.target.value))}
                      className="w-full h-8 px-2 border border-slate-300 rounded bg-white text-slate-800 font-semibold outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value={1}>Unit 1 (PLTMH)</option>
                      <option value={2}>Unit 2 (PLTMH)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Waktu Kejadian *</label>
                    <input
                      type="text"
                      value={formOccurredAt}
                      onChange={(e) => setFormOccurredAt(e.target.value)}
                      placeholder="YYYY-MM-DD HH:mm"
                      className="w-full h-8 px-3 border border-slate-300 rounded bg-white text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Peralatan & Jenis Gangguan */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bagian Peralatan Terdampak *</label>
                  <input
                    type="text"
                    value={formEquipment}
                    onChange={(e) => setFormEquipment(e.target.value)}
                    placeholder="Contoh: Turbine Runner, Exciter AVR, Bearing Generator..."
                    className="w-full h-8 px-3 border border-slate-300 rounded bg-white text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Klasifikasi Jenis Gangguan *</label>
                  <input
                    type="text"
                    value={formIncidentType}
                    onChange={(e) => setFormIncidentType(e.target.value)}
                    placeholder="Contoh: Vibrasi Abnormal, Trip Overcurrent, Kebocoran Oli..."
                    className="w-full h-8 px-3 border border-slate-300 rounded bg-white text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Deskripsi Kronologi */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Deskripsi Detail Masalah *</label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Uraikan kronologi kejadian dan kondisi unit saat gangguan terdeteksi..."
                    className="w-full p-2.5 border border-slate-300 rounded bg-white text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Tindakan Sementara Operator */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tindakan Sementara Operator</label>
                  <textarea
                    rows={2}
                    value={formOperatorAction}
                    onChange={(e) => setFormOperatorAction(e.target.value)}
                    placeholder="Tindakan darurat yang telah dilakukan (misal: menurunkan beban, isolasi valve, pemadaman darurat)..."
                    className="w-full p-2.5 border border-slate-300 rounded bg-white text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Lampiran Foto */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unggah Foto Lampiran (Maks 5 MB)</label>
                  <div className="border border-dashed border-slate-300 rounded p-3 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Camera size={16} className="text-slate-400" />
                      <span className="text-slate-500">
                        {formAttachmentName ? formAttachmentName : 'Pilih file JPEG/PNG/WebP'}
                      </span>
                    </div>
                    <Button
                      type="button"
                      onClick={() => setFormAttachmentName('foto_gangguan_' + Date.now().toString().slice(-4) + '.jpg')}
                      className="text-xs h-7 px-3 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium rounded"
                    >
                      {formAttachmentName ? 'Ganti Foto' : 'Simulasi Foto'}
                    </Button>
                  </div>
                  <span className="text-[0.65rem] text-slate-400 block mt-1">
                    * Format diperbolehkan: JPEG, PNG, WebP (maks. 5 MB). Foto status OPEN/PROCESS dikecualikan dari retensi 3 bulan.
                  </span>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="text-xs h-8 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-4 rounded"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="text-xs h-8 bg-rose-600 hover:bg-rose-700 text-white font-semibold px-5 rounded shadow-sm"
                >
                  Simpan Laporan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gangguan;
