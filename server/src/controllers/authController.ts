import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import AuditLog from '../models/AuditLog';
import { generateToken } from '../middleware/auth';

// POST /api/auth/register (Public signup)
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      phone: phone || '',
      role: 'PUBLIC',
    });

    const token = generateToken({
      userId: user._id,
      role: 'PUBLIC',
      department: null,
      region: null,
      name: user.name,
      email: user.email,
    });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: 'PUBLIC',
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/auth/me
export const getMe = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

