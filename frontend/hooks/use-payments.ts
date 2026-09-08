'use client';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { PaymentCreateResponse, PaymentVerifyResponse } from '@/types';

export function useCreatePayment() {
    return useMutation({
        mutationFn: async (orderId: number) => {
            const { data } = await api.post<PaymentCreateResponse>('/payments/create', { order_id: orderId });
            return data;
        },
    });
}

export function useVerifyPayment() {
    return useMutation({
        mutationFn: async ({ orderId, authority }: { orderId: number; authority: string }) => {
            const { data } = await api.post<PaymentVerifyResponse>(
                '/payments/verify',
                { order_id: orderId, authority }
            );
            return data;
        },
    });
}