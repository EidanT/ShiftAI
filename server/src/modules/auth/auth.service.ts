import { getSupabaseAuth } from '../../config/supabase';
import { env } from '../../config/env';
import { HttpError } from '../../utils/httpError';
import type { LoginDto, LoginResult } from './auth.types';

export class AuthService {
  async login({ email, password }: LoginDto): Promise<LoginResult> {
    const { data, error } = await getSupabaseAuth().auth.signInWithPassword({ email, password });

    if (error || !data.session || !data.user) {
      throw new HttpError(401, 'Correo o contraseña incorrectos');
    }

    return {
      user: { id: data.user.id, email: data.user.email, role: data.user.role },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
    };
  }

  async logout(accessToken: string): Promise<void> {
    const response = await fetch(`${env.SUPABASE_URL}/auth/v1/logout?scope=local`, {
      method: 'POST',
      headers: {
        apikey: env.SUPABASE_PUBLISHABLE_KEY ?? '',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new HttpError(400, 'No se pudo cerrar la sesión');
    }
  }
}
