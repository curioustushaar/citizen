import { Response } from 'express';
import bcrypt from 'bcryptjs';
import Department from '../models/Department';
import User from '../models/User';
import Officer from '../models/Officer';
import Complaint from '../models/Complaint';
import AuditLog from '../models/AuditLog';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

const buildDeptScope = async (req: AuthRequest) => {
  if (!req.user) return null;

  const hasValidDeptId =
    typeof req.user.departmentId === 'string' && mongoose.Types.ObjectId.isValid(req.user.departmentId);

  if (hasValidDeptId) {
    const dept = await Department.findById(req.user.departmentId);
    if (dept) {
      const subDepts = await Department.find({ parentDepartmentId: dept._id, isActive: true }).select('_id');
      return { dept, deptIds: [dept._id, ...subDepts.map((d) => d._id)] };
    }
  }

  if (req.user.department) {
    let dept = await Department.findOne({
      name: { $regex: new RegExp(`^${req.user.department}$`, 'i') },
      isActive: true,
    });
    if (!dept && req.user.role === 'ADMIN') {
      dept = await Department.create({
        name: req.user.department,
        contactEmail: req.user.email,
        adminUserId: req.user.userId,
      });
    }
    if (!dept) return null;
    if (req.user.userId) {
      await User.findByIdAndUpdate(req.user.userId, { departmentId: dept._id });
    }
    const subDepts = await Department.find({ parentDepartmentId: dept._id, isActive: true }).select('_id');
    return { dept, deptIds: [dept._id, ...subDepts.map((d) => d._id)] };
  }

  return null;
};

const findComplaintByParam = async (id: string, deptIds: any[]) => {
  const byComplaintId = await Complaint.findOne({ complaintId: id, departmentId: { $in: deptIds } });
  if (byComplaintId) return byComplaintId;
  return Complaint.findOne({ _id: id, departmentId: { $in: deptIds } });
};

const getParamId = (param: string | string[]) => (Array.isArray(param) ? param[0] : param);

// GET /api/admin/sub-departments
export const getSubDepartments = async (req: AuthRequest, res: Response) => {
  try {
    const scope = await buildDeptScope(req);
    if (!scope) return res.status(403).json({ success: false, error: 'Department scope not found' });

    const subs = await Department.find({ parentDepartmentId: scope.dept._id, isActive: true }).sort({ name: 1 });
    const subIds = subs.map((s) => s._id);

    const stats = await Complaint.aggregate([
      { $match: { departmentId: { $in: subIds } } },
      {
        $addFields: {
          resolutionMs: {
            $cond: [
              { $and: [{ $ne: ['$resolvedAt', null] }, { $ne: ['$resolvedAt', ''] }] },
              { $subtract: ['$resolvedAt', '$createdAt'] },
              null,
            ],
          },
        },
      },
      {
        $group: {
          _id: '$departmentId',
          total: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'RESOLVED'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'IN_PROGRESS'] }, 1, 0] } },
          escalated: { $sum: { $cond: [{ $eq: ['$status', 'ESCALATED'] }, 1, 0] } },
          avgResolutionMs: { $avg: '$resolutionMs' },
        },
      },
    ]);

    const statsMap = new Map(stats.map((s: any) => [s._id.toString(), s]));
    const enriched = subs.map((s) => {
      const stat = statsMap.get(s._id.toString()) || {};
      return {
        ...s.toObject(),
        stats: {
          total: stat.total || 0,
          resolved: stat.resolved || 0,
          pending: stat.pending || 0,
          inProgress: stat.inProgress || 0,
          escalated: stat.escalated || 0,
          avgResolutionMs: stat.avgResolutionMs || 0,
        },
      };
    });

    res.json({ success: true, data: enriched });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/admin/sub-departments
export const createSubDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const scope = await buildDeptScope(req);
    if (!scope) return res.status(403).json({ success: false, error: 'Department scope not found' });

    const { name, email, password, address, pincode, state, governmentId } = req.body;
    const deptName = typeof name === 'string' ? name.trim() : '';
    const deptEmail = typeof email === 'string' ? email.trim() : '';
    if (!deptName || !deptEmail || !password) {
      return res.status(400).json({ success: false, error: 'name, email and password are required' });
    }

    const existing = await Department.findOne({ name: deptName });
    if (existing) return res.status(400).json({ success: false, error: 'Department name already exists' });

    const existingUser = await User.findOne({ email: deptEmail });
    if (existingUser) return res.status(400).json({ success: false, error: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 10);

    const department = await Department.create({
      name: deptName,
      parentDepartmentId: scope.dept._id,
      address: address || '',
      pincode: pincode || '',
      state: state || '',
      governmentId: governmentId || '',
      contactEmail: deptEmail,
    });

    const adminUser = await User.create({
      name: `${deptName} Admin`,
      email: deptEmail,
      password: hashed,
      role: 'ADMIN',
      department: deptName,
      departmentId: department._id,
    });

    department.adminUserId = adminUser._id;
    await department.save();

    await AuditLog.create({
      action: 'CREATE_SUB_DEPARTMENT',
      performedBy: req.user!.userId,
      performedByName: req.user!.name,
      role: req.user!.role,
      targetType: 'department',
      targetId: department._id.toString(),
      details: `Created sub-department: ${name}`,
    });

    res.status(201).json({ success: true, data: department });
  } catch (err: any) {
    if (err?.code === 11000) {
      return res.status(400).json({ success: false, error: 'Duplicate sub-department data' });
    }
    res.status(500).json({ success: false, error: err.message });
  }
};

