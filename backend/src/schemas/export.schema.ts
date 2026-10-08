import { z } from 'zod';

export const exportLogbookSchema = z.object({
  query: z.object({
    unit_id: z.coerce.number().int().positive().optional(),
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format from harus YYYY-MM-DD').optional(),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format to harus YYYY-MM-DD').optional(),
    shift: z.enum(['PAGI', 'SIANG', 'MALAM']).optional(),
    format: z.enum(['xlsx', 'csv']).default('xlsx').optional(),
  }),
});

export const exportIncidentsSchema = z.object({
  query: z.object({
    unit_id: z.coerce.number().int().positive().optional(),
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format from harus YYYY-MM-DD').optional(),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format to harus YYYY-MM-DD').optional(),
    format: z.enum(['xlsx', 'csv']).default('xlsx').optional(),
  }),
});

export const exportMaintenanceSchema = z.object({
  query: z.object({
    unit_id: z.coerce.number().int().positive().optional(),
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format from harus YYYY-MM-DD').optional(),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format to harus YYYY-MM-DD').optional(),
    format: z.enum(['xlsx', 'csv']).default('xlsx').optional(),
  }),
});

export type ExportLogbookQuery = z.infer<typeof exportLogbookSchema>['query'];
export type ExportIncidentsQuery = z.infer<typeof exportIncidentsSchema>['query'];
export type ExportMaintenanceQuery = z.infer<typeof exportMaintenanceSchema>['query'];
