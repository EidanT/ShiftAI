import { Router } from 'express';
import { SupabaseHiringRepository } from './hiring.repository';
import { HiringService } from './hiring.service';
import { HiringController } from './hiring.controller';
import { validate } from '../../middlewares/validate';
import { writeLimiter } from '../../middlewares/rateLimiter';
import {
  CreateApplicationSchema,
  CreateCandidateSchema,
  CreateInterviewSchema,
  CreateVacancySchema,
  HireCandidateSchema,
  UpdateApplicationStatusSchema,
  UpdateCandidateSchema,
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
    '/candidates/:id',
    writeLimiter,
    validate(UpdateCandidateSchema),
    controller.updateCandidate,
  );

  router.get('/applications', controller.getApplications);
  router.post(
    '/applications',
    writeLimiter,
    validate(CreateApplicationSchema),
    controller.createApplication,
  );
  router.patch(
    '/applications/:id/status',
    writeLimiter,
    validate(UpdateApplicationStatusSchema),
    controller.updateApplicationStatus,
  );
  router.post(
    '/applications/:id/interviews',
    writeLimiter,
    validate(CreateInterviewSchema),
    controller.createInterview,
  );
  router.post(
    '/applications/:id/hire',
    writeLimiter,
    validate(HireCandidateSchema),
    controller.hireCandidate,
  );

  return router;
}
