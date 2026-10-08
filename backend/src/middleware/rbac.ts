import { Request, Response, NextFunction } from 'express';
import { sendError } from '../lib/response.js';

export function authorize(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized', 'Autentikasi diperlukan');
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      sendError(res, 403, 'Forbidden', 'Anda tidak memiliki hak akses untuk operasi ini');
      return;
    }
    next();
  };
}
