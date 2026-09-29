import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { userRouter } from './user.routes.js';
import { plantRouter } from './plant.routes.js';
import { unitRouter } from './unit.routes.js';

export const router = Router();

router.get('/health', (_req, res) => {
  res.json({ statusCode: 200, success: true, message: 'HYDRO-MON API is running' });
});

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/plants', plantRouter);
router.use('/units', unitRouter);
