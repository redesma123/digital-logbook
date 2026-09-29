import { z } from 'zod';

export const createIncidentSchema = z.object({
  body: z.object({
    unit_id: z.number().int().positive('unit_id wajib diisi'),
    occurred_at: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Format occurred_at harus ISO datetime valid',
    }),
    equipment: z.string().min(1, 'equipment wajib diisi'),
    incident_type: z.string().min(1, 'incident_type wajib diisi'),
    description: z.string().min(1, 'description wajib diisi'),
    operator_action: z.string().nullable().optional(),
  }),
});

export const updateIncidentSchema = z.object({
  body: z.object({
    equipment: z.string().min(1).optional(),
    incident_type: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    operator_action: z.string().nullable().optional(),
    occurred_at: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Format occurred_at harus ISO datetime valid',
      })
      .optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
});

export const changeIncidentStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PROCESS', 'CLOSED'], {
      errorMap: () => ({ message: 'Status harus PROCESS atau CLOSED' }),
    }),
    notes: z.string().optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
});

export const listIncidentSchema = z.object({
  query: z.object({
    unit_id: z.coerce.number().int().positive().optional(),
    status: z.enum(['OPEN', 'PROCESS', 'CLOSED']).optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    page: z.coerce.number().int().positive().default(1).optional(),
    limit: z.coerce.number().int().positive().max(100).default(10).optional(),
  }),
});

export const incidentIdParamSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export type CreateIncidentBody = z.infer<typeof createIncidentSchema>['body'];
export type UpdateIncidentBody = z.infer<typeof updateIncidentSchema>['body'];
export type ChangeIncidentStatusBody = z.infer<typeof changeIncidentStatusSchema>['body'];
export type ListIncidentQuery = z.infer<typeof listIncidentSchema>['query'];
