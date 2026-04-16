import { Router } from 'express';
import { getSLAConfigs, updateSLAConfig } from '../controllers/slaController';
import { verifyAuth, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', verifyAuth, requireRole('SUPER_ADMIN'), getSLAConfigs);
router.patch('/:id', verifyAuth, requireRole('SUPER_ADMIN'), updateSLAConfig);

export default router;
