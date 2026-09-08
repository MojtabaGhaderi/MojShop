// frontend/hooks/use-admin-users.ts
'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AuthUser } from '@/types';

const KEY = 'admin-users';

export function useAdminUsers(params?: { skip?: number; limit?: number }) {
    return useQuery<AuthUser[]>({
        queryKey: [KEY, params],
        queryFn: async () => (await api.get<AuthUser[]>('/admin/users', { params })).data,
        staleTime: 30_000,
    });
}

export function useUpdateUserFlags() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }: { id: number; payload: { is_active?: boolean; is_admin?: boolean } }) =>
            (await api.patch<AuthUser>(`/admin/users/${id}`, payload)).data,
        onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
    });
}