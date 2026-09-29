import { z } from 'zod';

export const analyticsPerformanceSchema = z.object({
  query: z.object({
    unit_id: z.coerce.number().int().positive({ message: 'unit_id wajib diisi dan berupa bilangan bulat positif' }),
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format from harus YYYY-MM-DD'),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format to harus YYYY-MM-DD'),
  }),
});

export type AnalyticsPerformanceQuery = z.infer<typeof analyticsPerformanceSchema>['query'];
