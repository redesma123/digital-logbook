import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { validate } from '../../src/middleware/validate.js';
import type { Request, Response, NextFunction } from 'express';

describe('validate middleware', () => {
  const schema = z.object({
    body: z.object({
      username: z.string().min(3),
    }),
  });

  it('should call next when validation passes', async () => {
    const req = {
      body: { username: 'validUser' },
      query: {},
      params: {},
    } as unknown as Request;

    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    const middleware = validate(schema);
    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('should return 400 when validation fails', async () => {
    const req = {
      body: { username: 'ab' },
      query: {},
      params: {},
    } as unknown as Request;

    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const res = { status } as unknown as Response;
    const next = vi.fn() as NextFunction;

    const middleware = validate(schema);
    await middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      statusCode: 400,
      success: false,
      error: 'Bad Request',
      message: 'Validasi input gagal',
      details: [
        {
          field: 'username',
          message: 'String must contain at least 3 character(s)',
        },
      ],
    });
  });
});
