import { Router } from 'express';
import { getOfficers, getOfficerById } from '../controllers/officerController';
import { verifyAuth, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', verifyAuth, requireRole('ADMIN', 'SUPER_ADMIN'), getOfficers);
router.get('/:id', verifyAuth, requireRole('ADMIN', 'SUPER_ADMIN'), getOfficerById);

export default router;
