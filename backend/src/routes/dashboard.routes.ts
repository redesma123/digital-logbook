import { Router, Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { sendSuccess } from '../lib/response.js';
import {
  dashboardSummarySchema,
  dashboardChartSchema,
} from '../schemas/dashboard.schema.js';

export const dashboardRouter = Router();

dashboardRouter.get(
  '/summary',
  authenticate,
  authorize('OPERATOR', 'SUPERVISOR', 'MANAGEMENT', 'ADMIN'),
  validate(dashboardSummarySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const unitId = Number(req.query.unit_id);
      const data = await dashboardService.getSummary(unitId);
      sendSuccess(res, 200, 'Data ringkasan dashboard berhasil diambil', data);
    } catch (err) {
      next(err);
    }
  }
);

dashboardRouter.get(
  '/chart',
  authenticate,
  authorize('OPERATOR', 'SUPERVISOR', 'MANAGEMENT', 'ADMIN'),
  validate(dashboardChartSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const unitId = Number(req.query.unit_id);
      const parameter = req.query.parameter as string;
      const from = req.query.from as string | undefined;
      const to = req.query.to as string | undefined;

      const data = await dashboardService.getChart(unitId, parameter, from, to);
      sendSuccess(res, 200, 'Data grafik berhasil diambil', data);
    } catch (err) {
      next(err);
    }
  }
);
