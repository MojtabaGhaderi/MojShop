'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Tag } from '@/types';

const TAGS_KEY = ['admin-tags'];

export type TagPayload = {
    name: string;
    slug: string;
};

export function useAdminTags() {
    return useQuery<Tag[]>({
        queryKey: TAGS_KEY,
        queryFn: async () => {
            const { data } = await api.get('/admin/tags');
            return data;
        },
    });
}

export function useCreateTag() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: TagPayload) => {
            const { data } = await api.post('/admin/tags', payload);
            return data as Tag;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: TAGS_KEY,
            });
        },
    });
}

export function useUpdateTag() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            payload,
        }: {
            id: number;
            payload: TagPayload;
        }) => {
            const { data } = await api.put(
                `/admin/tags/${id}`,
                payload,
            );

            return data as Tag;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: TAGS_KEY,
            });
        },
    });
}

export function useDeleteTag() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/admin/tags/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: TAGS_KEY,
            });
        },
    });
}   