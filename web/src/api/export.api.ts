import { apiClient } from './client';

export interface ExportParams {
  unit_id?: number;
  from?: string;
  to?: string;
  shift?: 'PAGI' | 'SIANG' | 'MALAM';
  format?: 'xlsx' | 'csv';
}

function triggerDownload(data: Blob, defaultFilename: string) {
  const url = window.URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', defaultFilename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export const exportApi = {
  async downloadLogbook(params?: ExportParams): Promise<void> {
    const format = params?.format || 'xlsx';
    const response = await apiClient.get('/export/logbook', {
      params,
      responseType: 'blob',
    });
    const filename = `Logbook_PLTMH_${new Date().toISOString().split('T')[0]}.${format}`;
    triggerDownload(response.data, filename);
  },

  async downloadIncidents(params?: ExportParams): Promise<void> {
    const format = params?.format || 'xlsx';
    const response = await apiClient.get('/export/incidents', {
      params,
      responseType: 'blob',
    });
    const filename = `Laporan_Gangguan_${new Date().toISOString().split('T')[0]}.${format}`;
    triggerDownload(response.data, filename);
  },

  async downloadMaintenance(params?: ExportParams): Promise<void> {
    const format = params?.format || 'xlsx';
    const response = await apiClient.get('/export/maintenance', {
      params,
      responseType: 'blob',
    });
    const filename = `Laporan_Pemeliharaan_${new Date().toISOString().split('T')[0]}.${format}`;
    triggerDownload(response.data, filename);
  },
};
