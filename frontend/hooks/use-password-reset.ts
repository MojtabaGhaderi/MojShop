'use client';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useForgotPassword() {
    return useMutation({
        mutationFn: async (email: string) => (await api.post<{ message: string }>('/auth/forgot-password', { email })).data,
    });
}

export function useResetPassword() {
    return useMutation({
        mutationFn: async ({ token, new_password }: { token: string; new_password: string }) =>
            (await api.post<{ message: string }>('/auth/reset-password', { token, new_password })).data,
    });
}