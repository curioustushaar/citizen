import { Router } from 'express';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/departmentController';
import { verifyAuth, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', verifyAuth, requireRole('ADMIN', 'SUPER_ADMIN'), getDepartments);
router.post('/', verifyAuth, requireRole('SUPER_ADMIN'), createDepartment);
router.patch('/:id', verifyAuth, requireRole('ADMIN', 'SUPER_ADMIN'), updateDepartment);
router.delete('/:id', verifyAuth, requireRole('SUPER_ADMIN'), deleteDepartment);

export default router;
