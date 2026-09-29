import { Router, Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { userService } from '../services/user.service.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { sendSuccess, AppError } from '../lib/response.js';
import {
  createUserSchema,
  updateUserSchema,
  listUsersSchema,
  userIdParamSchema,
} from '../schemas/user.schema.js';

export const userRouter = Router();

userRouter.use(authenticate, authorize('ADMIN'));

userRouter.get('/', validate(listUsersSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const role = req.query.role as Role | undefined;

    const data = await userService.list(page, limit, role);
    sendSuccess(res, 200, 'Daftar user berhasil diambil', data);
  } catch (err) { next(err); }
});

userRouter.post('/', validate(createUserSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.create(req.body);
    sendSuccess(res, 201, 'User berhasil dibuat', user);
  } catch (err) { next(err); }
});

userRouter.get('/:id', validate(userIdParamSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new AppError(400, 'Bad Request', 'ID tidak valid');
    }
    const user = await userService.getById(id);
    sendSuccess(res, 200, 'Data user berhasil diambil', user);
  } catch (err) { next(err); }
});

userRouter.patch('/:id', validate(updateUserSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new AppError(400, 'Bad Request', 'ID tidak valid');
    }
    const user = await userService.update(id, req.body);
    sendSuccess(res, 200, 'User berhasil diperbarui', user);
  } catch (err) { next(err); }
});

userRouter.delete('/:id', validate(userIdParamSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new AppError(400, 'Bad Request', 'ID tidak valid');
    }
    const user = await userService.remove(id);
    sendSuccess(res, 200, 'User berhasil dinonaktifkan', user);
  } catch (err) { next(err); }
});
