import { Router } from 'express';
import { updateProfile, getUserById } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.put('/profile', authenticate, updateProfile);
router.get('/:id', getUserById);

export default router;
