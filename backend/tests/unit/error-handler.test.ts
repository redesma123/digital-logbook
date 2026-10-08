import { describe, it, expect, vi } from 'vitest';
import { errorHandler } from '../../src/middleware/error-handler.js';
import { AppError } from '../../src/lib/response.js';
import { z } from 'zod';

describe('errorHandler middleware', () => {
  it('should handle AppError', () => {
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;
    const err = new AppError(404, 'Not Found', 'Entity not found', [{ field: 'id' }]);
    errorHandler(err, {} as any, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 404,
      success: false,
      error: 'Not Found',
      message: 'Entity not found',
      details: [{ field: 'id' }],
    });
  });

  it('should handle ZodError', () => {
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;
    const schema = z.object({ email: z.string().email() });
    const result = schema.safeParse({ email: 'invalid' });
    expect(result.success).toBe(false);

    if (!result.success) {
      errorHandler(result.error, {} as any, res, vi.fn());
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: 400,
        success: false,
        error: 'Bad Request',
        message: 'Validasi input gagal',
        details: [{ field: 'email', message: result.error.errors[0].message }],
      });
    }
  });

  it('should handle generic unhandled Error', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;
    const err = new Error('Unexpected crash');
    errorHandler(err, {} as any, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 500,
      success: false,
      error: 'Internal Server Error',
      message: 'Terjadi kesalahan pada server',
    });
    consoleSpy.mockRestore();
  });
});
