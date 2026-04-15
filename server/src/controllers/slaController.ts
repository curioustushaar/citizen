import { Response } from 'express';
import SLAConfig from '../models/SLAConfig';
import AuditLog from '../models/AuditLog';
import { AuthRequest } from '../middleware/auth';

// GET /api/sla
export const getSLAConfigs = async (_req: AuthRequest, res: Response) => {
  try {
    const configs = await SLAConfig.find().sort({ category: 1 });
    res.json({ success: true, data: configs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// PATCH /api/sla/:id
export const updateSLAConfig = async (req: AuthRequest, res: Response) => {
  try {
    const { priorityHigh, priorityMedium, priorityLow, autoEscalate, escalationLevels } = req.body;
    const config = await SLAConfig.findByIdAndUpdate(
      req.params.id,
      {
        priorityHigh,
        priorityMedium,
        priorityLow,
        autoEscalate,
        escalationLevels,
        updatedBy: req.user!.userId,
      },
      { new: true }
    );

    if (!config) return res.status(404).json({ success: false, error: 'SLA config not found' });

    await AuditLog.create({
      action: 'UPDATE_SLA',
      performedBy: req.user!.userId,
      performedByName: req.user!.name,
      role: req.user!.role,
      targetType: 'sla',
      targetId: config._id.toString(),
      details: `Updated SLA for ${config.category}: HIGH=${priorityHigh}h, MED=${priorityMedium}h, LOW=${priorityLow}h`,
    });

    res.json({ success: true, data: config });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
