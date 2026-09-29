import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/response.js';

export class DashboardService {
  async getSummary(unitId: number) {
    if (isNaN(unitId)) {
      throw new AppError(400, 'Bad Request', 'unit_id tidak valid');
    }

    // 1. Fetch unit
    const unit = await prisma.units.findUnique({
      where: { id: unitId },
      select: {
        id: true,
        unit_code: true,
        name: true,
        current_status: true,
      },
    });

    if (!unit) {
      throw new AppError(404, 'Not Found', 'Unit tidak ditemukan');
    }

    // 2. Fetch latest non-deleted logbook entry for this unit
    const latestEntry = await prisma.logbook_entries.findFirst({
      where: {
        unit_id: unitId,
        deleted_at: null,
      },
      orderBy: [
        { date: 'desc' },
        { shift: 'desc' },
      ],
      include: {
        params_electrical: true,
        params_mechanical: true,
        params_hydraulic: true,
      },
    });

    // 3. Calculate today_energy_kwh
    const todayStr = new Date().toISOString().split('T')[0];
    const todayDate = new Date(todayStr + 'T00:00:00Z');

    const todayEntries = await prisma.logbook_entries.findMany({
      where: {
        unit_id: unitId,
        deleted_at: null,
        date: todayDate,
      },
      include: {
        params_electrical: {
          select: { energy_production_kwh: true },
        },
      },
    });

    const today_energy_kwh = todayEntries.reduce((sum, e) => {
      return sum + (e.params_electrical?.energy_production_kwh ?? 0);
    }, 0);

    // 4. Count active incidents (OPEN or PROCESS)
    const active_incidents_count = await prisma.incidents.count({
      where: {
        unit_id: unitId,
        deleted_at: null,
        status: { in: ['OPEN', 'PROCESS'] },
      },
    });

    // 5. Count active maintenance (PLAN or PROCESS)
    const active_maintenance_count = await prisma.maintenance_records.count({
      where: {
        unit_id: unitId,
        deleted_at: null,
        status: { in: ['PLAN', 'PROCESS'] },
      },
    });

    const formattedLatestEntry = latestEntry
      ? {
          id: latestEntry.id,
          date: latestEntry.date.toISOString().split('T')[0],
          shift: latestEntry.shift,
          unit_status: latestEntry.unit_status,
          hour_meter_start: latestEntry.hour_meter_start,
          hour_meter_end: latestEntry.hour_meter_end,
          running_hours: latestEntry.running_hours,
          notes: latestEntry.notes,
          electrical: latestEntry.params_electrical,
          mechanical: latestEntry.params_mechanical,
          hydraulic: latestEntry.params_hydraulic,
          params_electrical: latestEntry.params_electrical,
          params_mechanical: latestEntry.params_mechanical,
          params_hydraulic: latestEntry.params_hydraulic,
        }
      : null;

    return {
      unit,
      latest_entry: formattedLatestEntry,
      today_energy_kwh: Number(today_energy_kwh.toFixed(2)),
      active_incidents_count,
      active_maintenance_count,
    };
  }

  async getChart(unitId: number, parameter: string, from?: string, to?: string) {
    if (isNaN(unitId)) {
      throw new AppError(400, 'Bad Request', 'unit_id tidak valid');
    }

    const unit = await prisma.units.findUnique({
      where: { id: unitId },
    });

    if (!unit) {
      throw new AppError(404, 'Not Found', 'Unit tidak ditemukan');
    }

    const where: Prisma.logbook_entriesWhereInput = {
      unit_id: unitId,
      deleted_at: null,
    };

    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from + 'T00:00:00Z');
      if (to) where.date.lte = new Date(to + 'T00:00:00Z');
    }

    const isElectrical = ['active_power_kw', 'voltage_v', 'frequency_hz', 'energy_production_kwh'].includes(parameter);
    const isHydraulic = ['flow_rate_m3s', 'water_level_m'].includes(parameter);

    const entries = await prisma.logbook_entries.findMany({
      where,
      include: {
        params_electrical: isElectrical,
        params_hydraulic: isHydraulic,
      },
      orderBy: [
        { date: 'asc' },
        { shift: 'asc' },
      ],
    });

    return entries.map((entry) => {
      let val: number | null = null;
      if (isElectrical && entry.params_electrical) {
        val = (entry.params_electrical as any)[parameter] ?? null;
      } else if (isHydraulic && entry.params_hydraulic) {
        val = (entry.params_hydraulic as any)[parameter] ?? null;
      }
      return {
        date: entry.date.toISOString().split('T')[0],
        shift: entry.shift,
        value: val !== null && val !== undefined ? Number(val) : null,
      };
    });
  }
}

export const dashboardService = new DashboardService();
