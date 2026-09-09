'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Review, ReviewCreate } from '@/types';

export function useReviews(slug: string) {
    return useQuery<Review[]>({
        queryKey: ['reviews', slug],
        queryFn: async () => (await api.get<Review[]>(`/products/${slug}/reviews/`)).data,
        staleTime: 30_000,
    });
}

export function useCreateReview(slug: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: ReviewCreate) => (await api.post<Review>(`/products/${slug}/reviews/`, payload)).data,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['reviews', slug] });
            qc.invalidateQueries({ queryKey: ['product', slug] }); // refreshes average_rating/review_count if you cache single-product fetches under this key elsewhere
        },
    });
}

export function useDeleteReview(slug: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (reviewId: number) => { await api.delete(`/products/${slug}/reviews/${reviewId}`); },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['reviews', slug] });
            qc.invalidateQueries({ queryKey: ['product', slug] });
        },
    });
}