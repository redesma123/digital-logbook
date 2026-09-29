import { Router, Request, Response, NextFunction } from 'express';
import { plantService } from '../services/plant.service.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { sendSuccess, AppError } from '../lib/response.js';
import {
  createPlantSchema,
  updatePlantSchema,
  plantIdParamSchema,
} from '../schemas/plant.schema.js';

export const plantRouter = Router();

plantRouter.use(authenticate);

plantRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const plants = await plantService.list();
    sendSuccess(res, 200, 'Daftar plant berhasil diambil', plants);
  } catch (err) { next(err); }
});

plantRouter.post('/', authorize('ADMIN'), validate(createPlantSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plant = await plantService.create(req.body);
    sendSuccess(res, 201, 'Plant berhasil dibuat', plant);
  } catch (err) { next(err); }
});

plantRouter.get('/:id', validate(plantIdParamSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new AppError(400, 'Bad Request', 'ID tidak valid');
    }
    const plant = await plantService.getById(id);
    sendSuccess(res, 200, 'Data plant berhasil diambil', plant);
  } catch (err) { next(err); }
});

plantRouter.patch('/:id', authorize('ADMIN'), validate(updatePlantSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new AppError(400, 'Bad Request', 'ID tidak valid');
    }
    const plant = await plantService.update(id, req.body);
    sendSuccess(res, 200, 'Plant berhasil diperbarui', plant);
  } catch (err) { next(err); }
});
