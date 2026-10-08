import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './lib/env.js';
import { errorHandler } from './middleware/error-handler.js';
import { apiLimiter } from './middleware/rate-limit.js';
import { router } from './routes/index.js';

const app = express();

const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());

app.use(helmet());
app.use(
  cors({
    origin: (requestOrigin, callback) => {
      if (!requestOrigin) return callback(null, true);
      if (
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(requestOrigin) ||
        env.CORS_ORIGIN === requestOrigin
      ) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${requestOrigin} not allowed by CORS`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api/v1', apiLimiter, router);
app.use(errorHandler);

export { app };
