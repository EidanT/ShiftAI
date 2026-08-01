import { Router } from 'express';
import { createHiringRouter } from '../modules/hiring/hiring.router';
import { createAuthRouter } from '../modules/auth/auth.router';
import { createPayrollRouter } from '../modules/payroll/payroll.router';

const router = Router();

router.use('/auth', createAuthRouter());
router.use('/hiring', createHiringRouter());
router.use('/payroll', createPayrollRouter());

export default router;
