import { Router } from 'express';
import {
  getSummary,
  getDepartmentStats,
  getResolutionStats,
  getEscalationStats,
  getHeatmapData,
} from '../controllers/analyticsController';

const router = Router();

router.get('/summary', getSummary);
router.get('/department', getDepartmentStats);
router.get('/resolution', getResolutionStats);
router.get('/escalation', getEscalationStats);
router.get('/heatmap', getHeatmapData);

export default router;
