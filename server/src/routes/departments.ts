import { Router } from 'express';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/departmentController';
import { verifyAuth, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', getDepartments);
router.post('/', verifyAuth, requireRole('SUPER_ADMIN'), createDepartment);
router.patch('/:id', verifyAuth, updateDepartment);
router.delete('/:id', verifyAuth, requireRole('SUPER_ADMIN'), deleteDepartment);

export default router;
