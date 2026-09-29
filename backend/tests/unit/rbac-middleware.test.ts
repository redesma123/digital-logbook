import { describe, it, expect, vi } from 'vitest';
import { authorize } from '../../src/middleware/rbac.js';
import type { Request, Response, NextFunction } from 'express';

describe('authorize middleware', () => {
  it('should return 401 if req.user is missing', () => {
    const req = {} as Request;
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const res = { status } as unknown as Response;
    const next = vi.fn() as NextFunction;

    const middleware = authorize('ADMIN');
    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({
      statusCode: 401,
      success: false,
      error: 'Unauthorized',
      message: 'Autentikasi diperlukan',
    });
  });

  it('should return 403 if role is not allowed', () => {
    const req = {
      user: { userId: 2, username: 'operator1', role: 'OPERATOR' },
    } as unknown as Request;
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const res = { status } as unknown as Response;
    const next = vi.fn() as NextFunction;

    const middleware = authorize('ADMIN', 'SUPERVISOR');
    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith({
      statusCode: 403,
      success: false,
      error: 'Forbidden',
      message: 'Anda tidak memiliki hak akses untuk operasi ini',
    });
  });

  it('should call next if role is allowed', () => {
    const req = {
      user: { userId: 1, username: 'admin', role: 'ADMIN' },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    const middleware = authorize('ADMIN', 'SUPERVISOR');
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
