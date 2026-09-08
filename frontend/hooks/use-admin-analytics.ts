// use-admin-analytics.ts
'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AdminAnalytics } from '@/types';

export function useAdminAnalytics() {
    return useQuery<AdminAnalytics>({
        queryKey: ['admin-analytics'],
        queryFn: async () => (await api.get<AdminAnalytics>('/admin/analytics')).data,
        staleTime: 30_000,
    });
}