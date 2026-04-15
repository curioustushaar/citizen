import { Router } from 'express';
import { getOfficers, getOfficerById } from '../controllers/officerController';

const router = Router();

router.get('/', getOfficers);
router.get('/:id', getOfficerById);

export default router;
