import { Router } from 'express';
import { authRouter } from './auth.routes.js';

export const router = Router();

router.get('/health', (_req, res) => {
  res.json({ statusCode: 200, success: true, message: 'HYDRO-MON API is running' });
});

router.use('/auth', authRouter);
