import { apiClient } from './client';
import type { AuthUser, LoginResult } from './types';
export type { AuthUser, AuthSession, LoginResult } from './types';
export async function login(email: string, password: string): Promise<LoginResult> {
  const { data } = await apiClient.post<LoginResult>('/auth/login', { email, password });
  return data;
}
export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}
export async function me(): Promise<{ user: AuthUser }> {
  const { data } = await apiClient.get<{ user: AuthUser }>('/auth/me');
  return data;
}