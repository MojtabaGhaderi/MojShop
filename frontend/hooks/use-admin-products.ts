'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Product, ProductCreateInput, ProductUpdateInput } from '@/types';

const KEY = 'admin-products';

export function useAdminProducts(params?: { skip?: number; limit?: number }) {
    return useQuery<Product[]>({
        queryKey: [KEY, params],
        queryFn: async () => {
            const { data } = await api.get<Product[]>('/admin/products', { params });
            return data;
        },
        staleTime: 30_000,
    });
}

export function useCreateProduct() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: ProductCreateInput) => {
            const { data } = await api.post<Product>('/admin/products', payload);
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
    });
}

export function useUpdateProduct() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }: { id: number; payload: ProductUpdateInput }) => {
            const { data } = await api.put<Product>(`/admin/products/${id}`, payload);
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
    });
}

export function useDeactivateProduct() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/admin/products/${id}`);
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
    });
}

export function useUploadProductImage() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ productId, file }: { productId: number; file: File }) => {
            const formData = new FormData();
            formData.append('file', file);
            const { data } = await api.post(`/upload/${productId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
    });
}