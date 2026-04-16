import { Router } from 'express';
import { register, getMe } from '../controllers/authController';
import { verifyAuth } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.get('/me', verifyAuth, getMe);

export default router;

