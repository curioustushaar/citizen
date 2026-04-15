import { Response } from 'express';
import AuditLog from '../models/AuditLog';
import { AuthRequest } from '../middleware/auth';

// GET /api/audit-logs
export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const page = parseInt(req.query.page as string) || 1;
    const skip = (page - 1) * limit;

    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AuditLog.countDocuments();

    res.json({
      success: true,
      data: logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
