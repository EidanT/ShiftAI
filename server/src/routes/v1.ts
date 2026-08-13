import { Router } from 'express';
import { createHiringRouter } from '../modules/hiring/hiring.router';
import { createAuthRouter } from '../modules/auth/auth.router';
import { createPayrollRouter } from '../modules/payroll/payroll.router';
import { createTrainingRouter } from '../modules/training/training.router';
import { createLicensesRouter } from '../modules/licenses/licenses.router';

const router = Router();

router.use('/auth', createAuthRouter());
router.use('/hiring', createHiringRouter());
router.use('/payroll', createPayrollRouter());
router.use('/training', createTrainingRouter());
router.use('/licenses', createLicensesRouter());

export default router;
