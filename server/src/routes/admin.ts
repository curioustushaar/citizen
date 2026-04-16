import { Router } from 'express';
import { verifyAuth, requireRole } from '../middleware/auth';
import {
  getSubDepartments,
  createSubDepartment,
  updateSubDepartment,
  deleteSubDepartment,
  getAdminOfficers,
  createOfficer,
  getAdminComplaints,
  acceptComplaint,
  assignComplaint,
  updateComplaintStatus,
  addComplaintRemark,
} from '../controllers/adminController';

const router = Router();

router.get('/sub-departments', verifyAuth, requireRole('ADMIN', 'SUPER_ADMIN'), getSubDepartments);
router.post('/sub-departments', verifyAuth, requireRole('ADMIN', 'SUPER_ADMIN'), createSubDepartment);
router.patch('/sub-departments/:id', verifyAuth, requireRole('ADMIN', 'SUPER_ADMIN'), updateSubDepartment);
router.delete('/sub-departments/:id', verifyAuth, requireRole('ADMIN', 'SUPER_ADMIN'), deleteSubDepartment);

router.get('/officers', verifyAuth, requireRole('ADMIN', 'SUPER_ADMIN'), getAdminOfficers);
router.post('/officers', verifyAuth, requireRole('ADMIN', 'SUPER_ADMIN'), createOfficer);

router.get('/complaints', verifyAuth, requireRole('ADMIN', 'SUPER_ADMIN'), getAdminComplaints);
router.patch('/complaints/:id/accept', verifyAuth, requireRole('ADMIN', 'SUPER_ADMIN'), acceptComplaint);
router.patch('/complaints/:id/assign', verifyAuth, requireRole('ADMIN', 'SUPER_ADMIN'), assignComplaint);
router.patch('/complaints/:id/status', verifyAuth, requireRole('ADMIN', 'SUPER_ADMIN'), updateComplaintStatus);
router.post('/complaints/:id/remark', verifyAuth, requireRole('ADMIN', 'SUPER_ADMIN'), addComplaintRemark);

export default router;
