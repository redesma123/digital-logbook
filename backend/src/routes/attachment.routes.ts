import { Router, Request, Response, NextFunction } from 'express';
import { attachmentService } from '../services/attachment.service.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { uploadLimiter } from '../middleware/rate-limit.js';
import { uploadAttachment } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { createAttachmentSchema, attachmentBodySchema } from '../schemas/attachment.schema.js';
import { sendSuccess, AppError } from '../lib/response.js';

export const attachmentRouter = Router();

attachmentRouter.post(
  '/',
  authenticate,
  authorize('OPERATOR', 'SUPERVISOR'),
  uploadLimiter,
  uploadAttachment,
  validate(createAttachmentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { related_to, related_id } = attachmentBodySchema.parse(req.body);
      const data = await attachmentService.upload(
        req.file!.buffer,
        req.file!.originalname,
        related_to,
        related_id,
        req.user!.userId
      );
      sendSuccess(res, 201, 'File berhasil diunggah', data);
    } catch (err) {
      next(err);
    }
  }
);

attachmentRouter.get(
  '/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        throw new AppError(400, 'Bad Request', 'ID tidak valid');
      }
      const data = await attachmentService.getById(id);
      sendSuccess(res, 200, 'Data lampiran berhasil diambil', data);
    } catch (err) {
      next(err);
    }
  }
);

attachmentRouter.get(
  '/:id/file',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        throw new AppError(400, 'Bad Request', 'ID tidak valid');
      }
      const { stream, mimeType, filename } = await attachmentService.streamFile(id);
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
      stream.on('error', (err) => next(err));
      stream.pipe(res);
    } catch (err) {
      next(err);
    }
  }
);

attachmentRouter.delete(
  '/:id',
  authenticate,
  authorize('SUPERVISOR'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        throw new AppError(400, 'Bad Request', 'ID tidak valid');
      }
      await attachmentService.remove(id, req.user?.role);
      sendSuccess(res, 200, 'Lampiran berhasil dihapus');
    } catch (err) {
      next(err);
    }
  }
);
