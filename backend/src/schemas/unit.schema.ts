import { z } from 'zod';

export const createUnitSchema = z.object({
  body: z.object({
    plant_id: z.number().int().positive(),
    unit_code: z.string().min(1, 'Kode unit wajib diisi'),
    name: z.string().min(1, 'Nama unit wajib diisi'),
  }),
});

export const updateUnitSchema = z.object({
  body: z.object({
    unit_code: z.string().min(1).optional(),
    name: z.string().min(1).optional(),
    current_status: z.enum(['RUNNING', 'STANDBY', 'TRIP', 'OFFLINE']).optional(),
  }),
  params: z.object({ id: z.string() }),
});

export const listUnitsSchema = z.object({
  query: z.object({
    plant_id: z.coerce.number().int().positive().optional(),
  }),
});

export const unitIdParamSchema = z.object({
  params: z.object({ id: z.string() }),
});
