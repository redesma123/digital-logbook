import { Router, Request, Response, NextFunction } from 'express';
import { unitService } from '../services/unit.service.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { sendSuccess, AppError } from '../lib/response.js';
import {
  createUnitSchema,
  updateUnitSchema,
  listUnitsSchema,
  unitIdParamSchema,
} from '../schemas/unit.schema.js';

export const unitRouter = Router();

unitRouter.use(authenticate);

unitRouter.get('/', validate(listUnitsSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plantId = req.query.plant_id ? parseInt(req.query.plant_id as string, 10) : undefined;
    const units = await unitService.list(plantId);
    sendSuccess(res, 200, 'Daftar unit berhasil diambil', units);
  } catch (err) { next(err); }
});

unitRouter.post('/', authorize('ADMIN'), validate(createUnitSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const unit = await unitService.create(req.body);
    sendSuccess(res, 201, 'Unit berhasil dibuat', unit);
  } catch (err) { next(err); }
});

unitRouter.get('/:id', validate(unitIdParamSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new AppError(400, 'Bad Request', 'ID tidak valid');
    }
    const unit = await unitService.getById(id);
    sendSuccess(res, 200, 'Data unit berhasil diambil', unit);
  } catch (err) { next(err); }
});

unitRouter.patch('/:id', authorize('ADMIN'), validate(updateUnitSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new AppError(400, 'Bad Request', 'ID tidak valid');
    }
    const unit = await unitService.update(id, req.body);
    sendSuccess(res, 200, 'Unit berhasil diperbarui', unit);
  } catch (err) { next(err); }
});
