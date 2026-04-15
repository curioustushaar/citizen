import { Router } from 'express';
import { getSLAConfigs, updateSLAConfig } from '../controllers/slaController';
import { verifyAuth, requireRole } from '../middleware/auth';

const router = Router();

router.use(verifyAuth, requireRole('SUPER_ADMIN'));

router.get('/', getSLAConfigs);
router.patch('/:id', updateSLAConfig);

export default router;
