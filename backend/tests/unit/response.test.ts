import { describe, it, expect, vi } from 'vitest';
import { sendSuccess, sendError, AppError } from '../../src/lib/response.js';

describe('sendSuccess', () => {
  it('should format success response with data', () => {
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;
    sendSuccess(res, 200, 'OK', { id: 1 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 200,
      success: true,
      message: 'OK',
      data: { id: 1 },
    });
  });

  it('should format success response without data', () => {
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;
    sendSuccess(res, 200, 'OK');
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 200,
      success: true,
      message: 'OK',
    });
  });
});

describe('sendError', () => {
  it('should format error response with details', () => {
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;
    sendError(res, 400, 'Bad Request', 'Validasi gagal', [{ field: 'x', message: 'wajib' }]);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 400,
      success: false,
      error: 'Bad Request',
      message: 'Validasi gagal',
      details: [{ field: 'x', message: 'wajib' }],
    });
  });

  it('should format error response without details', () => {
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;
    sendError(res, 500, 'Internal Server Error', 'Something broke');
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 500,
      success: false,
      error: 'Internal Server Error',
      message: 'Something broke',
    });
  });
});

describe('AppError', () => {
  it('should create error with statusCode', () => {
    const err = new AppError(404, 'Not Found', 'Data tidak ditemukan');
    expect(err.statusCode).toBe(404);
    expect(err.error).toBe('Not Found');
    expect(err.message).toBe('Data tidak ditemukan');
    expect(err instanceof Error).toBe(true);
  });
});
