import { Request, Response } from 'express';
import Officer from '../models/Officer';

// GET /api/officers
export const getOfficers = async (_req: Request, res: Response) => {
  try {
    const officers = await Officer.find({ isActive: true }).sort({ department: 1 });
    res.json({ success: true, data: officers });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch officers' });
  }
};

// GET /api/officers/:id
export const getOfficerById = async (req: Request, res: Response) => {
  try {
    const officer = await Officer.findById(req.params.id);
    if (!officer) {
      return res.status(404).json({ success: false, error: 'Officer not found' });
    }
    res.json({ success: true, data: officer });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch officer' });
  }
};
