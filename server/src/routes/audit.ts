import { Router } from 'express';
import { getAuditLogs } from '../controllers/auditController';
import { verifyAuth, requireRole } from '../middleware/auth';

const router = Router();

router.use(verifyAuth, requireRole('SUPER_ADMIN'));

router.get('/', getAuditLogs);

export default router;
