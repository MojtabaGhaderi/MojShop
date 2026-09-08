'use client';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

import type { PromoValidateResponse } from '@/types';

export function useValidatePromo() {
    return useMutation({
        mutationFn: async ({ code, subtotal }: { code: string; subtotal: number }) => {
            const { data } = await api.post<PromoValidateResponse>('/promos/validate', { code, subtotal });
            return data;
        },
    });
}