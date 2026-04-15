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
} from '../controllers/complaintController';
import { verifyAuth, requireRole } from '../middleware/auth';

const router = Router();

// Public routes (no auth for demo, userId passed in body/query)
router.get('/', getComplaints);
router.get('/:id', getComplaintById);
router.post('/', createComplaint);

// Public feedback
router.post('/:id/feedback', addFeedback);

// Admin routes
router.patch('/:id', updateComplaint);
router.patch('/:id/status', verifyAuth, requireRole('ADMIN', 'SUPER_ADMIN'), updateStatus);
router.post('/:id/notes', verifyAuth, requireRole('ADMIN', 'SUPER_ADMIN'), addNote);
router.post('/:id/reassign', verifyAuth, requireRole('ADMIN', 'SUPER_ADMIN'), reassignComplaint);

export default router;
