import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { env } from '../config/env';
import { HttpError } from '../utils/httpError';

let _jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwks(): ReturnType<typeof createRemoteJWKSet> {
  if (_jwks) return _jwks;

  if (!env.SUPABASE_JWKS_URL) {
    throw new Error('Supabase credentials not configured. Set SUPABASE_JWKS_URL in .env');
  }

  _jwks = createRemoteJWKSet(new URL(env.SUPABASE_JWKS_URL));
  return _jwks;
}

export const requireAuth: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;

    if (!token) {
      throw new HttpError(401, 'No se proporcionó un token de autenticación');
    }

    const { payload } = await jwtVerify(token, getJwks());

    req.user = {
      id: String(payload.sub),
      email: typeof payload.email === 'string' ? payload.email : undefined,
      role: typeof payload.role === 'string' ? payload.role : undefined,
    };

    next();
  } catch (err) {
    if (err instanceof HttpError) {
      next(err);
      return;
    }
    next(new HttpError(401, 'Token inválido o expirado'));
  }
};
