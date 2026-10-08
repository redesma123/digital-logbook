import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { sendError } from '../lib/response.js';
import { detectMimeType } from '../utils/magic-bytes.js';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

export function uploadSingle(fieldName = 'file') {
  const multerHandler = upload.single(fieldName);

  return (req: Request, res: Response, next: NextFunction) => {
    multerHandler(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            sendError(res, 400, 'Bad Request', 'Ukuran file melebihi batas 5 MB');
            return;
          }
          sendError(res, 400, 'Bad Request', err.message);
          return;
        }
        sendError(res, 400, 'Bad Request', err.message);
        return;
      }

      if (!req.file) {
        sendError(res, 400, 'Bad Request', 'File wajib diunggah');
        return;
      }

      const mimeType = detectMimeType(req.file.buffer);
      if (!mimeType) {
        sendError(
          res,
          400,
          'Bad Request',
          'Format file tidak didukung. Hanya JPEG, PNG, dan WebP yang diizinkan'
        );
        return;
      }

      req.file.mimetype = mimeType;
      next();
    });
  };
}

export const uploadMiddleware = uploadSingle('file');
export const uploadAttachment = uploadMiddleware;
