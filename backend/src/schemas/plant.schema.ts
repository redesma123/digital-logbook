import { z } from 'zod';

export const createPlantSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Nama plant wajib diisi'),
    location: z.string().min(1, 'Lokasi wajib diisi'),
    capacity_kw: z.number().positive().optional(),
    design_flow_m3s: z.number().positive().optional(),
    design_head_m: z.number().positive().optional(),
  }),
});

export const updatePlantSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    location: z.string().min(1).optional(),
    capacity_kw: z.number().positive().nullable().optional(),
    design_flow_m3s: z.number().positive().nullable().optional(),
    design_head_m: z.number().positive().nullable().optional(),
  }),
  params: z.object({ id: z.string() }),
});

export const plantIdParamSchema = z.object({
  params: z.object({ id: z.string() }),
});
