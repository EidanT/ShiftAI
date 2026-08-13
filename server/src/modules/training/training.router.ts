import { Router } from 'express';
import { validate } from '../../middlewares/validate';
import { writeLimiter } from '../../middlewares/rateLimiter';
import { TrainingController } from './training.controller';
import { createTrainingRepository } from './training.repository';
import { TrainingService } from './training.service';
import {
  CreateTrainingAssignmentSchema,
  CreateTrainingCourseSchema,
  CreateTrainingProgramSchema,
  UpdateTrainingAssignmentSchema,
  UpdateTrainingCourseSchema,
  UpdateTrainingProgramSchema,
} from './training.types';

export function createTrainingRouter(): Router {
  const router = Router();
  const repository = createTrainingRepository();
  const service = new TrainingService(repository);
  const controller = new TrainingController(service);

  router.get('/summary', controller.getSummary);
  router.get('/report', controller.getReport);
  router.get('/employees', controller.listEmployees);
  router.get('/employees/:id/history', controller.getEmployeeHistory);

  router.get('/courses', controller.listCourses);
  router.post(
    '/courses',
    writeLimiter,
    validate(CreateTrainingCourseSchema),
    controller.createCourse,
  );
  router.patch(
    '/courses/:id',
    writeLimiter,
    validate(UpdateTrainingCourseSchema),
    controller.updateCourse,
  );

  router.get('/programs', controller.listPrograms);
  router.post(
    '/programs',
    writeLimiter,
    validate(CreateTrainingProgramSchema),
    controller.createProgram,
  );
  router.patch(
    '/programs/:id',
    writeLimiter,
    validate(UpdateTrainingProgramSchema),
    controller.updateProgram,
  );

  router.get('/assignments', controller.listAssignments);
  router.post(
    '/assignments',
    writeLimiter,
    validate(CreateTrainingAssignmentSchema),
    controller.createAssignment,
  );
  router.patch(
    '/assignments/:id',
    writeLimiter,
    validate(UpdateTrainingAssignmentSchema),
    controller.updateAssignment,
  );

  return router;
}
