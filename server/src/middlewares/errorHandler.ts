import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(400).json({ errors: err.flatten().fieldErrors });
    return;
  }

  if (err.message.includes('credentials not configured')) {
    logger.warn('Intento de acceso a Supabase sin credenciales configuradas');
    res.status(503).json({ error: 'Base de datos no configurada aún' });
    return;
  }

  logger.error({ err }, err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
}
