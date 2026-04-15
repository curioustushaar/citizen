import { Router } from 'express';
import { simulateCrisis } from '../controllers/simulateController';

const router = Router();

router.post('/', simulateCrisis);

export default router;
