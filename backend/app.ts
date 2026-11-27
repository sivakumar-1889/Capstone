import express from 'express';
import { isMongoConnected } from './config/db.ts';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.ts';
import { apiLimiter } from './middleware/rateLimiter.ts';
import authRoutes from './routes/authRoutes.ts';
import quizRoutes from './routes/quizRoutes.ts';
import resultRoutes from './routes/resultRoutes.ts';
import userRoutes from './routes/userRoutes.ts';

export function createApiRouter(): express.Router {
  const api = express.Router();

  api.use(apiLimiter);

  api.get('/health', (_req, res) => {
    res.json({
      success: true,
      status: 'ok',
      database: isMongoConnected() ? 'mongodb' : 'local-store',
    });
  });

  api.use('/auth', authRoutes);
  api.use('/quizzes', quizRoutes);
  api.use('/results', resultRoutes);
  api.use('/users', userRoutes);

  api.use(notFoundHandler);
  api.use(errorHandler);

  return api;
}
