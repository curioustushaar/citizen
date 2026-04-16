import { Router } from 'express';
import {
  getSummary,
  getDepartmentStats,
  getResolutionStats,
  getHeatmapData,
  getEscalationStats,
  getAIInsights,
} from '../controllers/analyticsController';
import { verifyAuth, requireRole } from '../middleware/auth';

const router = Router();

router.get('/summary', verifyAuth, requireRole('ADMIN', 'SUPER_ADMIN'), getSummary);
router.get('/department', verifyAuth, requireRole('ADMIN', 'SUPER_ADMIN'), getDepartmentStats);
router.get('/resolution', verifyAuth, requireRole('ADMIN', 'SUPER_ADMIN'), getResolutionStats);
router.get('/heatmap', verifyAuth, requireRole('ADMIN', 'SUPER_ADMIN'), getHeatmapData);
router.get('/escalation', verifyAuth, requireRole('ADMIN', 'SUPER_ADMIN'), getEscalationStats);
router.get('/insights', verifyAuth, requireRole('ADMIN', 'SUPER_ADMIN'), getAIInsights);

export default router;
