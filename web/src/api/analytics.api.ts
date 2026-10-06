import { apiClient, ApiResponse } from './client';

export interface PerformanceMetrics {
  availability_pct: number;
  capacity_factor_pct: number;
  total_energy_kwh: number;
  total_running_hours: number;
  average_flow_m3_s: number;
  water_utilization_pct: number;
}

export interface PerformanceAnalytics {
  period: {
    from: string;
    to: string;
    period_days: number;
    period_hours: number;
  };
  unit?: {
    id: number;
    unit_code: string;
    name: string;
    plant_name?: string;
  };
  availability_pct?: number;
  capacity_factor_pct?: number;
  total_energy_kwh?: number;
  avg_flow_utilization_pct?: number;
  trend_vs_previous_period?: {
    availability_delta: number;
    capacity_factor_delta: number;
  };
  metrics: PerformanceMetrics;
}

export const analyticsApi = {
  async getPerformance(unitId: number, from: string, to: string): Promise<PerformanceAnalytics> {
    const res = await apiClient.get<ApiResponse<any>>('/analytics/performance', {
      params: { unit_id: unitId, from, to },
    });
    const raw = res.data?.data || {};

    // Normalisasi struktur data backend ke format yang diharapkan frontend
    const metrics: PerformanceMetrics = {
      availability_pct: raw.metrics?.availability_pct ?? raw.availability_pct ?? 0,
      capacity_factor_pct: raw.metrics?.capacity_factor_pct ?? raw.capacity_factor_pct ?? 0,
      total_energy_kwh: raw.metrics?.total_energy_kwh ?? raw.total_energy_kwh ?? 0,
      total_running_hours: raw.metrics?.total_running_hours ?? raw.total_running_hours ?? 0,
      average_flow_m3_s: raw.metrics?.average_flow_m3_s ?? raw.average_flow_m3_s ?? 0,
      water_utilization_pct: raw.metrics?.water_utilization_pct ?? raw.avg_flow_utilization_pct ?? 0,
    };

    return {
      period: {
        from: raw.period?.from || from,
        to: raw.period?.to || to,
        period_days: raw.period?.period_days ?? 30,
        period_hours: raw.period?.period_hours ?? 720,
      },
      unit: raw.unit || { id: unitId, unit_code: `U${unitId}`, name: `PLTMH Unit ${unitId}` },
      availability_pct: metrics.availability_pct,
      capacity_factor_pct: metrics.capacity_factor_pct,
      total_energy_kwh: metrics.total_energy_kwh,
      avg_flow_utilization_pct: metrics.water_utilization_pct,
      trend_vs_previous_period: raw.trend_vs_previous_period,
      metrics,
    };
  },
};
