'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from '@/types';

const AUTH_KEY = 'auth';

export function useAuth() {
  const queryClient = useQueryClient();

  const userQuery = useQuery<AuthUser | null>({    queryKey: [AUTH_KEY, 'me'],    queryFn: async () => {      const token = localStorage.getItem('auth_token');      if (!token) return null;
      try {
        const { data } = await api.get<AuthUser>('/auth/me');
        return data;
      } catch {
        localStorage.removeItem('auth_token');
        return null;
      }
    },    retry: false,
    staleTime: 5 * 60_000,
  });

  const loginMutation = useMutation({
    mutationFn: async (creds: LoginRequest) => {
      const { data } = await api.post<AuthResponse>('/auth/login', creds);
      localStorage.setItem('auth_token', data.access_token);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AUTH_KEY] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (creds: RegisterRequest) => {
      const { data } = await api.post<AuthResponse>('/auth/register', creds);
      localStorage.setItem('auth_token', data.access_token);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AUTH_KEY] });
    },
  });

  function logout() {
    localStorage.removeItem('auth_token');
    queryClient.setQueryData<AuthUser | null>([AUTH_KEY, 'me'], null);
    queryClient.invalidateQueries({ queryKey: [AUTH_KEY] });
    queryClient.invalidateQueries({ queryKey: ['cart'] });
  }

  return {
    user: userQuery.data ?? null,
    isAuthenticated: !!userQuery.data,
    isLoading: userQuery.isLoading,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
}
