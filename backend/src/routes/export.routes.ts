import { Router, Request, Response, NextFunction } from 'express';
import { exportService } from '../services/export.service.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import {
  exportLogbookSchema,
  exportIncidentsSchema,
  exportMaintenanceSchema,
} from '../schemas/export.schema.js';

export const exportRouter = Router();

exportRouter.get(
  '/logbook',
  authenticate,
  authorize('SUPERVISOR', 'MANAGEMENT', 'ADMIN'),
  validate(exportLogbookSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { unit_id, from, to, shift, format = 'xlsx' } = req.query as any;
      await exportService.exportLogbook(
        {
          unit_id: unit_id ? Number(unit_id) : undefined,
          from: from as string | undefined,
          to: to as string | undefined,
          shift: shift as any,
        },
        format as 'xlsx' | 'csv',
        res
      );
    } catch (err) {
      next(err);
    }
  }
);

exportRouter.get(
  '/incidents',
  authenticate,
  authorize('SUPERVISOR', 'MANAGEMENT', 'ADMIN'),
  validate(exportIncidentsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { unit_id, from, to, format = 'xlsx' } = req.query as any;
      await exportService.exportIncidents(
        {
          unit_id: unit_id ? Number(unit_id) : undefined,
          from: from as string | undefined,
          to: to as string | undefined,
        },
        format as 'xlsx' | 'csv',
        res
      );
    } catch (err) {
      next(err);
    }
  }
);

exportRouter.get(
  '/maintenance',
  authenticate,
  authorize('SUPERVISOR', 'MANAGEMENT', 'ADMIN'),
  validate(exportMaintenanceSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { unit_id, from, to, format = 'xlsx' } = req.query as any;
      await exportService.exportMaintenance(
        {
          unit_id: unit_id ? Number(unit_id) : undefined,
          from: from as string | undefined,
          to: to as string | undefined,
        },
        format as 'xlsx' | 'csv',
        res
      );
    } catch (err) {
      next(err);
    }
  }
);
