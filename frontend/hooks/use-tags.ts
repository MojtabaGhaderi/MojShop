'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Tag } from '@/types';

export function useTags() {
    return useQuery<Tag[]>({
        queryKey: ['tags'],
        queryFn: async () => (await api.get<Tag[]>('/products/tags')).data,
        staleTime: 5 * 60_000,
    });
}