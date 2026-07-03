import { Router } from 'express';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { validate } from '../../middlewares/validate';
import { requireAuth } from '../../middlewares/auth';
import { writeLimiter } from '../../middlewares/rateLimiter';
import { LoginSchema } from './auth.types';

export function createAuthRouter(): Router {
  const router = Router();

  const service = new AuthService();
  const controller = new AuthController(service);

  router.post('/login', writeLimiter, validate(LoginSchema), controller.login);
  router.post('/logout', writeLimiter, requireAuth, controller.logout);
  router.get('/me', requireAuth, controller.me);

  return router;
}
