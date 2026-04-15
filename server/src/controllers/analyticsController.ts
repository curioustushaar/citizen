import { Request, Response } from 'express';
import Complaint from '../models/Complaint';

// GET /api/analytics/summary
export const getSummary = async (_req: Request, res: Response) => {
  try {
    const total = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ status: 'PENDING' });
    const inProgress = await Complaint.countDocuments({ status: 'IN_PROGRESS' });
    const resolved = await Complaint.countDocuments({ status: 'RESOLVED' });
    const escalated = await Complaint.countDocuments({ status: 'ESCALATED' });

    res.json({
      success: true,
      data: { total, pending, inProgress, resolved, escalated },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get summary' });
  }
};

// GET /api/analytics/department
export const getDepartmentStats = async (_req: Request, res: Response) => {
  try {
    const stats = await Complaint.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const data = stats.map((s) => ({
      department: s._id,
      count: s.count,
    }));

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get department stats' });
  }
};

// GET /api/analytics/resolution
export const getResolutionStats = async (_req: Request, res: Response) => {
  try {
    const resolved = await Complaint.find({
      status: 'RESOLVED',
      resolvedAt: { $ne: null },
    });

    const avgTime =
      resolved.length > 0
        ? resolved.reduce((sum, c) => {
            const diff =
              new Date(c.resolvedAt!).getTime() - new Date(c.createdAt).getTime();
            return sum + diff / (1000 * 60 * 60); // hours
          }, 0) / resolved.length
        : 0;

    // Generate 7 days of mock trend data
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const trendData = days.map((day) => ({
      day,
      avgHours: parseFloat((Math.random() * 20 + 5).toFixed(1)),
      complaints: Math.floor(Math.random() * 30 + 10),
    }));

    res.json({
      success: true,
      data: {
        averageResolutionHours: parseFloat(avgTime.toFixed(1)),
        trend: trendData,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get resolution stats' });
  }
};

// GET /api/analytics/escalation
export const getEscalationStats = async (_req: Request, res: Response) => {
  try {
    const stats = await Complaint.aggregate([
      { $match: { status: 'ESCALATED' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const total = await Complaint.countDocuments();
    const escalated = await Complaint.countDocuments({ status: 'ESCALATED' });

    res.json({
      success: true,
      data: {
        rate: total > 0 ? parseFloat(((escalated / total) * 100).toFixed(1)) : 0,
        byCategory: stats.map((s) => ({ category: s._id, count: s.count })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get escalation stats' });
  }
};

// GET /api/analytics/heatmap
export const getHeatmapData = async (_req: Request, res: Response) => {
  try {
    const areas = [
      'Connaught Place', 'Laxmi Nagar', 'Dwarka', 'Rohini',
      'Saket', 'Janakpuri', 'Karol Bagh', 'Chandni Chowk',
      'Nehru Place', 'Pitampura', 'Greater Kailash', 'Lajpat Nagar',
    ];
    const timeSlots = ['06-09', '09-12', '12-15', '15-18', '18-21', '21-00'];

    const heatmap = areas.map((area) => ({
      area,
      slots: timeSlots.map((time) => ({
        time,
        count: Math.floor(Math.random() * 15),
      })),
    }));

    res.json({ success: true, data: heatmap });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get heatmap' });
  }
};
