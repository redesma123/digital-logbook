import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { sendError } from '../lib/response.js';

export function validate(schema: AnyZodObject) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.errors.map(e => ({ field: e.path.slice(1).join('.'), message: e.message }));
        sendError(_res, 400, 'Bad Request', 'Validasi input gagal', details);
        return;
      }
      next(err);
    }
  };
}
