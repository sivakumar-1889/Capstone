import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/userController.ts';
import { requireAuth } from '../middleware/authMiddleware.ts';

const router = Router();

router.use(requireAuth);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

export default router;
