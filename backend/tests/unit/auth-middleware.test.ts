import { describe, it, expect, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { authenticate } from '../../src/middleware/auth.js';
import { env } from '../../src/lib/env.js';
import type { Request, Response, NextFunction } from 'express';

describe('authenticate middleware', () => {
  it('should return 401 if authorization header is missing', () => {
    const req = { headers: {} } as Request;
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const res = { status } as unknown as Response;
    const next = vi.fn() as NextFunction;

    authenticate(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({
      statusCode: 401,
      success: false,
      error: 'Unauthorized',
      message: 'Token tidak ditemukan',
    });
  });

  it('should return 401 if token is invalid', () => {
    const req = {
      headers: { authorization: 'Bearer invalid.token.here' },
    } as Request;
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const res = { status } as unknown as Response;
    const next = vi.fn() as NextFunction;

    authenticate(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({
      statusCode: 401,
      success: false,
      error: 'Unauthorized',
      message: 'Token tidak valid atau sudah kedaluwarsa',
    });
  });

  it('should set req.user and call next() for valid token', () => {
    const payload = { userId: 1, username: 'admin', role: 'ADMIN' };
    const token = jwt.sign(payload, env.JWT_SECRET);
    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    authenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toMatchObject(payload);
  });
});
