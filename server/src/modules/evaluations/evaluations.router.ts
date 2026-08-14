import { Router } from 'express';

import { EvaluationsRepository } from './evaluations.repository';
import { EvaluationsService } from './evaluations.service';
import { EvaluationsController } from './evaluations.controller';

export function createEvaluationsRouter(): Router {
  const router = Router();

  const repository =
    new EvaluationsRepository();

  const service =
    new EvaluationsService(repository);

  const controller =
    new EvaluationsController(service);

  router.get(
    '/',
    controller.getEvaluations
  );

  router.get(
    '/employees',
    controller.getEmployees
  );

  router.post(
    '/',
    controller.createEvaluation
  );

  router.patch(
    '/details/:id',
    controller.submitReview
  );

  router.patch(
    '/:id/close',
    controller.closeEvaluation
  );

  return router;
}

export default createEvaluationsRouter;