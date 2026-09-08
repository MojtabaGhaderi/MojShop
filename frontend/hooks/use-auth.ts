'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, setTokens, clearTokens, getRefreshToken } from '@/lib/api';
import type { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from '@/types';

const AUTH_KEY = 'auth';

export function useAuth() {
  const queryClient = useQueryClient();

  const userQuery = useQuery<AuthUser | null>({
    queryKey: [AUTH_KEY, 'me'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return null;
      try {
        const { data } = await api.get<AuthUser>('/auth/me');
        return data;
      } catch {
        clearTokens();
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60_000,
  });

  const loginMutation = useMutation({
    mutationFn: async (creds: LoginRequest) => {
      const { data } = await api.post<AuthResponse>('/auth/login', creds);
      setTokens(data.access_token, data.refresh_token);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AUTH_KEY] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (creds: RegisterRequest) => {
      const { data } = await api.post<AuthResponse>('/auth/register', creds);
      setTokens(data.access_token, data.refresh_token);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AUTH_KEY] });
    },
  });

  async function logout() {
    const refresh = getRefreshToken();
    if (refresh) {
      try {
        await api.post('/auth/logout', { refresh_token: refresh });
      } catch {
        // ignore — clear local anyway
      }
    }
    clearTokens();
    queryClient.setQueryData<AuthUser | null>([AUTH_KEY, 'me'], null);
    queryClient.invalidateQueries({ queryKey: [AUTH_KEY] });
    queryClient.invalidateQueries({ queryKey: ['cart'] });
  }

  return {
    user: userQuery.data ?? null,
    isAuthenticated: !!userQuery.data,
    isLoading: userQuery.isLoading,
    isLoginPending: loginMutation.isPending,
    isRegisterPending: registerMutation.isPending,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
}