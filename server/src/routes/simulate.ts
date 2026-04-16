import { Router } from 'express';
import { simulateCrisis } from '../controllers/simulateController';
import { verifyAuth, requireRole } from '../middleware/auth';

const router = Router();

router.post('/', verifyAuth, requireRole('ADMIN', 'SUPER_ADMIN'), simulateCrisis);

export default router;
