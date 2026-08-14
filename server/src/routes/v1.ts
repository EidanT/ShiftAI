import { Router } from 'express';

import { createAuthRouter } from '../modules/auth/auth.router';
import { createHiringRouter } from '../modules/hiring/hiring.router';
import { createPayrollRouter } from '../modules/payroll/payroll.router';
import { createTrainingRouter } from '../modules/training/training.router';
import { createLicensesRouter } from '../modules/licenses/licenses.router';
import { createEvaluationsRouter } from '../modules/evaluations/evaluations.router';

export function createV1Router(): Router {
  const router = Router();

  router.use('/auth', createAuthRouter());
  router.use('/hiring', createHiringRouter());
  router.use('/payroll', createPayrollRouter());
  router.use('/training', createTrainingRouter());
  router.use('/licenses', createLicensesRouter());
  router.use('/evaluations', createEvaluationsRouter());

  return router;
}

export default createV1Router();