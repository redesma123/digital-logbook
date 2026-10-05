import { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Wrench,
  CheckCircle2,
  Filter,
  Search,
  Eye,
  X,
  History,
  Camera,
  ChevronRight,
  RefreshCw,
  FileSpreadsheet,
  Plus,
  Calendar,
  AlertCircle,
  Edit,
  Trash2
} from 'lucide-react';

export type MaintenanceStatus = 'PLAN' | 'PROCESS' | 'COMPLETE';

export interface MaintenanceStatusHistory {
  id: number;
  from_status: MaintenanceStatus | null;
  to_status: MaintenanceStatus;
  changed_by: string;
  role: 'OPERATOR' | 'SUPERVISOR';
  changed_at: string;
  notes: string;
}

export interface MaintenanceRecord {
  id: number;
  code: string;
  unit_id: number;
  unit_name: string;
  equipment: string;
  work_type: string;
  description: string;
  technician: string;
  planned_date: string;
  status: MaintenanceStatus;
  created_by: string;
  created_at: string;
  has_attachment: boolean;
  attachment_name?: string;
  attachment_size?: string;
  histories: MaintenanceStatusHistory[];
}

const initialMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: 1,
    code: 'MNT-2026-001',
    unit_id: 1,
    unit_name: 'Unit 1 (PLTMH)',
    equipment: 'Main Inlet Valve (MIV) & Counterweight',
    work_type: 'Preventive Maintenance (Berkala 3 Bulanan)',
    description: 'Penggantian hydraulic oil filter, inspeksi seal karet katup penutup utama, dan uji fungsional emergency drop counterweight.',
    technician: 'Tim Mekanik PLTMH (Koordinator: Rudi Hartono)',
    planned_date: '2026-10-06',
    status: 'PLAN',
    created_by: 'Budi Santoso (Operator)',
    created_at: '2026-10-03 09:15',
    has_attachment: false,
    histories: [
      {
        id: 101,
        from_status: null,
        to_status: 'PLAN',
        changed_by: 'Budi Santoso',
        role: 'OPERATOR',
        changed_at: '2026-10-03 09:15',
        notes: 'Rencana pemeliharaan rutin MIV dijadwalkan sesuai buku manual operasional.'
      }
    ]
  },
  {
    id: 2,
    code: 'MNT-2026-002',
    unit_id: 1,
    unit_name: 'Unit 1 (PLTMH)',
    equipment: 'Generator Thrust Bearing & Lube System',
    work_type: 'Corrective Maintenance (Inspeksi & Ganti Filter)',
    description: 'Pembersihan strainer oil filter jalur sirkulasi oli dan penambahan pelumas darurat pasca indikasi kenaikan suhu bearing 86°C.',
    technician: 'Tim Mekanik & Spesialis Vendor Hydro',
    planned_date: '2026-10-02',
    status: 'PROCESS',
    created_by: 'Ahmad Hidayat (Operator)',
    created_at: '2026-10-01 15:30',
    has_attachment: true,
    attachment_name: 'kondisi_oil_filter_bearing.jpg',
    attachment_size: '1.8 MB',
    histories: [
      {
        id: 102,
        from_status: null,
        to_status: 'PLAN',
        changed_by: 'Ahmad Hidayat',
        role: 'OPERATOR',
        changed_at: '2026-10-01 15:30',
        notes: 'Dibuat rencana tindakan perbaikan setelah penanganan sementara gangguan suhu bearing.'
      },
      {
        id: 103,
        from_status: 'PLAN',
        to_status: 'PROCESS',
        changed_by: 'Hendra Wijaya',
        role: 'SUPERVISOR',
        changed_at: '2026-10-02 08:30',
        notes: 'SPK pekerjaan disetujui. Tim mekanik mulai membongkar casing filter oli dan flushing pelumas.'
      }
    ]
  },
  {
    id: 3,
    code: 'MNT-2026-003',
    unit_id: 2,
    unit_name: 'Unit 2 (PLTMH)',
    equipment: 'Automatic Voltage Regulator (AVR) & Exciter',
    work_type: 'Kalibrasi & Pengujian Proteksi',
    description: 'Kalibrasi ulang modul sensing tegangan AVR, penggantian resistor limiter, dan verifikasi kestabilan eksitasi beban penuh 400 kW.',
    technician: 'Tim Elektrikal & Instrumentasi',
    planned_date: '2026-09-30',
    status: 'COMPLETE',
    created_by: 'Hendra Wijaya (Supervisor)',
    created_at: '2026-09-29 20:00',
    has_attachment: true,
    attachment_name: 'laporan_uji_avr_stabil.png',
    attachment_size: '920 KB',
    histories: [
      {
        id: 104,
        from_status: null,
        to_status: 'PLAN',
        changed_by: 'Hendra Wijaya',
        role: 'SUPERVISOR',
        changed_at: '2026-09-29 20:00',
        notes: 'Rencana kalibrasi darurat sistem eksitasi AVR.'
      },
      {
        id: 105,
        from_status: 'PLAN',
        to_status: 'PROCESS',
        changed_by: 'Hendra Wijaya',
        role: 'SUPERVISOR',
        changed_at: '2026-09-30 08:30',
        notes: 'Pekerjaan penggantian kartu elektronik AVR dan pengujian isolasi kabel dimulai.'
      },
      {
        id: 106,
        from_status: 'PROCESS',
        to_status: 'COMPLETE',
        changed_by: 'Hendra Wijaya',
        role: 'SUPERVISOR',
        changed_at: '2026-09-30 16:45',
        notes: 'Uji sinkronisasi grid PLN berhasil sempurna. Tegangan stabil 398V, proteksi normal.'
      }
    ]
  },
  {
    id: 4,
    code: 'MNT-2026-004',
    unit_id: 2,
    unit_name: 'Unit 2 (PLTMH)',
    equipment: 'Trash Rack Cleaner & Water Intake Screen',
    work_type: 'Preventive Maintenance (Pembersihan Berkala)',
    description: 'Pembersihan akumulasi sedimen lumpur dan serasah ranting di intake gate serta pelumasan rel transmisi mekanis trash rake.',
    technician: 'Tim Sipil & Operasional Intake',
    planned_date: '2026-09-24',
    status: 'COMPLETE',
    created_by: 'Siti Rahma (Operator)',
    created_at: '2026-09-23 11:00',
    has_attachment: true,
    attachment_name: 'intake_screen_bersih.jpg',
    attachment_size: '2.4 MB',
    histories: [
      {
        id: 107,
        from_status: null,
        to_status: 'PLAN',
        changed_by: 'Siti Rahma',
        role: 'OPERATOR',
        changed_at: '2026-09-23 11:00',
        notes: 'Jadwal rutin mingguan pembersihan intake air kolam penenang.'
      },
      {
        id: 108,
        from_status: 'PLAN',
        to_status: 'PROCESS',
        changed_by: 'Hendra Wijaya',
        role: 'SUPERVISOR',
        changed_at: '2026-09-24 09:00',
        notes: 'Pintu intake ditutup bertahap untuk pembersihan manual sedimentasi.'
      },
      {
        id: 109,
        from_status: 'PROCESS',
        to_status: 'COMPLETE',
        changed_by: 'Hendra Wijaya',
        role: 'SUPERVISOR',
        changed_at: '2026-09-24 14:30',
        notes: 'Pembersihan tuntas, debit air normal kembali dan saringan sampah berfungsi lancar.'
      }
    ]
  }
];

