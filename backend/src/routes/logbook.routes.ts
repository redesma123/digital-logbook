import { Router, Request, Response, NextFunction } from 'express';
import { logbookService } from '../services/logbook.service.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import {
  createLogbookSchema,
  updateLogbookSchema,
  listLogbookSchema,
  latestCounterSchema,
} from '../schemas/logbook.schema.js';
import { sendSuccess } from '../lib/response.js';

export const logbookRouter = Router();

// GET /logbook/latest-counter must be BEFORE /logbook/:id to avoid route conflict
logbookRouter.get('/latest-counter', authenticate, validate(latestCounterSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await logbookService.getLatestCounter(Number(req.query.unit_id));
    sendSuccess(res, 200, 'Data stand meter terakhir berhasil diambil', data);
  } catch (err) { next(err); }
});

logbookRouter.get('/', authenticate, validate(listLogbookSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { unit_id, from, to, shift, page = 1, limit = 10 } = req.query as any;
    const data = await logbookService.list({
      unitId: unit_id ? Number(unit_id) : undefined,
      from: from as string,
      to: to as string,
      shift,
      page: Number(page),
      limit: Number(limit),
    });
    sendSuccess(res, 200, 'Daftar logbook berhasil diambil', data);
  } catch (err) { next(err); }
});

logbookRouter.post('/', authenticate, authorize('OPERATOR', 'SUPERVISOR'), validate(createLogbookSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await logbookService.create(req.body, req.user!.userId);
    sendSuccess(res, 201, 'Entri logbook berhasil disimpan', data);
  } catch (err) { next(err); }
});

logbookRouter.get('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await logbookService.getById(Number(req.params.id));
    sendSuccess(res, 200, 'Detail logbook berhasil diambil', data);
  } catch (err) { next(err); }
});

logbookRouter.patch('/:id', authenticate, authorize('OPERATOR', 'SUPERVISOR'), validate(updateLogbookSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await logbookService.update(Number(req.params.id), req.body, req.user!.userId, req.user!.role);
    sendSuccess(res, 200, 'Entri logbook berhasil diperbarui', data);
  } catch (err) { next(err); }
});

logbookRouter.delete('/:id', authenticate, authorize('SUPERVISOR'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await logbookService.remove(Number(req.params.id));
    sendSuccess(res, 200, 'Entri logbook berhasil dihapus');
  } catch (err) { next(err); }
});
