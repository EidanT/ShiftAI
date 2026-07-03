import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('El correo debe ser válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export type LoginDto = z.infer<typeof LoginSchema>;

export interface AuthUser {
  id: string;
  email?: string;
  role?: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
}

export interface LoginResult {
  user: AuthUser;
  session: AuthSession;
}
