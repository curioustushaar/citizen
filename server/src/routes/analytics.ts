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
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { _id: 0, department: '$_id', count: 1 } },
    ]);
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/analytics/resolution
router.get('/resolution', async (_req: Request, res: Response) => {
  try {
    const stats = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/analytics/escalation
router.get('/escalation', async (_req: Request, res: Response) => {
  try {
    const escalated = await Complaint.countDocuments({ status: { $regex: /escalated/i } });
    res.json({ success: true, data: { escalated } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/analytics/heatmap
router.get('/heatmap', async (_req: Request, res: Response) => {
  try {
    const complaints = await Complaint.find({}, 'location category status').limit(200);
    res.json({ success: true, data: complaints });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/analytics/insights
router.get('/insights', async (_req: Request, res: Response) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 }).limit(50);
    const insights: any[] = [];

    const categoryCounts: Record<string, number> = {};
    complaints.forEach(c => {
      categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    });
    const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
    if (topCategory) {
      insights.push({ text: `${topCategory[0]} is the top category with ${topCategory[1]} cases.`, type: 'info', icon: '📊' });
    }

    res.json({ success: true, data: insights });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
