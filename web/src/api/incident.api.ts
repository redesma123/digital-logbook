import { apiClient, ApiResponse } from './client';

export type IncidentStatus = 'OPEN' | 'PROCESS' | 'CLOSED';

export interface IncidentItem {
  id: number;
  unit_id: number;
  equipment: string;
  incident_type: string;
  description: string;
  action_taken?: string | null;
  status: IncidentStatus;
  reported_at: string;
  reported_by?: {
    id: number;
    full_name: string;
    username: string;
  };
  unit?: {
    id: number;
    unit_code: string;
    name: string;
  };
  status_histories?: Array<{
    id: number;
    from_status: IncidentStatus;
    to_status: IncidentStatus;
    changed_at: string;
    notes?: string;
    changer?: {
      full_name: string;
    };
  }>;
}

export interface IncidentListParams {
  unit_id?: number;
  status?: IncidentStatus;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface IncidentListResponse {
  data: IncidentItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface CreateIncidentPayload {
  unit_id: number;
  equipment: string;
  incident_type: string;
  description: string;
  action_taken?: string;
  reported_at?: string;
}

export const incidentApi = {
  async list(params?: IncidentListParams): Promise<IncidentListResponse> {
    const res = await apiClient.get<ApiResponse<any>>('/incidents', { params });
    const raw = res.data?.data || {};
    const items = Array.isArray(raw)
      ? raw
      : Array.isArray(raw.data)
      ? raw.data
      : Array.isArray(raw.items)
      ? raw.items
      : Array.isArray(raw.incidents)
      ? raw.incidents
      : [];

    return {
      data: items,
      meta: raw.pagination || raw.meta || { total: items.length, page: 1, limit: items.length, total_pages: 1 },
    };
  },

  async getById(id: number): Promise<IncidentItem> {
    const res = await apiClient.get<ApiResponse<IncidentItem>>(`/incidents/${id}`);
    return res.data.data;
  },

  async create(payload: CreateIncidentPayload): Promise<IncidentItem> {
    const res = await apiClient.post<ApiResponse<IncidentItem>>('/incidents', payload);
    return res.data.data;
  },

  async changeStatus(id: number, status: IncidentStatus, notes?: string): Promise<IncidentItem> {
    const res = await apiClient.patch<ApiResponse<IncidentItem>>(`/incidents/${id}/status`, {
      status,
      notes,
    });
    return res.data.data;
  },

  async update(id: number, payload: Partial<CreateIncidentPayload>): Promise<IncidentItem> {
    const res = await apiClient.patch<ApiResponse<IncidentItem>>(`/incidents/${id}`, payload);
    return res.data.data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/incidents/${id}`);
  },
};
