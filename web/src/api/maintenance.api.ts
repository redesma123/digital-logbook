import { apiClient, ApiResponse } from './client';

export type MaintenanceStatus = 'PLAN' | 'PROCESS' | 'COMPLETE';

export interface MaintenanceItem {
  id: number;
  unit_id: number;
  equipment: string;
  work_type: string;
  description: string;
  technician?: string | null;
  scheduled_date: string;
  completed_date?: string | null;
  status: MaintenanceStatus;
  created_at: string;
  unit?: {
    id: number;
    unit_code: string;
    name: string;
  };
  created_by?: {
    id: number;
    full_name: string;
  };
  status_histories?: Array<{
    id: number;
    from_status: MaintenanceStatus;
    to_status: MaintenanceStatus;
    changed_at: string;
    notes?: string;
    changer?: {
      full_name: string;
    };
  }>;
}

export interface MaintenanceListParams {
  unit_id?: number;
  status?: MaintenanceStatus;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface MaintenanceListResponse {
  data: MaintenanceItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface CreateMaintenancePayload {
  unit_id: number;
  equipment: string;
  work_type: string;
  description: string;
  technician?: string;
  scheduled_date: string;
}

export const maintenanceApi = {
  async list(params?: MaintenanceListParams): Promise<MaintenanceListResponse> {
    const res = await apiClient.get<ApiResponse<any>>('/maintenance', { params });
    const raw = res.data?.data || {};
    const items = Array.isArray(raw)
      ? raw
      : Array.isArray(raw.data)
      ? raw.data
      : Array.isArray(raw.items)
      ? raw.items
      : Array.isArray(raw.maintenance)
      ? raw.maintenance
      : [];

    return {
      data: items,
      meta: raw.pagination || raw.meta || { total: items.length, page: 1, limit: items.length, total_pages: 1 },
    };
  },

  async getById(id: number): Promise<MaintenanceItem> {
    const res = await apiClient.get<ApiResponse<MaintenanceItem>>(`/maintenance/${id}`);
    return res.data.data;
  },

  async create(payload: CreateMaintenancePayload): Promise<MaintenanceItem> {
    const res = await apiClient.post<ApiResponse<MaintenanceItem>>('/maintenance', payload);
    return res.data.data;
  },

  async changeStatus(id: number, status: MaintenanceStatus, notes?: string): Promise<MaintenanceItem> {
    const res = await apiClient.patch<ApiResponse<MaintenanceItem>>(`/maintenance/${id}/status`, {
      status,
      notes,
    });
    return res.data.data;
  },

  async update(id: number, payload: Partial<CreateMaintenancePayload>): Promise<MaintenanceItem> {
    const res = await apiClient.patch<ApiResponse<MaintenanceItem>>(`/maintenance/${id}`, payload);
    return res.data.data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/maintenance/${id}`);
  },
};
