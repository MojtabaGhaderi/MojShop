'use client';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useNotifyMe(slug: string) {
    return useMutation({
        mutationFn: async (email: string) =>
            (await api.post<{ message: string }>(`/products/${slug}/notify-me/`, { email })).data,
    });
}