import { Router, Request, Response, NextFunction } from 'express';
import { incidentService } from '../services/incident.service.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import {
  createIncidentSchema,
  updateIncidentSchema,
  changeIncidentStatusSchema,
  listIncidentSchema,
  incidentIdParamSchema,
} from '../schemas/incident.schema.js';
import { sendSuccess } from '../lib/response.js';

export const incidentRouter = Router();

incidentRouter.get(
  '/',
  authenticate,
  validate(listIncidentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { unit_id, status, from, to, page = 1, limit = 10 } = req.query as any;
      const data = await incidentService.list({
        unitId: unit_id ? Number(unit_id) : undefined,
        status,
        from: from as string,
        to: to as string,
        page: Number(page),
        limit: Number(limit),
      });
      sendSuccess(res, 200, 'Daftar gangguan berhasil diambil', data);
    } catch (err) {
      next(err);
    }
  }
);

incidentRouter.post(
  '/',
  authenticate,
  authorize('OPERATOR', 'SUPERVISOR'),
  validate(createIncidentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await incidentService.create(req.body, req.user!.userId);
      sendSuccess(res, 201, 'Laporan gangguan berhasil dibuat', data);
    } catch (err) {
      next(err);
    }
  }
);

incidentRouter.get(
  '/:id',
  authenticate,
  validate(incidentIdParamSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await incidentService.getById(Number(req.params.id));
      sendSuccess(res, 200, 'Detail gangguan berhasil diambil', data);
    } catch (err) {
      next(err);
    }
  }
);

incidentRouter.patch(
  '/:id/status',
  authenticate,
  authorize('OPERATOR', 'SUPERVISOR'),
  validate(changeIncidentStatusSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await incidentService.changeStatus(
        Number(req.params.id),
        req.body.status,
        req.body.notes,
        req.user!.userId,
        req.user!.role
      );
      sendSuccess(res, 200, 'Status gangguan berhasil diperbarui', data);
    } catch (err) {
      next(err);
    }
  }
);

incidentRouter.patch(
  '/:id',
  authenticate,
  authorize('OPERATOR', 'SUPERVISOR'),
  validate(updateIncidentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await incidentService.update(Number(req.params.id), req.body);
      sendSuccess(res, 200, 'Data gangguan berhasil diperbarui', data);
    } catch (err) {
      next(err);
    }
  }
);

incidentRouter.delete(
  '/:id',
  authenticate,
  authorize('SUPERVISOR'),
  validate(incidentIdParamSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await incidentService.remove(Number(req.params.id), req.user!.role);
      sendSuccess(res, 200, 'Data gangguan berhasil dihapus');
    } catch (err) {
      next(err);
    }
  }
);
