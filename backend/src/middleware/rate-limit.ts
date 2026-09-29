import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { statusCode: 429, success: false, error: 'Too Many Requests', message: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { statusCode: 429, success: false, error: 'Too Many Requests', message: 'Terlalu banyak upload. Coba lagi dalam 1 menit.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { statusCode: 429, success: false, error: 'Too Many Requests', message: 'Terlalu banyak request. Coba lagi dalam 1 menit.' },
  standardHeaders: true,
  legacyHeaders: false,
});
