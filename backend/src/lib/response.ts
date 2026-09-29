import { Response } from 'express';

export function sendSuccess(res: Response, statusCode: number, message: string, data?: unknown): void {
  const body: Record<string, unknown> = { statusCode, success: true, message };
  if (data !== undefined) body.data = data;
  res.status(statusCode).json(body);
}

export function sendError(
  res: Response,
  statusCode: number,
  error: string,
  message: string,
  details?: unknown[],
): void {
  const body: Record<string, unknown> = { statusCode, success: false, error, message };
  if (details !== undefined) body.details = details;
  res.status(statusCode).json(body);
}

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public error: string,
    message: string,
    public details?: unknown[],
  ) {
    super(message);
    this.name = 'AppError';
  }
}
