import { z } from 'zod';

export const createMaintenanceSchema = z.object({
  body: z.object({
    unit_id: z.number().int().positive('unit_id wajib diisi'),
    equipment: z.string().min(1, 'equipment wajib diisi'),
    work_type: z.string().min(1, 'work_type wajib diisi'),
    description: z.string().min(1, 'description wajib diisi'),
    technician: z.string().nullable().optional(),
    planned_date: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Format planned_date harus ISO datetime valid',
      })
      .nullable()
      .optional(),
  }),
});

export const updateMaintenanceSchema = z.object({
  body: z.object({
    equipment: z.string().min(1).optional(),
    work_type: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    technician: z.string().nullable().optional(),
    planned_date: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Format planned_date harus ISO datetime valid',
      })
      .nullable()
      .optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
});

export const changeMaintenanceStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PROCESS', 'COMPLETE'], {
      errorMap: () => ({ message: 'Status harus PROCESS atau COMPLETE' }),
    }),
    notes: z.string().optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
});

export const listMaintenanceSchema = z.object({
  query: z.object({
    unit_id: z.coerce.number().int().positive().optional(),
    status: z.enum(['PLAN', 'PROCESS', 'COMPLETE']).optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    page: z.coerce.number().int().positive().default(1).optional(),
    limit: z.coerce.number().int().positive().max(100).default(10).optional(),
  }),
});

export const maintenanceIdParamSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export type CreateMaintenanceBody = z.infer<typeof createMaintenanceSchema>['body'];
export type UpdateMaintenanceBody = z.infer<typeof updateMaintenanceSchema>['body'];
export type ChangeMaintenanceStatusBody = z.infer<typeof changeMaintenanceStatusSchema>['body'];
export type ListMaintenanceQuery = z.infer<typeof listMaintenanceSchema>['query'];
