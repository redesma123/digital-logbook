import { z } from 'zod';

const electricalSchema = z.object({
  voltage_v: z.number().min(0).max(500).nullable().optional(),
  current_a: z.number().min(0).max(1000).nullable().optional(),
  frequency_hz: z.number().min(45).max(55).nullable().optional(),
  active_power_kw: z.number().min(0).nullable().optional(),
  reactive_power_kvar: z.number().min(0).nullable().optional(),
  power_factor: z.number().min(0).max(1).nullable().optional(),
  energy_production_kwh: z.number().min(0).nullable().optional(),
  generator_status: z.string().nullable().optional(),
}).optional();

const mechanicalSchema = z.object({
  rpm: z.number().min(0).max(2000).nullable().optional(),
  bearing_temp_c: z.number().min(0).max(120).nullable().optional(),
  generator_temp_c: z.number().min(0).max(150).nullable().optional(),
  turbine_temp_c: z.number().min(0).max(150).nullable().optional(),
  vibration_mms: z.number().min(0).max(50).nullable().optional(),
}).optional();

const hydraulicSchema = z.object({
  flow_rate_m3s: z.number().min(0).nullable().optional(),
  water_level_m: z.number().min(0).nullable().optional(),
  head_m: z.number().min(0).nullable().optional(),
  pressure_bar: z.number().min(0).nullable().optional(),
  intake_condition: z.string().nullable().optional(),
}).optional();

export const createLogbookSchema = z.object({
  body: z.object({
    unit_id: z.number().int().positive(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
    shift: z.enum(['PAGI', 'SIANG', 'MALAM']),
    unit_status: z.enum(['RUNNING', 'STANDBY', 'TRIP', 'OFFLINE']),
    hour_meter_start: z.number().min(0).nullable().optional(),
    hour_meter_end: z.number().min(0).nullable().optional(),
    running_hours: z.number().min(0).max(8).nullable().optional(),
    notes: z.string().nullable().optional(),
    electrical: electricalSchema,
    mechanical: mechanicalSchema,
    hydraulic: hydraulicSchema,
  }),
});

export const updateLogbookSchema = z.object({
  body: z.object({
    unit_status: z.enum(['RUNNING', 'STANDBY', 'TRIP', 'OFFLINE']).optional(),
    hour_meter_start: z.number().min(0).nullable().optional(),
    hour_meter_end: z.number().min(0).nullable().optional(),
    running_hours: z.number().min(0).max(8).nullable().optional(),
    notes: z.string().nullable().optional(),
    electrical: electricalSchema,
    mechanical: mechanicalSchema,
    hydraulic: hydraulicSchema,
  }),
  params: z.object({ id: z.string() }),
});

export const listLogbookSchema = z.object({
  query: z.object({
    unit_id: z.coerce.number().int().positive().optional(),
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    shift: z.enum(['PAGI', 'SIANG', 'MALAM']).optional(),
    page: z.coerce.number().int().positive().default(1).optional(),
    limit: z.coerce.number().int().positive().max(100).default(10).optional(),
  }),
});

export const latestCounterSchema = z.object({
  query: z.object({
    unit_id: z.coerce.number().int().positive({ message: 'unit_id wajib diisi' }),
  }),
});

export type CreateLogbookBody = z.infer<typeof createLogbookSchema>['body'];
export type UpdateLogbookBody = z.infer<typeof updateLogbookSchema>['body'];
export type ListLogbookQuery = z.infer<typeof listLogbookSchema>['query'];
