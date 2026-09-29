import { Request, Response, NextFunction } from 'express';
import { AppError, sendError } from '../lib/response.js';
import { ZodError } from 'zod';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.error, err.message, err.details);
    return;
  }
  if (err instanceof ZodError) {
    const details = err.errors.map(e => ({ field: e.path.join('.'), message: e.message }));
    sendError(res, 400, 'Bad Request', 'Validasi input gagal', details);
    return;
  }
  console.error('Unhandled error:', err);
  sendError(res, 500, 'Internal Server Error', 'Terjadi kesalahan pada server');
}
