import { Router } from 'express';
import { login, logout, me, register } from '../controllers/authController.ts';
import { requireAuth } from '../middleware/authMiddleware.ts';
import { authLimiter } from '../middleware/rateLimiter.ts';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/me', requireAuth, me);

export default router;
