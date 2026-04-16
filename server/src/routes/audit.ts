import { Router } from 'express';
import { getAuditLogs } from '../controllers/auditController';
import { verifyAuth, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', verifyAuth, requireRole('SUPER_ADMIN'), getAuditLogs);

export default router;
