import { apiClient, ApiResponse } from './client';

export type ShiftType = 'PAGI' | 'SIANG' | 'MALAM';
export type UnitOperationalStatus = 'RUNNING' | 'STANDBY' | 'TRIP' | 'OFFLINE';

export interface LogbookItem {
  id: number;
  unit_id: number;
  date: string;
  shift: ShiftType;
  unit_status: UnitOperationalStatus;
  hour_meter_start?: number;
  hour_meter_end?: number;
  running_hours?: number;
  notes?: string;
  created_at: string;
  operator?: {
    id: number;
    full_name: string;
    username: string;
  };
  unit?: {
    id: number;
    unit_code: string;
    name: string;
  };
  params_electrical?: {
    voltage_v?: number;
    current_a?: number;
    frequency_hz?: number;
    active_power_kw?: number;
    reactive_power_kvar?: number;
    power_factor?: number;
    energy_production_kwh?: number;
  };
  params_mechanical?: {
    bearing_temp_c?: number;
    winding_temp_c?: number;
    cooling_water_temp_c?: number;
    vibration_mm_s?: number;
    oil_pressure_bar?: number;
  };
  params_hydraulic?: {
    water_level_m?: number;
    water_flow_m3_s?: number;
    guide_vane_opening_pct?: number;
  };
}

export type LogbookEntry = LogbookItem;

export interface LogbookListParams {
  unit_id?: number;
  from?: string;
  to?: string;
  shift?: ShiftType;
  page?: number;
  limit?: number;
}

export interface LogbookListResponse {
  data: LogbookItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export const logbookApi = {
  async list(params?: LogbookListParams): Promise<LogbookListResponse> {
    const res = await apiClient.get<ApiResponse<LogbookListResponse>>('/logbook', { params });
    return res.data.data;
  },

  async getById(id: number): Promise<LogbookItem> {
    const res = await apiClient.get<ApiResponse<LogbookItem>>(`/logbook/${id}`);
    return res.data.data;
  },

  async getLatestCounter(unitId: number): Promise<{
    hour_meter_end: number;
    energy_counter_end_kwh?: number;
  }> {
    const res = await apiClient.get<ApiResponse<{
      hour_meter_end: number;
      energy_counter_end_kwh?: number;
    }>>('/logbook/latest-counter', {
      params: { unit_id: unitId },
    });
    return res.data.data;
  },
};
