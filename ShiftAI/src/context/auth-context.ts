import { createContext } from 'react';
import type { AuthUser } from '../api/auth';

export interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
