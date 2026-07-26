import { Router } from 'express';
import { SupabasePayrollRepository } from './payroll.repository';
import { PayrollService } from './payroll.service';
import { PayrollController } from './payroll.controller';
import { validate } from '../../middlewares/validate';
import { writeLimiter } from '../../middlewares/rateLimiter';
import { GeneratePayrollSchema, UpdatePayrollStatusSchema } from './payroll.types';

export function createPayrollRouter(): Router {
  const router = Router();

  const repository = new SupabasePayrollRepository();
  const service = new PayrollService(repository);
  const controller = new PayrollController(service);

  router.post('/runs', writeLimiter, validate(GeneratePayrollSchema), controller.generatePayroll);
  router.get('/runs', controller.getRuns);
  router.get('/runs/:id', controller.getRun);
  router.patch(
    '/runs/:id/status',
    writeLimiter,
    validate(UpdatePayrollStatusSchema),
    controller.updateStatus,
  );

  router.get('/runs/:id/receipts', controller.getReceipts);
  router.get('/runs/:id/receipts/:employeeId', controller.getReceipt);

  return router;
}
