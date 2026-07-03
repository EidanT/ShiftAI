import { Router } from 'express';
import { createHiringRouter } from '../modules/hiring/hiring.router';
import { createAuthRouter } from '../modules/auth/auth.router';

const router = Router();

router.use('/auth', createAuthRouter());
router.use('/hiring', createHiringRouter());

export default router;
