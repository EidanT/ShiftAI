import { Router } from 'express';
import { createHiringRouter } from '../modules/hiring/hiring.router';

const router = Router();

router.use('/hiring', createHiringRouter());

export default router;
