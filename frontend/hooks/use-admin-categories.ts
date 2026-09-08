// frontend/hooks/use-admin-categories.ts
'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Category } from '@/types';

const KEY = 'admin-categories';

export function useAdminCategories() {
    return useQuery<Category[]>({
        queryKey: [KEY],
        queryFn: async () => (await api.get<Category[]>('/admin/categories')).data,
        staleTime: 30_000,
    });
}

export function useCreateCategory() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: { name: string; slug: string; description?: string }) =>
            (await api.post<Category>('/admin/categories', payload)).data,
        onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); qc.invalidateQueries({ queryKey: ['categories'] }); },
    });
}

export function useUpdateCategory() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }: { id: number; payload: Partial<{ name: string; slug: string; description: string; is_active: boolean }> }) =>
            (await api.put<Category>(`/admin/categories/${id}`, payload)).data,
        onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); qc.invalidateQueries({ queryKey: ['categories'] }); },
    });
}

export function useDeleteCategory() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => { await api.delete(`/admin/categories/${id}`); },
        onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); qc.invalidateQueries({ queryKey: ['categories'] }); },
    });
}