import { Router } from 'express';
import { SupabaseLicensesRepository } from './licenses.repository';
import { LicensesService } from './licenses.service';
import { LicensesController } from './licenses.controller';
import { validate } from '../../middlewares/validate';
import { writeLimiter } from '../../middlewares/rateLimiter';
import {
  CreateLicenseSchema,
  UpdateLicenseSchema,
  UpdateLicenseStatusSchema,
} from './licenses.types';

export function createLicensesRouter(): Router {
  const router = Router();

  const repository = new SupabaseLicensesRepository();
  const service = new LicensesService(repository);
  const controller = new LicensesController(service);

  router.get('/', controller.getLicenses);

  router.get('/:id', controller.getLicenseById);

  router.post('/', writeLimiter, validate(CreateLicenseSchema), controller.createLicense);

  router.patch('/:id', writeLimiter, validate(UpdateLicenseSchema), controller.updateLicense);

  router.delete('/:id', writeLimiter, controller.deleteLicense);

  router.patch(
    '/:id/status',
    writeLimiter,
    validate(UpdateLicenseStatusSchema),
    controller.updateLicenseStatus,
  );

  return router;
}
