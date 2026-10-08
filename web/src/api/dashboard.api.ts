import { apiClient, ApiResponse } from './client';

export interface DashboardSummary {
  unit: {
    id: number;
    unit_code: string;
    name: string;
    current_status: string;
  };
  latest_entry: {
    id: number;
    date: string;
    shift: string;
    unit_status: string;
    hour_meter_start?: number;
    hour_meter_end?: number;
    running_hours?: number;
    notes?: string;
    electrical?: {
      voltage_v?: number;
      current_a?: number;
      frequency_hz?: number;
      active_power_kw?: number;
      reactive_power_kvar?: number;
      power_factor?: number;
      energy_production_kwh?: number;
      generator_status?: string;
    };
    mechanical?: {
      rpm?: number;
      bearing_temp_c?: number;
      generator_temp_c?: number;
      turbine_temp_c?: number;
      vibration_mms?: number;
      vibration_mm_s?: number;
      oil_pressure_bar?: number;
    };
    hydraulic?: {
      flow_rate_m3s?: number;
      water_flow_m3_s?: number;
      water_level_m?: number;
      head_m?: number;
      pressure_bar?: number;
      intake_condition?: string;
      guide_vane_opening_pct?: number;
    };
  } | null;
  today_energy_kwh: number;
  active_incidents_count: number;
  active_maintenance_count: number;
}

export interface DashboardChartPoint {
  date: string;
  shift: string;
  value: number;
}

export const dashboardApi = {
  async getSummary(unitId: number): Promise<DashboardSummary> {
    const res = await apiClient.get<ApiResponse<DashboardSummary>>('/dashboard/summary', {
      params: { unit_id: unitId },
    });
    return res.data.data;
  },

  async getChart(unitId: number, parameter: string, from?: string, to?: string): Promise<DashboardChartPoint[]> {
    const res = await apiClient.get<ApiResponse<DashboardChartPoint[]>>('/dashboard/chart', {
      params: { unit_id: unitId, parameter, from, to },
    });
    return res.data.data;
  },
};
