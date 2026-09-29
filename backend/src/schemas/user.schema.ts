import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    username: z.string().min(3, 'Username minimal 3 karakter'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    fullName: z.string().min(1, 'Nama lengkap wajib diisi'),
    role: z.enum(['OPERATOR', 'SUPERVISOR', 'MANAGEMENT', 'ADMIN']),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    fullName: z.string().min(1).optional(),
    role: z.enum(['OPERATOR', 'SUPERVISOR', 'MANAGEMENT', 'ADMIN']).optional(),
    is_active: z.boolean().optional(),
    password: z.string().min(6).optional(),
  }),
  params: z.object({ id: z.string() }),
});

export const listUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1).optional(),
    limit: z.coerce.number().int().positive().max(100).default(10).optional(),
    role: z.enum(['OPERATOR', 'SUPERVISOR', 'MANAGEMENT', 'ADMIN']).optional(),
  }),
});

export const userIdParamSchema = z.object({
  params: z.object({ id: z.string() }),
});
