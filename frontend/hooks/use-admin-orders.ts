// frontend/hooks/use-admin-orders.ts
'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Order, OrderStatus, PaginatedOrders } from '@/types';

const KEY = 'admin-orders';

export function useAdminOrders(params?: { status?: OrderStatus; skip?: number; limit?: number; user_id?: number }) {
    return useQuery<PaginatedOrders>({
        queryKey: [KEY, params],
        queryFn: async () => (await api.get<PaginatedOrders>('/admin/orders', { params })).data,
        staleTime: 15_000,
        enabled: params === undefined || true, // always fetch; caller controls whether to call the hook at all
    });
}

export function useAdminOrder(id: number | null) {
    return useQuery<Order>({
        queryKey: [KEY, 'detail', id],
        queryFn: async () => (await api.get<Order>(`/admin/orders/${id}`)).data,
        enabled: id !== null,
    });
}

export function useUpdateOrderStatus() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, status }: { id: number; status: OrderStatus }) =>
            (await api.patch<Order>(`/admin/orders/${id}/status`, { status })).data,
        onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
    });
}