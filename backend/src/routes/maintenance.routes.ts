import { Router, Request, Response, NextFunction } from 'express';
import { maintenanceService } from '../services/maintenance.service.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import {
  createMaintenanceSchema,
  updateMaintenanceSchema,
  changeMaintenanceStatusSchema,
  listMaintenanceSchema,
  maintenanceIdParamSchema,
} from '../schemas/maintenance.schema.js';
import { sendSuccess } from '../lib/response.js';

export const maintenanceRouter = Router();

maintenanceRouter.get(
  '/',
  authenticate,
  validate(listMaintenanceSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { unit_id, status, from, to, page = 1, limit = 10 } = req.query as any;
      const data = await maintenanceService.list({
        unitId: unit_id ? Number(unit_id) : undefined,
        status,
        from: from as string,
        to: to as string,
        page: Number(page),
        limit: Number(limit),
      });
      sendSuccess(res, 200, 'Daftar pemeliharaan berhasil diambil', data);
    } catch (err) {
      next(err);
    }
  }
);

maintenanceRouter.post(
  '/',
  authenticate,
  authorize('OPERATOR', 'SUPERVISOR'),
  validate(createMaintenanceSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await maintenanceService.create(req.body, req.user!.userId);
      sendSuccess(res, 201, 'Data pemeliharaan berhasil dibuat', data);
    } catch (err) {
      next(err);
    }
  }
);

maintenanceRouter.get(
  '/:id',
  authenticate,
  validate(maintenanceIdParamSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await maintenanceService.getById(Number(req.params.id));
      sendSuccess(res, 200, 'Detail pemeliharaan berhasil diambil', data);
    } catch (err) {
      next(err);
    }
  }
);

maintenanceRouter.patch(
  '/:id/status',
  authenticate,
  authorize('SUPERVISOR'),
  validate(changeMaintenanceStatusSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await maintenanceService.changeStatus(
        Number(req.params.id),
        req.body.status,
        req.body.notes,
        req.user!.userId,
        req.user!.role
      );
      sendSuccess(res, 200, 'Status pemeliharaan berhasil diperbarui', data);
    } catch (err) {
      next(err);
    }
  }
);

maintenanceRouter.patch(
  '/:id',
  authenticate,
  authorize('OPERATOR', 'SUPERVISOR'),
  validate(updateMaintenanceSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await maintenanceService.update(Number(req.params.id), req.body);
      sendSuccess(res, 200, 'Data pemeliharaan berhasil diperbarui', data);
    } catch (err) {
      next(err);
    }
  }
);

maintenanceRouter.delete(
  '/:id',
  authenticate,
  authorize('SUPERVISOR'),
  validate(maintenanceIdParamSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await maintenanceService.remove(Number(req.params.id), req.user!.role);
      sendSuccess(res, 200, 'Data pemeliharaan berhasil dihapus');
    } catch (err) {
      next(err);
    }
  }
);
