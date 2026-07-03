import { Router } from 'express';
import { SupabaseHiringRepository } from './hiring.repository';
import { HiringService } from './hiring.service';
import { HiringController } from './hiring.controller';
import { validate } from '../../middlewares/validate';
import { writeLimiter } from '../../middlewares/rateLimiter';
import {
  CreateVacancySchema,
  CreateCandidateSchema,
  UpdateCandidateStatusSchema,
} from './hiring.types';

export function createHiringRouter(): Router {
  const router = Router();

  const repository = new SupabaseHiringRepository();
  const service = new HiringService(repository);
  const controller = new HiringController(service);

  router.get('/vacancies', controller.getVacancies);
  router.post('/vacancies', writeLimiter, validate(CreateVacancySchema), controller.createVacancy);

  router.get('/candidates', controller.getCandidates);
  router.post(
    '/candidates',
    writeLimiter,
    validate(CreateCandidateSchema),
    controller.createCandidate,
  );
  router.patch(
    '/candidates/:id/status',
    writeLimiter,
    validate(UpdateCandidateStatusSchema),
    controller.updateCandidateStatus,
  );

  return router;
}
