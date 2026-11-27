import { Router } from 'express';
import {
  deleteQuiz,
  generateQuiz,
  getQuizById,
  listQuizzes,
} from '../controllers/quizController.ts';
import { requireAuth } from '../middleware/authMiddleware.ts';
import { aiGenerateLimiter } from '../middleware/rateLimiter.ts';

const router = Router();

router.use(requireAuth);

router.post('/generate', aiGenerateLimiter, generateQuiz);
router.get('/', listQuizzes);
router.get('/:id', getQuizById);
router.delete('/:id', deleteQuiz);

export default router;
