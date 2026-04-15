import { Router, Request, Response } from 'express';
import Complaint from '../models/Complaint';

const router = Router();

// GET /api/analytics/summary
router.get('/summary', async (_req: Request, res: Response) => {
  try {
    const stats = await Complaint.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: [{ $toLower: '$status' }, 'pending'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: [{ $toLower: '$status' }, 'in_progress'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: [{ $toLower: '$status' }, 'resolved'] }, 1, 0] } },
          escalated: { $sum: { $cond: [{ $eq: [{ $toLower: '$status' }, 'escalated'] }, 1, 0] } },
        },
      },
    ]);

    const data = stats.length > 0 ? stats[0] : { total: 0, pending: 0, inProgress: 0, resolved: 0, escalated: 0 };
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/analytics/department
router.get('/department', async (_req: Request, res: Response) => {
  try {
    const stats = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          department: '$_id',
          count: 1,
        },
      },
    ]);
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
