import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../lib/env.js';
import { sendError } from '../lib/response.js';

export interface JwtPayload {
  userId: number;
  username: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (typeof req.query.token === 'string' && req.query.token.trim().length > 0) {
    token = req.query.token.trim();
  }

  if (!token) {
    sendError(res, 401, 'Unauthorized', 'Token tidak ditemukan');
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    sendError(res, 401, 'Unauthorized', 'Token tidak valid atau sudah kedaluwarsa');
  }
}