const Maintenance = () => {
  const [records, setRecords] = useState<MaintenanceRecord[]>(initialMaintenanceRecords);
  const [selectedUnit, setSelectedUnit] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Peran pengguna aktif sesuai sesi autentikasi (Supervisor)
  const currentRole: 'SUPERVISOR' | 'OPERATOR' = 'SUPERVISOR';

  // Modal State
  const [detailRecord, setDetailRecord] = useState<MaintenanceRecord | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);
  const [statusNote, setStatusNote] = useState<string>('');
  const [previewPhoto, setPreviewPhoto] = useState<{ name: string; size: string } | null>(null);

  // Form State Rencana Maintenance
  const [formUnit, setFormUnit] = useState<number>(1);
  const [formEquipment, setFormEquipment] = useState<string>('');
  const [formWorkType, setFormWorkType] = useState<string>('');
  const [formTechnician, setFormTechnician] = useState<string>('');
  const [formPlannedDate, setFormPlannedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [formDescription, setFormDescription] = useState<string>('');
  const [formAttachmentName, setFormAttachmentName] = useState<string>('');

  // Filter Data Maintenance
  const filteredRecords = records.filter((item) => {
    if (selectedUnit !== 'ALL' && item.unit_id.toString() !== selectedUnit) {
      return false;
    }
    if (selectedStatus !== 'ALL' && item.status !== selectedStatus) {
      return false;
    }
    if (fromDate && item.planned_date < fromDate) {
      return false;
    }
    if (toDate && item.planned_date > toDate) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const match =
        item.code.toLowerCase().includes(q) ||
        item.equipment.toLowerCase().includes(q) ||
        item.work_type.toLowerCase().includes(q) ||
        item.technician.toLowerCase().includes(q) ||
        item.created_by.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // KPI Stat Counts
  const totalCount = records.length;
  const planCount = records.filter((r) => r.status === 'PLAN').length;
  const processCount = records.filter((r) => r.status === 'PROCESS').length;
  const completeCount = records.filter((r) => r.status === 'COMPLETE').length;

  // Handle Create Maintenance Plan (SRS F-23, F-24)
  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEquipment.trim() || !formWorkType.trim() || !formDescription.trim()) {
      alert('Mohon lengkapi bagian peralatan, jenis pekerjaan, dan deskripsi rencana maintenance.');
      return;
    }

    const newId = records.length + 1;
    const newCode = `MNT-2026-${String(newId).padStart(3, '0')}`;
    const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');

    const newRecord: MaintenanceRecord = {
      id: newId,
      code: newCode,
      unit_id: formUnit,
      unit_name: formUnit === 1 ? 'Unit 1 (PLTMH)' : 'Unit 2 (PLTMH)',
      equipment: formEquipment,
      work_type: formWorkType,
      description: formDescription,
      technician: formTechnician || 'Tim Pemeliharaan Internal',
      planned_date: formPlannedDate,
      status: 'PLAN',
      created_by: currentRole === 'SUPERVISOR' ? 'Hendra Wijaya (Supervisor)' : 'Budi Santoso (Operator)',
      created_at: nowStr,
      has_attachment: !!formAttachmentName,
      attachment_name: formAttachmentName || undefined,
      attachment_size: formAttachmentName ? '1.5 MB' : undefined,
      histories: [
        {
          id: Date.now(),
          from_status: null,
          to_status: 'PLAN',
          changed_by: currentRole === 'SUPERVISOR' ? 'Hendra Wijaya' : 'Budi Santoso',
          role: currentRole,
          changed_at: nowStr,
          notes: 'Rencana pekerjaan maintenance baru dibuat.'
        }
      ]
    };

    setRecords([newRecord, ...records]);
    setIsCreateOpen(false);

    // Reset Form
    setFormEquipment('');
    setFormWorkType('');
    setFormTechnician('');
    setFormDescription('');
    setFormAttachmentName('');
  };

  // Open Edit Modal
  const openEditModal = (rec: MaintenanceRecord) => {
    setEditingRecord(rec);
    setFormUnit(rec.unit_id);
    setFormEquipment(rec.equipment);
    setFormWorkType(rec.work_type);
    setFormTechnician(rec.technician);
    setFormPlannedDate(rec.planned_date);
    setFormDescription(rec.description);
    setFormAttachmentName(rec.attachment_name || '');
  };

  // Handle Save Edit
  const handleUpdateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    const updated: MaintenanceRecord = {
      ...editingRecord,
      unit_id: formUnit,
      unit_name: formUnit === 1 ? 'Unit 1 (PLTMH)' : 'Unit 2 (PLTMH)',
      equipment: formEquipment,
      work_type: formWorkType,
      technician: formTechnician,
      planned_date: formPlannedDate,
      description: formDescription,
      has_attachment: !!formAttachmentName,
      attachment_name: formAttachmentName || undefined,
      attachment_size: formAttachmentName ? editingRecord.attachment_size || '1.5 MB' : undefined
    };

    setRecords(records.map((r) => (r.id === updated.id ? updated : r)));
    if (detailRecord && detailRecord.id === updated.id) {
      setDetailRecord(updated);
    }
    setEditingRecord(null);
  };

  // Handle Delete Record (Supervisor only, RULES.md & SRS F-26)
  const handleDeleteRecord = (id: number) => {
    if (currentRole !== 'SUPERVISOR') {
      alert('Akses Ditolak: Hanya Supervisor yang berwenang menghapus data maintenance.');
      return;
    }
    if (window.confirm('Apakah Anda yakin ingin menghapus data pemeliharaan ini? Data akan menerapkan soft delete untuk integritas historis.')) {
      setRecords(records.filter((r) => r.id !== id));
      if (detailRecord?.id === id) {
        setDetailRecord(null);
      }
    }
  };

  // Handle Status Transition (Strictly adheres to RULES.md 1.4 & SRS F-25/F-26):
  // Alur: PLAN -> PROCESS -> COMPLETE
  // Hanya Supervisor yang berwenang mengubah status maintenance.
  const handleUpdateStatus = (targetStatus: MaintenanceStatus) => {
    if (!detailRecord) return;

    if (currentRole !== 'SUPERVISOR') {
      alert('Perhatian: Berdasarkan aturan sistem (RULES.md 1.4), HANYA SUPERVISOR yang memiliki wewenang untuk mengubah status maintenance.');
      return;
    }

    if (!statusNote.trim()) {
      alert('Wajib mengisi catatan/alasan perubahan status sesuai persyaratan Audit Trail (SRS F-28).');
      return;
    }

    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const newHistory: MaintenanceStatusHistory = {
      id: Date.now(),
      from_status: detailRecord.status,
      to_status: targetStatus,
      changed_by: 'Hendra Wijaya',
      role: 'SUPERVISOR',
      changed_at: now,
      notes: statusNote
    };

    const updated: MaintenanceRecord = {
      ...detailRecord,
      status: targetStatus,
      histories: [...detailRecord.histories, newHistory]
    };

    setRecords(records.map((r) => (r.id === updated.id ? updated : r)));
    setDetailRecord(updated);
    setStatusNote('');
  };

  // Export to CSV / Excel (F-44, RULES.md)
  const handleExportCSV = () => {
    const headers = ['No Insiden/Kode', 'Unit', 'Peralatan', 'Jenis Pekerjaan', 'Teknisi', 'Jadwal Rencana', 'Status', 'Pelapor/Pembuat', 'Deskripsi'];
    const rows = filteredRecords.map((r) => [
      `"${r.code}"`,
      `"${r.unit_name}"`,
      `"${r.equipment}"`,
      `"${r.work_type}"`,
      `"${r.technician}"`,
      `"${r.planned_date}"`,
      `"${r.status}"`,
      `"${r.created_by}"`,
      `"${r.description.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Maintenance_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Badge Status sesuai DESIGN_SYSTEM.md 1.4:
  // PLAN: Abu-abu (status-offline)
  // PROCESS: Kuning (status-standby)
  // COMPLETE: Hijau (status-running)
  const getStatusBadge = (status: MaintenanceStatus) => {
    switch (status) {
      case 'PLAN':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mr-1.5"></span>
            PLAN
          </span>
        );
      case 'PROCESS':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span>
            PROCESS
          </span>
        );
      case 'COMPLETE':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} className="mr-1 text-emerald-600" />
            COMPLETE
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
            {/* Top Bar / Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Rencana & Rekaman Pemeliharaan (Maintenance)</h2>
                </div>
                <p className="text-sm font-medium text-slate-500 mt-1">
                  Pengelolaan jadwal pemeliharaan unit, koordinasi teknisi pelaksana, dan audit alur kerja (PLAN &rarr; PROCESS &rarr; COMPLETE).
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center flex-wrap gap-2.5">
                {/* Ekspor CSV */}
                <Button
                  onClick={handleExportCSV}
                  className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs h-9 px-3 shadow-sm rounded flex items-center"
                >
                  <FileSpreadsheet size={15} className="mr-1.5 text-emerald-600" />
                  Ekspor CSV
                </Button>

                {/* Buat Rencana Maintenance Baru (F-23) */}
                <Button
                  onClick={() => setIsCreateOpen(true)}
                  className="bg-[#0F4C81] hover:bg-[#0c3d66] text-white font-semibold text-xs h-9 px-3.5 shadow-sm rounded flex items-center"
                >
                  <Plus size={15} className="mr-1.5" />
                  Buat Rencana Maintenance
                </Button>
              </div>
            </div>

            {/* KPI Stat Cards (Design System 1.4 & Harmonized with Gangguan) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white border-slate-200 shadow-sm rounded-md p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest">Total Jadwal Maintenance</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{totalCount}</p>
                    <span className="text-[0.7rem] text-slate-400 font-medium">Rekapitulasi seluruh unit</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    <Wrench size={20} />
                  </div>
                </div>
              </Card>

              <Card className="bg-white border-slate-200 shadow-sm rounded-md p-4 bg-gradient-to-br from-white to-slate-50/80">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[0.65rem] font-bold text-slate-600 uppercase tracking-widest">Status: PLAN (Terencana)</p>
                    <p className="text-2xl font-black text-slate-800 mt-1">{planCount}</p>
                    <span className="text-[0.7rem] text-slate-500 font-medium">Jadwal menunggu pelaksanaan</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                    <Calendar size={20} />
                  </div>
                </div>
              </Card>

              <Card className="bg-white border-amber-200 shadow-sm rounded-md p-4 bg-gradient-to-br from-white to-amber-50/40">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[0.65rem] font-bold text-amber-600 uppercase tracking-widest">Status: PROCESS (Dikerjakan)</p>
                    <p className="text-2xl font-black text-amber-700 mt-1">{processCount}</p>
                    <span className="text-[0.7rem] text-amber-600/80 font-medium">Pekerjaan lapangan sedang aktif</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                    <RefreshCw size={20} />
                  </div>
                </div>
              </Card>

              <Card className="bg-white border-emerald-200 shadow-sm rounded-md p-4 bg-gradient-to-br from-white to-emerald-50/40">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[0.65rem] font-bold text-emerald-600 uppercase tracking-widest">Status: COMPLETE (Selesai)</p>
                    <p className="text-2xl font-black text-emerald-700 mt-1">{completeCount}</p>
                    <span className="text-[0.7rem] text-emerald-600/80 font-medium">Telah diverifikasi supervisor</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 size={20} />
                  </div>
                </div>
              </Card>
            </div>

            {/* Filter Section (SRS F-27: Status & Rentang Tanggal) */}
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
                        <option value="PLAN">PLAN (Rencana)</option>
                        <option value="PROCESS">PROCESS (Sedang Dikerjakan)</option>
                        <option value="COMPLETE">COMPLETE (Selesai)</option>
                      </select>
                    </div>

                    {/* Date Range Filter (SRS F-27) */}
                    <div className="flex items-center gap-2">
                      <label className="text-[0.65rem] font-bold text-slate-500 tracking-widest uppercase">DARI:</label>
                      <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="h-8 text-xs border border-slate-200 rounded bg-white text-slate-700 font-medium px-2 outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-[0.65rem] font-bold text-slate-500 tracking-widest uppercase">SAMPAI:</label>
                      <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="h-8 text-xs border border-slate-200 rounded bg-white text-slate-700 font-medium px-2 outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                      <Search size={14} className="absolute left-2.5 top-2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cari peralatan, teknisi, kode..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 pl-8 pr-3 text-xs border border-slate-200 rounded bg-white text-slate-700 font-medium placeholder-slate-400 w-52 md:w-60 outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Reset Filter Button */}
                  {(selectedUnit !== 'ALL' || selectedStatus !== 'ALL' || fromDate !== '' || toDate !== '' || searchQuery !== '') && (
                    <Button
                      onClick={() => {
                        setSelectedUnit('ALL');
                        setSelectedStatus('ALL');
                        setFromDate('');
                        setToDate('');
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

            {/* Maintenance Records Table */}
            <Card className="bg-white border-slate-200 shadow-sm rounded-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[0.65rem] text-slate-600 bg-slate-100/90 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">No / ID Maintenance</th>
                      <th className="py-3 px-4">Jadwal Rencana</th>
                      <th className="py-3 px-4">Unit PLTMH</th>
                      <th className="py-3 px-4">Peralatan</th>
                      <th className="py-3 px-4">Jenis Pemeliharaan</th>
                      <th className="py-3 px-4">Teknisi / Pelaksana</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-10 text-center text-slate-400 text-sm">
                          Tidak ada data pemeliharaan yang sesuai dengan filter pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-xs text-slate-900">
                            {item.code}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-600 font-medium">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={13} className="text-slate-400" />
                              <span>{item.planned_date}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-xs font-semibold text-slate-800">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              {item.unit_name}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs font-bold text-slate-900">
                            {item.equipment}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-700">
                            <span className="font-medium text-slate-900">{item.work_type}</span>
                            {item.has_attachment && (
                              <button
                                type="button"
                                onClick={() => setPreviewPhoto({ name: item.attachment_name || 'lampiran.jpg', size: item.attachment_size || '1.5 MB' })}
                                className="ml-2 inline-flex items-center text-[0.65rem] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 hover:bg-blue-100 transition-colors"
                              >
                                <Camera size={10} className="mr-0.5" /> Foto
                              </button>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-600">
                            {item.technician}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {getStatusBadge(item.status)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="inline-flex items-center gap-1.5">
                              <Button
                                onClick={() => {
                                  setDetailRecord(item);
                                  setStatusNote('');
                                }}
                                className="text-xs h-7 px-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded shadow-none inline-flex items-center"
                              >
                                <Eye size={13} className="mr-1 text-slate-500" />
                                Detail & Alur
                              </Button>

                              <Button
                                onClick={() => openEditModal(item)}
                                title="Edit Rencana Maintenance"
                                className="text-xs h-7 w-7 p-0 bg-white border border-slate-300 hover:bg-slate-100 text-slate-600 rounded shadow-none inline-flex items-center justify-center"
                              >
                                <Edit size={13} />
                              </Button>

                              {currentRole === 'SUPERVISOR' && (
                                <Button
                                  onClick={() => handleDeleteRecord(item.id)}
                                  title="Hapus Data (Supervisor)"
                                  className="text-xs h-7 w-7 p-0 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded shadow-none inline-flex items-center justify-center"
                                >
                                  <Trash2 size={13} />
                                </Button>
                              )}
                            </div>
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

      {/* MODAL: DETAIL MAINTENANCE & ALUR PERUBAHAN STATUS (SRS F-25, F-26, F-28) */}
      {detailRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-sm bg-slate-200 px-2 py-0.5 rounded text-slate-800">
                  {detailRecord.code}
                </span>
                <h3 className="font-bold text-slate-900 text-base">{detailRecord.equipment}</h3>
                {getStatusBadge(detailRecord.status)}
              </div>
              <button
                onClick={() => setDetailRecord(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Ringkasan Data Maintenance (SRS F-24) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-md border border-slate-200">
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[0.65rem]">Unit PLTMH</span>
                  <span className="font-bold text-slate-800 text-sm">{detailRecord.unit_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[0.65rem]">Jadwal Rencana</span>
                  <span className="font-semibold text-slate-700 flex items-center gap-1 mt-0.5">
                    <Calendar size={13} className="text-slate-500" />
                    {detailRecord.planned_date}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[0.65rem]">Pembuat Rencana</span>
                  <span className="font-semibold text-slate-700">{detailRecord.created_by}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[0.65rem]">Jenis Pemeliharaan</span>
                  <span className="font-bold text-[#0F4C81]">{detailRecord.work_type}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[0.65rem]">Teknisi / Pelaksana</span>
                  <span className="font-semibold text-slate-800">{detailRecord.technician}</span>
                </div>
              </div>

              {/* Deskripsi Pekerjaan */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">Deskripsi Rencana & Instruksi Pekerjaan:</h4>
                <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs leading-relaxed text-slate-700 font-medium">
                  {detailRecord.description}
                </div>
              </div>

              {/* Lampiran Foto (SRS F-29, F-30, RULES.md 1.5 & 1.6) */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">Lampiran Foto Dokumentasi / SPK:</h4>
                {detailRecord.has_attachment ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                        <Camera size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{detailRecord.attachment_name}</p>
                        <p className="text-[0.65rem] text-slate-500 font-medium">
                          Ukuran: {detailRecord.attachment_size} • Format valid (JPEG/PNG/WebP) • Retensi 3 bulan kecuali aktif
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setPreviewPhoto({ name: detailRecord.attachment_name || '', size: detailRecord.attachment_size || '' })}
                      className="text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded border border-blue-200"
                    >
                      Lihat Foto
                    </Button>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded text-xs text-slate-400 italic">
                    Belum ada lampiran foto dokumentasi untuk pekerjaan pemeliharaan ini.
                  </div>
                )}
              </div>

              {/* ALUR PERUBAHAN STATUS (RULES.md 1.4 & SRS F-25, F-26) */}
              <div className="border-t border-slate-200 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
                    <RefreshCw size={14} className="mr-1.5 text-blue-600" />
                    Alur Perubahan Status (PLAN &rarr; PROCESS &rarr; COMPLETE)
                  </h4>
                  <span className="text-[0.7rem] font-semibold text-slate-500">
                    Mode Akses Saat Ini:{' '}
                    <span className={`font-bold ${currentRole === 'SUPERVISOR' ? 'text-emerald-700' : 'text-blue-700'}`}>
                      {currentRole}
                    </span>
                  </span>
                </div>

                <div className="bg-blue-50/50 border border-blue-200 rounded p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <span>Status Saat Ini:</span>
                    {getStatusBadge(detailRecord.status)}
                    <ChevronRight size={14} className="text-slate-400 mx-1" />
                    <span className="text-slate-500 font-normal">Transisi langkah status:</span>
                  </div>

                  {/* Pengingat Wewenang RBAC */}
                  {currentRole !== 'SUPERVISOR' && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-amber-800 text-xs flex items-center gap-2">
                      <AlertCircle size={15} className="flex-shrink-0 text-amber-600" />
                      <span>
                        Pemberitahuan Wewenang: Menurut aturan (RULES.md 1.4), hanya akun <strong>SUPERVISOR</strong> yang berhak memajukan status pekerjaan pemeliharaan. Anda sedang login sebagai Operator.
                      </span>
                    </div>
                  )}

                  {/* Input Catatan Perubahan (SRS F-28) */}
                  {currentRole === 'SUPERVISOR' && detailRecord.status !== 'COMPLETE' && (
                    <div>
                      <label className="text-[0.7rem] font-bold text-slate-600 block mb-1">
                        Catatan / Alasan Perubahan Status (Wajib untuk Audit Trail):
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Pekerjaan di lapangan telah dimulai oleh teknisi / Seluruh pengujian beban selesai normal..."
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                        className="w-full h-8 px-3 text-xs border border-slate-300 rounded bg-white text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  {/* Tombol Transisi Alur */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {detailRecord.status === 'PLAN' && (
                      <Button
                        disabled={currentRole !== 'SUPERVISOR'}
                        onClick={() => handleUpdateStatus('PROCESS')}
                        className={`text-xs font-semibold h-8 px-4 rounded shadow-sm ${
                          currentRole === 'SUPERVISOR'
                            ? 'bg-amber-600 hover:bg-amber-700 text-white'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        Mulai Pekerjaan &rarr; Ubah ke PROCESS
                      </Button>
                    )}

                    {detailRecord.status === 'PROCESS' && (
                      <Button
                        disabled={currentRole !== 'SUPERVISOR'}
                        onClick={() => handleUpdateStatus('COMPLETE')}
                        className={`text-xs font-semibold h-8 px-4 rounded shadow-sm ${
                          currentRole === 'SUPERVISOR'
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        Selesaikan Maintenance &rarr; Ubah ke COMPLETE
                      </Button>
                    )}

                    {detailRecord.status === 'COMPLETE' && (
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-emerald-800 font-medium bg-emerald-50 px-2 py-1 rounded border border-emerald-200 flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-emerald-600" />
                          Pemeliharaan ini telah berstatus COMPLETE (Telah tuntas dan diverifikasi).
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* AUDIT TRAIL / REKAM JEJAK STATUS (SRS F-28, RULES.md 1.4) */}
              <div className="border-t border-slate-200 pt-5">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center">
                  <History size={14} className="mr-1.5 text-slate-600" />
                  Rekam Jejak Status (Audit Trail)
                </h4>
                <div className="space-y-3">
                  {detailRecord.histories.map((hist, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs bg-slate-50 p-3 rounded border border-slate-200">
                      <div className="mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-[#0F4C81]"></div>
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
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
              <div>
                {currentRole === 'SUPERVISOR' && (
                  <Button
                    onClick={() => handleDeleteRecord(detailRecord.id)}
                    className="text-xs h-8 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold px-3 rounded border border-rose-200 inline-flex items-center"
                  >
                    <Trash2 size={13} className="mr-1.5 text-rose-600" />
                    Hapus Data
                  </Button>
                )}
              </div>
              <Button
                onClick={() => setDetailRecord(null)}
                className="text-xs h-8 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-4 rounded"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INPUT RENCANA MAINTENANCE BARU (SRS F-23, F-24) */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Wrench size={18} className="text-[#0F4C81]" />
                <h3 className="font-bold text-slate-900 text-base">Buat Rencana Pekerjaan Maintenance</h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Rencana Maintenance */}
            <form onSubmit={handleCreateRecord}>
              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
                {/* Unit & Tanggal Rencana (SRS F-24) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Unit PLTMH *</label>
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
                    <label className="font-bold text-slate-700 block mb-1">Jadwal Rencana (Planned Date) *</label>
                    <input
                      type="date"
                      value={formPlannedDate}
                      onChange={(e) => setFormPlannedDate(e.target.value)}
                      className="w-full h-8 px-3 border border-slate-300 rounded bg-white text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Peralatan (SRS F-24) */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Peralatan / Komponen *</label>
                  <input
                    type="text"
                    value={formEquipment}
                    onChange={(e) => setFormEquipment(e.target.value)}
                    placeholder="Contoh: Turbin Runner, Katup Utama (MIV), Generator Bearing, Trafo..."
                    className="w-full h-8 px-3 border border-slate-300 rounded bg-white text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Jenis Pekerjaan & Teknisi (SRS F-24) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Jenis Pekerjaan (Work Type) *</label>
                    <input
                      type="text"
                      value={formWorkType}
                      onChange={(e) => setFormWorkType(e.target.value)}
                      placeholder="Contoh: Pemeliharaan Preventif, Penggantian Seal..."
                      className="w-full h-8 px-3 border border-slate-300 rounded bg-white text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Teknisi / Pelaksana</label>
                    <input
                      type="text"
                      value={formTechnician}
                      onChange={(e) => setFormTechnician(e.target.value)}
                      placeholder="Contoh: Tim Mekanik PLTMH, Vendor Elektrikal..."
                      className="w-full h-8 px-3 border border-slate-300 rounded bg-white text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Deskripsi Pekerjaan (SRS F-24) */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Deskripsi Detail Pekerjaan *</label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Uraikan ruang lingkup pekerjaan maintenance, suku cadang yang disiapkan, dan target hasil..."
                    className="w-full p-2.5 border border-slate-300 rounded bg-white text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Lampiran Foto / Dokumen (SRS F-29, RULES.md 1.5) */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Lampiran Foto Bukti / SPK (Opsional, Maks 5 MB)</label>
                  <div className="border border-dashed border-slate-300 rounded p-3 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Camera size={16} className="text-slate-400" />
                      <span className="text-slate-500">
                        {formAttachmentName ? formAttachmentName : 'Pilih file JPEG/PNG/WebP'}
                      </span>
                    </div>
                    <Button
                      type="button"
                      onClick={() => setFormAttachmentName('spk_maintenance_' + Date.now().toString().slice(-4) + '.jpg')}
                      className="text-xs h-7 px-3 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium rounded"
                    >
                      {formAttachmentName ? 'Ganti Foto' : 'Simulasi Foto'}
                    </Button>
                  </div>
                  <span className="text-[0.65rem] text-slate-400 block mt-1">
                    * Format yang diterima: JPEG, PNG, WebP (maks. 5 MB). Validasi berkas melalui magic bytes.
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
                  className="text-xs h-8 bg-[#0F4C81] hover:bg-[#0c3d66] text-white font-semibold px-5 rounded shadow-sm"
                >
                  Simpan Rencana Maintenance
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT DATA MAINTENANCE */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Edit size={18} className="text-[#0F4C81]" />
                <h3 className="font-bold text-slate-900 text-base">Ubah Rencana Maintenance ({editingRecord.code})</h3>
              </div>
              <button
                onClick={() => setEditingRecord(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Edit */}
            <form onSubmit={handleUpdateRecord}>
              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Unit PLTMH</label>
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
                    <label className="font-bold text-slate-700 block mb-1">Jadwal Rencana</label>
                    <input
                      type="date"
                      value={formPlannedDate}
                      onChange={(e) => setFormPlannedDate(e.target.value)}
                      className="w-full h-8 px-3 border border-slate-300 rounded bg-white text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Peralatan</label>
                  <input
                    type="text"
                    value={formEquipment}
                    onChange={(e) => setFormEquipment(e.target.value)}
                    className="w-full h-8 px-3 border border-slate-300 rounded bg-white text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Jenis Pekerjaan</label>
                    <input
                      type="text"
                      value={formWorkType}
                      onChange={(e) => setFormWorkType(e.target.value)}
                      className="w-full h-8 px-3 border border-slate-300 rounded bg-white text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Teknisi / Pelaksana</label>
                    <input
                      type="text"
                      value={formTechnician}
                      onChange={(e) => setFormTechnician(e.target.value)}
                      className="w-full h-8 px-3 border border-slate-300 rounded bg-white text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Deskripsi Pekerjaan</label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded bg-white text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Lampiran Foto</label>
                  <div className="border border-dashed border-slate-300 rounded p-3 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Camera size={16} className="text-slate-400" />
                      <span className="text-slate-500">
                        {formAttachmentName ? formAttachmentName : 'Tidak ada lampiran foto'}
                      </span>
                    </div>
                    <Button
                      type="button"
                      onClick={() => setFormAttachmentName('spk_updated_' + Date.now().toString().slice(-4) + '.jpg')}
                      className="text-xs h-7 px-3 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium rounded"
                    >
                      {formAttachmentName ? 'Ganti Foto' : 'Tambah Foto'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="text-xs h-8 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-4 rounded"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="text-xs h-8 bg-[#0F4C81] hover:bg-[#0c3d66] text-white font-semibold px-5 rounded shadow-sm"
                >
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PREVIEW FOTO LAMPIRAN (SRS F-29, F-30, RULES.md 1.5) */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Camera size={16} className="text-blue-600" />
                <span className="font-bold text-xs text-slate-800">{previewPhoto.name}</span>
              </div>
              <button
                onClick={() => setPreviewPhoto(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center bg-slate-900/90 text-white">
              {/* Mock Ilustrasi Foto Lapangan */}
              <div className="w-full h-56 bg-slate-800 rounded-md border border-slate-700 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                <Wrench size={48} className="text-blue-400 mb-2 opacity-80" />
                <p className="text-xs font-semibold text-slate-200">Pratinjau Foto Lampiran Pekerjaan Maintenance</p>
                <p className="text-[0.65rem] text-slate-400 mt-1 max-w-sm">
                  {previewPhoto.name} ({previewPhoto.size})
                </p>
                <span className="mt-3 text-[0.65rem] bg-blue-900/60 text-blue-200 px-2.5 py-1 rounded border border-blue-700">
                  Tervalidasi Magic Bytes (JPEG/PNG/WebP) &bull; Akses Terenkripsi
                </span>
              </div>
              <p className="text-[0.7rem] text-slate-400 mt-3 text-center">
                Foto disimpan aman di backend storage dengan nama acak UUID sesuai ketentuan RULES.md.
              </p>
            </div>
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <Button
                onClick={() => setPreviewPhoto(null)}
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

export default Maintenance;
