import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { isAllowedOrigin } from './config/cors.js';
import apiRoutes from './routes/index.js';
import { errorMiddleware } from './middleware/error.middleware.js';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: (origin, callback) => {
        callback(null, isAllowedOrigin(origin));
      },
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser(env.COOKIE_SECRET));

  app.get('/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok' } });
  });

  app.use('/api', apiRoutes);
  app.use(errorMiddleware);

  return app;
}
