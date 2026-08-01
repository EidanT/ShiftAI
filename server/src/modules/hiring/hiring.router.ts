import { Router } from 'express';
import multer from 'multer';
import { InMemoryHiringRepository } from './hiring.repository';
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

const upload = multer({
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      cb(new Error('Solo se permiten archivos PDF'));
      return;
    }
    cb(null, true);
  },
});

export function createHiringRouter(): Router {
  const router = Router();

  // Preparado para Supabase, pero intencionadamente utilizando memoria mientras se omite la conexión a la base de datos.
  const repository = new InMemoryHiringRepository();
  const service = new HiringService(repository);
  const controller = new HiringController(service);

  router.post('/candidates/analyze-cv', upload.single('file'), controller.analyzeCV);

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
