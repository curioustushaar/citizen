import { Router } from 'express';
import {
  getSummary,
  getDepartmentStats,
  getResolutionStats,
  getEscalationStats,
  getHeatmapData,
  getAIInsights,
} from '../controllers/analyticsController';

const router = Router();

router.get('/summary', getSummary);
router.get('/department', getDepartmentStats);
router.get('/resolution', getResolutionStats);
router.get('/escalation', getEscalationStats);
router.get('/heatmap', getHeatmapData);
router.get('/insights', getAIInsights);

export default router;
