import { Router } from 'express';
import {
  getResultById,
  listResults,
  submitResult,
} from '../controllers/resultController.ts';
import { requireAuth } from '../middleware/authMiddleware.ts';

const router = Router();

router.use(requireAuth);

router.post('/submit', submitResult);
router.get('/', listResults);
router.get('/:id', getResultById);

export default router;
