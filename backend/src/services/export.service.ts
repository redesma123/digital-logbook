import { Response } from 'express';
import ExcelJS from 'exceljs';
import { Prisma, Shift } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export interface ExportLogbookFilters {
  unit_id?: number;
  from?: string;
  to?: string;
  shift?: Shift;
}

export interface ExportIncidentsFilters {
  unit_id?: number;
  from?: string;
  to?: string;
}

export interface ExportMaintenanceFilters {
  unit_id?: number;
  from?: string;
  to?: string;
}

export class ExportService {
  async exportLogbook(filters: ExportLogbookFilters, format: 'xlsx' | 'csv' = 'xlsx', res: Response): Promise<void> {
    const where: Prisma.logbook_entriesWhereInput = {
      deleted_at: null,
    };

    if (filters.unit_id) {
      where.unit_id = filters.unit_id;
    }

    if (filters.shift) {
      where.shift = filters.shift;
    }

    if (filters.from || filters.to) {
      where.date = {};
      if (filters.from) {
        where.date.gte = new Date(filters.from + 'T00:00:00Z');
      }
      if (filters.to) {
        where.date.lte = new Date(filters.to + 'T00:00:00Z');
      }
    }

    const entries = await prisma.logbook_entries.findMany({
      where,
      include: {
        unit: {
          select: { unit_code: true, name: true },
        },
        operator: {
          select: { full_name: true, username: true },
        },
        params_electrical: true,
        params_mechanical: true,
        params_hydraulic: true,
      },
      orderBy: [
        { date: 'desc' },
        { shift: 'desc' },
      ],
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'HYDRO-MON System';
    const worksheet = workbook.addWorksheet('Logbook');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Unit', key: 'unit', width: 15 },
      { header: 'Operator', key: 'operator', width: 20 },
      { header: 'Tanggal', key: 'date', width: 15 },
      { header: 'Shift', key: 'shift', width: 12 },
      { header: 'Status Unit', key: 'unit_status', width: 15 },
      { header: 'Hour Meter Awal', key: 'hour_meter_start', width: 18 },
      { header: 'Hour Meter Akhir', key: 'hour_meter_end', width: 18 },
      { header: 'Running Hours', key: 'running_hours', width: 15 },
      { header: 'Voltage (V)', key: 'voltage_v', width: 15 },
      { header: 'Current (A)', key: 'current_a', width: 15 },
      { header: 'Frequency (Hz)', key: 'frequency_hz', width: 15 },
      { header: 'Active Power (kW)', key: 'active_power_kw', width: 18 },
      { header: 'Reactive Power (kVAR)', key: 'reactive_power_kvar', width: 20 },
      { header: 'Power Factor', key: 'power_factor', width: 15 },
      { header: 'Energy Production (kWh)', key: 'energy_production_kwh', width: 22 },
      { header: 'Generator Status', key: 'generator_status', width: 18 },
      { header: 'RPM', key: 'rpm', width: 12 },
      { header: 'Bearing Temp (C)', key: 'bearing_temp_c', width: 18 },
      { header: 'Generator Temp (C)', key: 'generator_temp_c', width: 20 },
      { header: 'Turbine Temp (C)', key: 'turbine_temp_c', width: 18 },
      { header: 'Vibration (mm/s)', key: 'vibration_mms', width: 18 },
      { header: 'Flow Rate (m3/s)', key: 'flow_rate_m3s', width: 18 },
      { header: 'Water Level (m)', key: 'water_level_m', width: 18 },
      { header: 'Head (m)', key: 'head_m', width: 15 },
      { header: 'Pressure (bar)', key: 'pressure_bar', width: 15 },
      { header: 'Intake Condition', key: 'intake_condition', width: 18 },
      { header: 'Catatan', key: 'notes', width: 30 },
    ];

    worksheet.getRow(1).font = { bold: true };

    for (const entry of entries) {
      worksheet.addRow({
        id: entry.id,
        unit: entry.unit?.unit_code || entry.unit?.name || '',
        operator: entry.operator?.full_name || entry.operator?.username || '',
        date: entry.date.toISOString().split('T')[0],
        shift: entry.shift,
        unit_status: entry.unit_status,
        hour_meter_start: entry.hour_meter_start,
        hour_meter_end: entry.hour_meter_end,
        running_hours: entry.running_hours,
        voltage_v: entry.params_electrical?.voltage_v,
        current_a: entry.params_electrical?.current_a,
        frequency_hz: entry.params_electrical?.frequency_hz,
        active_power_kw: entry.params_electrical?.active_power_kw,
        reactive_power_kvar: entry.params_electrical?.reactive_power_kvar,
        power_factor: entry.params_electrical?.power_factor,
        energy_production_kwh: entry.params_electrical?.energy_production_kwh,
        generator_status: entry.params_electrical?.generator_status,
        rpm: entry.params_mechanical?.rpm,
        bearing_temp_c: entry.params_mechanical?.bearing_temp_c,
        generator_temp_c: entry.params_mechanical?.generator_temp_c,
        turbine_temp_c: entry.params_mechanical?.turbine_temp_c,
        vibration_mms: entry.params_mechanical?.vibration_mms,
        flow_rate_m3s: entry.params_hydraulic?.flow_rate_m3s,
        water_level_m: entry.params_hydraulic?.water_level_m,
        head_m: entry.params_hydraulic?.head_m,
        pressure_bar: entry.params_hydraulic?.pressure_bar,
        intake_condition: entry.params_hydraulic?.intake_condition,
        notes: entry.notes || '',
      });
    }

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="logbook-export.csv"');
      await workbook.csv.write(res);
      res.end();
    } else {
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', 'attachment; filename="logbook-export.xlsx"');
      await workbook.xlsx.write(res);
      res.end();
    }
  }

