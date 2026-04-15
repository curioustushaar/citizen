import { Router } from 'express';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/userController';
import { verifyAuth, requireRole } from '../middleware/auth';

const router = Router();

router.use(verifyAuth, requireRole('ADMIN', 'SUPER_ADMIN'));

router.get('/', getUsers);
router.post('/', createUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
