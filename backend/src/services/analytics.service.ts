import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/response.js';

export class AnalyticsService {
  async getPerformance(unitId: number, fromStr: string, toStr: string) {
    if (isNaN(unitId)) {
      throw new AppError(400, 'Bad Request', 'unit_id tidak valid');
    }

    const fromDate = new Date(fromStr + 'T00:00:00Z');
    const toDate = new Date(toStr + 'T00:00:00Z');

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw new AppError(400, 'Bad Request', 'Format tanggal tidak valid');
    }

    if (toDate < fromDate) {
      throw new AppError(400, 'Bad Request', 'Parameter to harus setelah atau sama dengan from');
    }

    // 1. Calculate period duration in days and hours
    // (toDate - fromDate + 1 day) * 24
    const diffTime = toDate.getTime() - fromDate.getTime();
    const period_days = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const period_hours = period_days * 24;

    // 2. Fetch unit with its plant
    const unit = await prisma.units.findUnique({
      where: { id: unitId },
      include: { plant: true },
    });

    if (!unit) {
      throw new AppError(404, 'Not Found', 'Unit tidak ditemukan');
    }

    const capacity_kw = unit.plant?.capacity_kw ?? 0;
    const design_flow_m3s = unit.plant?.design_flow_m3s ?? 0;

    // 3. Fetch all non-deleted logbook entries for unit in range [from, to]
    const entries = await prisma.logbook_entries.findMany({
      where: {
        unit_id: unitId,
        deleted_at: null,
        date: {
          gte: fromDate,
          lte: toDate,
        },
      },
      include: {
        params_electrical: true,
        params_hydraulic: true,
      },
    });

    // 4. Compute formulas
    const total_running_hours = entries.reduce((sum, e) => sum + (e.running_hours ?? 0), 0);
    const availability_pct = period_hours > 0 ? Math.min(100, (total_running_hours / period_hours) * 100) : 0;
    const total_energy_kwh = entries.reduce((sum, e) => sum + (e.params_electrical?.energy_production_kwh ?? 0), 0);
    const capacity_factor_pct = (capacity_kw > 0 && period_hours > 0)
      ? (total_energy_kwh / (capacity_kw * period_hours)) * 100
      : 0;

    const flowRates = entries
      .map((e) => e.params_hydraulic?.flow_rate_m3s)
      .filter((v): v is number => v !== null && v !== undefined);
    const avg_flow_rate = flowRates.length > 0 ? flowRates.reduce((a, b) => a + b, 0) / flowRates.length : 0;
    const avg_flow_utilization_pct = design_flow_m3s > 0 ? (avg_flow_rate / design_flow_m3s) * 100 : 0;

    // 5. Calculate trend vs previous period of same length
    // prev_from = from - period_days, prev_to = from - 1 day
    const prevToDate = new Date(fromDate.getTime() - 24 * 60 * 60 * 1000);
    const prevFromDate = new Date(fromDate.getTime() - period_days * 24 * 60 * 60 * 1000);

    const prevEntries = await prisma.logbook_entries.findMany({
      where: {
        unit_id: unitId,
        deleted_at: null,
        date: {
          gte: prevFromDate,
          lte: prevToDate,
        },
      },
      include: {
        params_electrical: true,
      },
    });

    const prev_running_hours = prevEntries.reduce((sum, e) => sum + (e.running_hours ?? 0), 0);
    const prev_availability = period_hours > 0 ? Math.min(100, (prev_running_hours / period_hours) * 100) : 0;
    const prev_energy = prevEntries.reduce((sum, e) => sum + (e.params_electrical?.energy_production_kwh ?? 0), 0);
    const prev_capacity_factor = (capacity_kw > 0 && period_hours > 0)
      ? (prev_energy / (capacity_kw * period_hours)) * 100
      : 0;

    const availability_delta = Number((availability_pct - prev_availability).toFixed(2));
    const capacity_factor_delta = Number((capacity_factor_pct - prev_capacity_factor).toFixed(2));

    return {
      period: { from: fromStr, to: toStr },
      availability_pct: Number(availability_pct.toFixed(2)),
      capacity_factor_pct: Number(capacity_factor_pct.toFixed(2)),
      total_energy_kwh: Number(total_energy_kwh.toFixed(2)),
      avg_flow_utilization_pct: Number(avg_flow_utilization_pct.toFixed(2)),
      trend_vs_previous_period: {
        availability_delta,
        capacity_factor_delta,
      },
    };
  }
}

export const analyticsService = new AnalyticsService();
