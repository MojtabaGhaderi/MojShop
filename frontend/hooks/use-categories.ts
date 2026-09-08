// use-categories.ts
'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Category } from '@/types';

export function useCategories() {
    return useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: async () => (await api.get<Category[]>('/categories')).data,
        staleTime: 5 * 60_000,
    });
}