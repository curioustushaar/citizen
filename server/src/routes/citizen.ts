import { Router } from 'express';
import authRoutes from './auth';
import complaintRoutes from './complaints'; // Basic user operations
import userRoutes from './users';
import notificationRoutes from './notifications';

const router = Router();

router.use('/auth', authRoutes);
router.use('/complaints', complaintRoutes);
router.use('/users', userRoutes);
router.use('/notifications', notificationRoutes);

export default router;
