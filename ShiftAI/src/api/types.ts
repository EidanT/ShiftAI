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