// PATCH /api/admin/sub-departments/:id
export const updateSubDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const scope = await buildDeptScope(req);
    if (!scope) return res.status(403).json({ success: false, error: 'Department scope not found' });

    const sub = await Department.findOne({ _id: req.params.id, parentDepartmentId: scope.dept._id });
    if (!sub) return res.status(404).json({ success: false, error: 'Sub-department not found' });

    const { name, address, pincode, state, governmentId, contactEmail } = req.body;
    if (name) sub.name = name;
    if (address) sub.address = address;
    if (pincode) sub.pincode = pincode;
    if (state) sub.state = state;
    if (governmentId) sub.governmentId = governmentId;
    if (contactEmail) sub.contactEmail = contactEmail;

    await sub.save();

    await AuditLog.create({
      action: 'UPDATE_SUB_DEPARTMENT',
      performedBy: req.user!.userId,
      performedByName: req.user!.name,
      role: req.user!.role,
      targetType: 'department',
      targetId: sub._id.toString(),
      details: `Updated sub-department: ${sub.name}`,
    });

    res.json({ success: true, data: sub });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE /api/admin/sub-departments/:id
export const deleteSubDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const scope = await buildDeptScope(req);
    if (!scope) return res.status(403).json({ success: false, error: 'Department scope not found' });

    const sub = await Department.findOne({ _id: req.params.id, parentDepartmentId: scope.dept._id });
    if (!sub) return res.status(404).json({ success: false, error: 'Sub-department not found' });

    sub.isActive = false;
    await sub.save();

    await AuditLog.create({
      action: 'DELETE_SUB_DEPARTMENT',
      performedBy: req.user!.userId,
      performedByName: req.user!.name,
      role: req.user!.role,
      targetType: 'department',
      targetId: sub._id.toString(),
      details: `Deactivated sub-department: ${sub.name}`,
    });

    res.json({ success: true, message: 'Sub-department deactivated' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/admin/officers
export const getAdminOfficers = async (req: AuthRequest, res: Response) => {
  try {
    const scope = await buildDeptScope(req);
    if (!scope) return res.status(403).json({ success: false, error: 'Department scope not found' });

    const officers = await Officer.find({ departmentId: { $in: scope.deptIds }, isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: officers });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/admin/officers
export const createOfficer = async (req: AuthRequest, res: Response) => {
  try {
    const scope = await buildDeptScope(req);
    if (!scope) return res.status(403).json({ success: false, error: 'Department scope not found' });

    const {
      name,
      email,
      password,
      departmentId,
      designation,
      rank,
      level,
      phone,
      district,
      state,
      pincode,
      officeAddress,
    } = req.body;

    if (!name || !email || !password || !departmentId) {
      return res.status(400).json({ success: false, error: 'name, email, password, departmentId are required' });
    }

    const deptAllowed = scope.deptIds.some((id) => id.toString() === departmentId);
    if (!deptAllowed) {
      return res.status(403).json({ success: false, error: 'Invalid department for this admin' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, error: 'Email already exists' });

    const dept = await Department.findById(departmentId);
    if (!dept) return res.status(404).json({ success: false, error: 'Department not found' });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: 'OFFICER',
      department: dept.name,
      departmentId: dept._id,
    });

    const officer = await Officer.create({
      name,
      email,
      phone: phone || '000-000-0000',
      department: dept.name,
      departmentId: dept._id,
      designation: designation || 'Officer',
      rank: rank || 'Officer',
      level: level || 1,
      employeeId: '',
      officeAddress: officeAddress || '',
      district: district || '',
      state: state || '',
      pincode: pincode || '',
      region: scope.dept.location || 'Delhi',
      performance: 75,
      isActive: true,
      userId: user._id,
    });

    await AuditLog.create({
      action: 'CREATE_OFFICER',
      performedBy: req.user!.userId,
      performedByName: req.user!.name,
      role: req.user!.role,
      targetType: 'officer',
      targetId: officer._id.toString(),
      details: `Created officer: ${name} (${email})`,
    });

    res.status(201).json({ success: true, data: officer });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/admin/complaints
export const getAdminComplaints = async (req: AuthRequest, res: Response) => {
  try {
    const scope = await buildDeptScope(req);
    if (!scope) return res.status(403).json({ success: false, error: 'Department scope not found' });

    const query: any = { departmentId: { $in: scope.deptIds } };

    if (typeof req.query.status === 'string' && req.query.status.trim()) {
      query.status = req.query.status.trim();
    }
    if (typeof req.query.priority === 'string' && req.query.priority.trim()) {
      query.priority = req.query.priority.trim();
    }
    if (typeof req.query.search === 'string' && req.query.search.trim()) {
      const term = req.query.search.trim();
      query.$or = [
        { complaintId: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { category: { $regex: term, $options: 'i' } },
      ];
    }

    const complaints = await Complaint.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: complaints });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// PATCH /api/admin/complaints/:id/accept
export const acceptComplaint = async (req: AuthRequest, res: Response) => {
  try {
    const scope = await buildDeptScope(req);
    if (!scope) return res.status(403).json({ success: false, error: 'Department scope not found' });

    const complaint = await findComplaintByParam(getParamId(req.params.id), scope.deptIds);
    if (!complaint) return res.status(404).json({ success: false, error: 'Complaint not found' });

    complaint.status = 'IN_PROGRESS';
    await complaint.save();

    await AuditLog.create({
      action: 'ACCEPT_COMPLAINT',
      performedBy: req.user!.userId,
      performedByName: req.user!.name,
      role: req.user!.role,
      targetType: 'complaint',
      targetId: complaint.complaintId,
      details: 'Accepted complaint (IN_PROGRESS)',
    });

    res.json({ success: true, data: complaint });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// PATCH /api/admin/complaints/:id/assign
export const assignComplaint = async (req: AuthRequest, res: Response) => {
  try {
    const scope = await buildDeptScope(req);
    if (!scope) return res.status(403).json({ success: false, error: 'Department scope not found' });

    const { officerId } = req.body;
    if (!officerId) return res.status(400).json({ success: false, error: 'officerId is required' });

    const complaint = await findComplaintByParam(getParamId(req.params.id), scope.deptIds);
    if (!complaint) return res.status(404).json({ success: false, error: 'Complaint not found' });

    const officer = await Officer.findOne({ _id: officerId, departmentId: { $in: scope.deptIds } });
    if (!officer) return res.status(404).json({ success: false, error: 'Officer not found in your department' });

    if (complaint.assignedOfficer && complaint.assignedOfficer !== 'Unassigned') {
      await Officer.findByIdAndUpdate(complaint.assignedOfficer, { $inc: { pendingCount: -1 } });
    }

    complaint.assignedOfficer = officer._id.toString();
    complaint.assignedOfficerName = officer.name;
    complaint.assignedTo = officer.userId ? officer.userId.toString() : '';
    if (complaint.status === 'PENDING') {
      complaint.status = 'IN_PROGRESS';
    }
    await complaint.save();

    await Officer.findByIdAndUpdate(officer._id, { $inc: { pendingCount: 1 } });

    await AuditLog.create({
      action: 'ASSIGN_COMPLAINT',
      performedBy: req.user!.userId,
      performedByName: req.user!.name,
      role: req.user!.role,
      targetType: 'complaint',
      targetId: complaint.complaintId,
      details: `Assigned to ${officer.name}`,
    });

    res.json({ success: true, data: complaint });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// PATCH /api/admin/complaints/:id/status
export const updateComplaintStatus = async (req: AuthRequest, res: Response) => {
  try {
    const scope = await buildDeptScope(req);
    if (!scope) return res.status(403).json({ success: false, error: 'Department scope not found' });

    const { status, remarks } = req.body;
    if (!status) return res.status(400).json({ success: false, error: 'status is required' });

    const complaint = await findComplaintByParam(getParamId(req.params.id), scope.deptIds);
    if (!complaint) return res.status(404).json({ success: false, error: 'Complaint not found' });

    complaint.status = status;
    if (status === 'RESOLVED') {
      complaint.resolvedAt = new Date();
      if (complaint.assignedOfficer && complaint.assignedOfficer !== 'Unassigned') {
        await Officer.findByIdAndUpdate(complaint.assignedOfficer, {
          $inc: { pendingCount: -1, resolvedCount: 1 },
        });
      }
    }

    if (remarks) {
      complaint.notes.push({
        text: remarks,
        addedBy: req.user?.name || 'Admin',
        addedAt: new Date(),
        attachment: null,
      });
    }

    await complaint.save();

    await AuditLog.create({
      action: 'UPDATE_STATUS',
      performedBy: req.user!.userId,
      performedByName: req.user!.name,
      role: req.user!.role,
      targetType: 'complaint',
      targetId: complaint.complaintId,
      details: `Status -> ${status}`,
    });

    res.json({ success: true, data: complaint });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/admin/complaints/:id/remark
export const addComplaintRemark = async (req: AuthRequest, res: Response) => {
  try {
    const scope = await buildDeptScope(req);
    if (!scope) return res.status(403).json({ success: false, error: 'Department scope not found' });

    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, error: 'text is required' });

    const complaint = await findComplaintByParam(getParamId(req.params.id), scope.deptIds);
    if (!complaint) return res.status(404).json({ success: false, error: 'Complaint not found' });

    complaint.notes.push({
      text,
      addedBy: req.user?.name || 'Admin',
      addedAt: new Date(),
      attachment: null,
    });

    await complaint.save();

    await AuditLog.create({
      action: 'ADD_REMARK',
      performedBy: req.user!.userId,
      performedByName: req.user!.name,
      role: req.user!.role,
      targetType: 'complaint',
      targetId: complaint.complaintId,
      details: 'Added remark',
    });

    res.json({ success: true, data: complaint });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
