import { Router } from 'express';
import {
  getComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
  updateStatus,
  addNote,
  reassignComplaint,
  addFeedback,
  forceAssign,
  globalClose,
} from '../controllers/complaintController';
import { verifyAuth, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', getComplaints);
router.get('/:id', getComplaintById);
router.post('/', createComplaint);
router.patch('/:id', updateComplaint);

// Admin actions
router.patch('/:id/status', verifyAuth, requireRole('ADMIN', 'SUPER_ADMIN'), updateStatus);
router.post('/:id/notes', verifyAuth, requireRole('ADMIN', 'SUPER_ADMIN'), addNote);
router.post('/:id/reassign', verifyAuth, requireRole('ADMIN', 'SUPER_ADMIN'), reassignComplaint);

// Super Admin actions
router.post('/:id/force-assign', verifyAuth, requireRole('SUPER_ADMIN'), forceAssign);
router.post('/:id/global-close', verifyAuth, requireRole('SUPER_ADMIN'), globalClose);

// Public feedback
router.post('/:id/feedback', addFeedback);

export default router;