  async exportIncidents(filters: ExportIncidentsFilters, format: 'xlsx' | 'csv' = 'xlsx', res: Response): Promise<void> {
    const where: Prisma.incidentsWhereInput = {
      deleted_at: null,
    };

    if (filters.unit_id) {
      where.unit_id = filters.unit_id;
    }

    if (filters.from || filters.to) {
      where.occurred_at = {};
      if (filters.from) {
        where.occurred_at.gte = new Date(filters.from + 'T00:00:00Z');
      }
      if (filters.to) {
        where.occurred_at.lte = new Date(filters.to + 'T23:59:59.999Z');
      }
    }

    const incidents = await prisma.incidents.findMany({
      where,
      include: {
        unit: {
          select: { unit_code: true, name: true },
        },
        reporter: {
          select: { full_name: true, username: true },
        },
      },
      orderBy: {
        occurred_at: 'desc',
      },
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'HYDRO-MON System';
    const worksheet = workbook.addWorksheet('Gangguan');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Unit', key: 'unit', width: 15 },
      { header: 'Pelapor', key: 'reporter', width: 20 },
      { header: 'Waktu Kejadian', key: 'occurred_at', width: 25 },
      { header: 'Peralatan', key: 'equipment', width: 20 },
      { header: 'Jenis Gangguan', key: 'incident_type', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Deskripsi', key: 'description', width: 35 },
      { header: 'Tindakan Operator', key: 'operator_action', width: 35 },
      { header: 'Waktu Selesai', key: 'resolved_at', width: 25 },
    ];

    worksheet.getRow(1).font = { bold: true };

    for (const incident of incidents) {
      worksheet.addRow({
        id: incident.id,
        unit: incident.unit?.unit_code || incident.unit?.name || '',
        reporter: incident.reporter?.full_name || incident.reporter?.username || '',
        occurred_at: incident.occurred_at.toISOString(),
        equipment: incident.equipment,
        incident_type: incident.incident_type,
        status: incident.status,
        description: incident.description,
        operator_action: incident.operator_action || '',
        resolved_at: incident.resolved_at ? incident.resolved_at.toISOString() : '',
      });
    }

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="incidents-export.csv"');
      await workbook.csv.write(res);
      res.end();
    } else {
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', 'attachment; filename="incidents-export.xlsx"');
      await workbook.xlsx.write(res);
      res.end();
    }
  }

  async exportMaintenance(filters: ExportMaintenanceFilters, format: 'xlsx' | 'csv' = 'xlsx', res: Response): Promise<void> {
    const where: Prisma.maintenance_recordsWhereInput = {
      deleted_at: null,
    };

    if (filters.unit_id) {
      where.unit_id = filters.unit_id;
    }

    if (filters.from || filters.to) {
      where.planned_date = {};
      if (filters.from) {
        where.planned_date.gte = new Date(filters.from + 'T00:00:00Z');
      }
      if (filters.to) {
        where.planned_date.lte = new Date(filters.to + 'T23:59:59.999Z');
      }
    }

    const records = await prisma.maintenance_records.findMany({
      where,
      include: {
        unit: {
          select: { unit_code: true, name: true },
        },
        creator: {
          select: { full_name: true, username: true },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'HYDRO-MON System';
    const worksheet = workbook.addWorksheet('Pemeliharaan');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Unit', key: 'unit', width: 15 },
      { header: 'Pembuat', key: 'creator', width: 20 },
      { header: 'Peralatan', key: 'equipment', width: 20 },
      { header: 'Jenis Pekerjaan', key: 'work_type', width: 20 },
      { header: 'Deskripsi', key: 'description', width: 35 },
      { header: 'Teknisi', key: 'technician', width: 20 },
      { header: 'Rencana Tanggal', key: 'planned_date', width: 25 },
      { header: 'Status', key: 'status', width: 15 },
    ];

    worksheet.getRow(1).font = { bold: true };

    for (const record of records) {
      worksheet.addRow({
        id: record.id,
        unit: record.unit?.unit_code || record.unit?.name || '',
        creator: record.creator?.full_name || record.creator?.username || '',
        equipment: record.equipment,
        work_type: record.work_type,
        description: record.description,
        technician: record.technician || '',
        planned_date: record.planned_date ? record.planned_date.toISOString() : '',
        status: record.status,
      });
    }

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="maintenance-export.csv"');
      await workbook.csv.write(res);
      res.end();
    } else {
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', 'attachment; filename="maintenance-export.xlsx"');
      await workbook.xlsx.write(res);
      res.end();
    }
  }
}

export const exportService = new ExportService();
