'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Banner, BannerPlacement } from '@/types';

export function useBanners(placement?: BannerPlacement) {
    return useQuery<Banner[]>({
        queryKey: ['banners', placement],
        queryFn: async () => (await api.get<Banner[]>('/banners/', { params: placement ? { placement } : {} })).data,
        staleTime: 60_000,
    });
}