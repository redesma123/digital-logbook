import { z } from 'zod';

export const dashboardSummarySchema = z.object({
  query: z.object({
    unit_id: z.coerce.number().int().positive({ message: 'unit_id wajib diisi dan berupa bilangan bulat positif' }),
  }),
});

export const dashboardChartSchema = z.object({
  query: z.object({
    unit_id: z.coerce.number().int().positive({ message: 'unit_id wajib diisi dan berupa bilangan bulat positif' }),
    parameter: z.enum([
      'active_power_kw',
      'voltage_v',
      'frequency_hz',
      'flow_rate_m3s',
      'water_level_m',
      'energy_production_kwh',
    ], {
      errorMap: () => ({ message: 'Parameter tidak valid' }),
    }),
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format from harus YYYY-MM-DD').optional(),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format to harus YYYY-MM-DD').optional(),
  }),
});

export type DashboardSummaryQuery = z.infer<typeof dashboardSummarySchema>['query'];
export type DashboardChartQuery = z.infer<typeof dashboardChartSchema>['query'];
