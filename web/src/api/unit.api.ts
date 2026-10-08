import { apiClient, ApiResponse } from './client';

export interface PlantInfo {
  id: number;
  name: string;
  location: string;
  capacity_kw?: number;
  design_flow_m3s?: number;
  design_head_m?: number;
}

export interface UnitItem {
  id: number;
  plant_id: number;
  unit_code: string;
  name: string;
  capacity?: number;
  current_status: string;
  created_at: string;
  updated_at: string;
  plant?: PlantInfo;
}

export type Unit = UnitItem;

export const unitApi = {
  async list(plantId?: number): Promise<UnitItem[]> {
    const res = await apiClient.get<ApiResponse<UnitItem[]>>('/units', {
      params: plantId ? { plant_id: plantId } : undefined,
    });
    return res.data.data;
  },

  async getById(id: number): Promise<UnitItem> {
    const res = await apiClient.get<ApiResponse<UnitItem>>(`/units/${id}`);
    return res.data.data;
  },
};
