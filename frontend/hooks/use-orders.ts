'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Order, OrderCreate, GuestOrderCreate } from '@/types';


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

export function useCreateGuestOrder() {
    return useMutation({
        mutationFn: async (payload: GuestOrderCreate) => {
            const { data } = await api.post<Order>('/orders/guest', payload);
            return data;
        },
    });
}

export function useGuestOrder(orderId: number | null, guestEmail: string | null) {
    return useQuery<Order>({
        queryKey: ['orders', 'guest', orderId, guestEmail],
        queryFn: async () => {
            const { data } = await api.get<Order>(`/orders/guest/${orderId}`, { params: { email: guestEmail } });
            return data;
        },
        enabled: orderId !== null && !!guestEmail,
    });
}