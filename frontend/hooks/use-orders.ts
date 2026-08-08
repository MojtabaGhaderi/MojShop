'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Order, OrderCreate } from '@/types';

const ORDERS_KEY = 'orders';

export function useOrders() {
    return useQuery<Order[]>({
        queryKey: [ORDERS_KEY],
        queryFn: async () => {
            const { data } = await api.get<Order[]>('/orders/');
            return data;
        },
        enabled: typeof window !== 'undefined' && !!localStorage.getItem('auth_token'),
    });
}

export function useOrder(orderId: number | null) {
    return useQuery<Order>({
        queryKey: [ORDERS_KEY, orderId],
        queryFn: async () => {
            const { data } = await api.get<Order>(`/orders/${orderId}`);
            return data;
        },
        enabled:
            typeof window !== 'undefined' &&
            !!localStorage.getItem('auth_token') &&
            orderId != null &&
            orderId > 0,
    });
}

export function useCreateOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: OrderCreate) => {
            const { data } = await api.post<Order>('/orders/', payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
    });
}