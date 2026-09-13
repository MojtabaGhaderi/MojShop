'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Banner } from '@/types';

const KEY = 'admin-banners';

export function useAdminBanners() {
    return useQuery<Banner[]>({
        queryKey: [KEY],
        queryFn: async () => (await api.get<Banner[]>('/admin/banners')).data,
    });
}

export function useCreateBanner() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: Partial<Banner>) => (await api.post<Banner>('/admin/banners', payload)).data,
        onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); qc.invalidateQueries({ queryKey: ['banners'] }); },
    });
}

export function useUpdateBanner() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }: { id: number; payload: Partial<Banner> }) => (await api.put<Banner>(`/admin/banners/${id}`, payload)).data,
        onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); qc.invalidateQueries({ queryKey: ['banners'] }); },
    });
}

export function useDeleteBanner() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => { await api.delete(`/admin/banners/${id}`); },
        onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); qc.invalidateQueries({ queryKey: ['banners'] }); },
    });
}