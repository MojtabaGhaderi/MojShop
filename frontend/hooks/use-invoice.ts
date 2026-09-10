'use client';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useDownloadInvoice() {
    return useMutation({
        mutationFn: async ({ orderId, guestEmail }: { orderId: number; guestEmail?: string | null }) => {
            const path = guestEmail
                ? `/orders/guest/${orderId}/invoice?email=${encodeURIComponent(guestEmail)}`
                : `/orders/${orderId}/invoice`;
            const { data } = await api.get<{ pdf_url: string }>(path);
            return data.pdf_url;
        },
    });
}