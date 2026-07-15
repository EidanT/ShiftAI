import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as authApi from '../api/auth';
import { readStoredSession, writeStoredSession, clearStoredSession } from '../api/session';
import type { AuthUser } from '../api/types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { AuthContext } from './auth-context';

interface Session {
  user: AuthUser;
  accessToken: string;
}

const skipAuthInDev = import.meta.env.DEV && import.meta.env.VITE_SKIP_AUTH === 'true';

const devSession: Session = {
  user: {
    id: 'dev-user',
    email: 'dev@shiftai.local',
    role: 'HR Manager',
  },
  accessToken: 'dev-access-token',
};

async function fetchSession(): Promise<Session | null> {
  if (skipAuthInDev) return devSession;

  const stored = readStoredSession();
  if (!stored) return null;

  try {
    const { user } = await authApi.me();
    return { user, accessToken: stored.access_token };
  } catch {
    clearStoredSession();
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: fetchSession,
    enabled: skipAuthInDev || !!readStoredSession(),
    staleTime: Infinity,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (result) => {
      writeStoredSession(result.session);
      queryClient.setQueryData<Session>(['auth', 'session'], {
        user: result.user,
        accessToken: result.session.access_token,
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      if (skipAuthInDev) return;

      const tasks: Promise<unknown>[] = [authApi.logout()];
      if (isSupabaseConfigured) {
        tasks.push(supabase.auth.signOut());
      }
      await Promise.allSettled(tasks);
    },
    onSettled: () => {
      clearStoredSession();
      queryClient.setQueryData<Session | null>(['auth', 'session'], null);
    },
  });

  // Bridges the session created by the Google OAuth redirect (handled by the
  // browser-side Supabase client) into the same storage the rest of the app reads.
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, oauthSession) => {
      if (event !== 'SIGNED_IN' || !oauthSession) return;

      writeStoredSession({
        access_token: oauthSession.access_token,
        refresh_token: oauthSession.refresh_token,
        expires_at: oauthSession.expires_at,
      });

      authApi.me().then(({ user }) => {
        queryClient.setQueryData<Session>(['auth', 'session'], {
          user,
          accessToken: oauthSession.access_token,
        });
      });
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const login = async (email: string, password: string): Promise<void> => {
    if (skipAuthInDev) return;

    await loginMutation.mutateAsync({ email, password });
  };

  const loginWithGoogle = async (): Promise<void> => {
    if (skipAuthInDev) return;

    if (!isSupabaseConfigured) {
      throw new Error(
        'Supabase no esta configurado. Define VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY en ShiftAI/.env.',
      );
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
  };

  const logout = async (): Promise<void> => {
    await logoutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider
      value={{
        user: skipAuthInDev ? devSession.user : (sessionQuery.data?.user ?? null),
        accessToken: skipAuthInDev ? devSession.accessToken : (sessionQuery.data?.accessToken ?? null),
        loading: skipAuthInDev ? false : sessionQuery.isLoading,
        error: loginMutation.error?.message ?? null,
        login,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
