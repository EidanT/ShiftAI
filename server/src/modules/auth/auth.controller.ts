import type { Request, Response, NextFunction } from 'express';
import type { AuthService } from './auth.service';
import type { LoginDto } from './auth.types';
import { HttpError } from '../../utils/httpError';

export class AuthController {
  constructor(private readonly service: AuthService) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.login(req.body as LoginDto);
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const header = req.headers.authorization;
      const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;

      if (!token) {
        throw new HttpError(401, 'No se proporcionó un token de autenticación');
      }

      await this.service.logout(token);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  me = (req: Request, res: Response): void => {
    res.json({ user: req.user });
  };
}
