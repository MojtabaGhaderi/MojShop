'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Variant } from '@/types';

const KEY = 'admin-products'; // variants are nested in the product payload, so invalidate the same key

export function useCreateVariant() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ productId, payload }: {
            productId: number;
            payload: { variant_name: string; sku?: string; price_adjustment: number; stock_quantity: number };
        }) => (await api.post<Variant>(`/admin/products/${productId}/variants`, payload)).data,
        onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
    });
}

export function useUpdateVariant() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ variantId, payload }: {
            variantId: number;
            payload: Partial<{ variant_name: string; sku: string; price_adjustment: number; stock_quantity: number; is_active: boolean }>;
        }) => (await api.put<Variant>(`/admin/variants/${variantId}`, payload)).data,
        onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
    });
}

export function useDeleteVariant() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (variantId: number) => { await api.delete(`/admin/variants/${variantId}`); },
        onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
    });
}