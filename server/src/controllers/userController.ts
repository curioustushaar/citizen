import { Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import AuditLog from '../models/AuditLog';
import { AuthRequest } from '../middleware/auth';

// GET /api/users (SUPER_ADMIN only)
export const getUsers = async (_req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/users (SUPER_ADMIN creates admin accounts)
export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role, department, region, phone } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, error: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role || 'ADMIN',
      department: department || null,
      region: region || null,
      phone: phone || '',
    });

    await AuditLog.create({
      action: 'CREATE_USER',
      performedBy: req.user!.userId,
      performedByName: req.user!.name,
      role: req.user!.role,
      targetType: 'user',
      targetId: user._id.toString(),
      details: `Created ${role} user: ${name} (${email})`,
    });

    res.status(201).json({
      success: true,
      data: { ...user.toObject(), password: undefined },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// PATCH /api/users/:id (SUPER_ADMIN updates user role/status)
export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { role, department, region, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, department, region, isActive },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    await AuditLog.create({
      action: 'UPDATE_USER',
      performedBy: req.user!.userId,
      performedByName: req.user!.name,
      role: req.user!.role,
      targetType: 'user',
      targetId: user._id.toString(),
      details: `Updated user: ${user.name} → role: ${role}, active: ${isActive}`,
    });

    res.json({ success: true, data: user });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE /api/users/:id (SUPER_ADMIN deactivates user)
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    await AuditLog.create({
      action: 'DEACTIVATE_USER',
      performedBy: req.user!.userId,
      performedByName: req.user!.name,
      role: req.user!.role,
      targetType: 'user',
      targetId: user._id.toString(),
      details: `Deactivated user: ${user.name}`,
    });

    res.json({ success: true, data: user });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
