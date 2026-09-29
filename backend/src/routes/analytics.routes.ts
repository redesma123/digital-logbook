import { Router, Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { sendSuccess } from '../lib/response.js';
import { analyticsPerformanceSchema } from '../schemas/analytics.schema.js';

export const analyticsRouter = Router();

analyticsRouter.get(
  '/performance',
  authenticate,
  authorize('SUPERVISOR', 'MANAGEMENT', 'ADMIN'),
  validate(analyticsPerformanceSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const unitId = Number(req.query.unit_id);
      const from = req.query.from as string;
      const to = req.query.to as string;

      const data = await analyticsService.getPerformance(unitId, from, to);
      sendSuccess(res, 200, 'Data analitik performa berhasil dihitung', data);
    } catch (err) {
      next(err);
    }
  }
);
