import { Router, Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { loginSchema, refreshSchema, logoutSchema } from '../schemas/auth.schema.js';
import { loginLimiter } from '../middleware/rate-limit.js';
import { sendSuccess } from '../lib/response.js';

export const authRouter = Router();

authRouter.post('/login', loginLimiter, validate(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await authService.login(req.body.username, req.body.password);
    sendSuccess(res, 200, 'Login berhasil', data);
  } catch (err) { next(err); }
});

authRouter.post('/refresh', validate(refreshSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await authService.refresh(req.body.refreshToken);
    sendSuccess(res, 200, 'Token berhasil diperbarui', data);
  } catch (err) { next(err); }
});

authRouter.post('/logout', authenticate, validate(logoutSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.logout(req.body.refreshToken);
    sendSuccess(res, 200, 'Logout berhasil');
  } catch (err) { next(err); }
});

authRouter.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await authService.getProfile(req.user!.userId);
    sendSuccess(res, 200, 'Data profil berhasil diambil', data);
  } catch (err) { next(err); }
});
