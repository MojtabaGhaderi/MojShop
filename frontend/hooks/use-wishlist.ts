'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import type { WishlistItem } from '@/types';

const KEY = 'wishlist';

export function useWishlist() {
    const { isAuthenticated } = useAuth();
    const query = useQuery<WishlistItem[]>({
        queryKey: [KEY],
        queryFn: async () => (await api.get<WishlistItem[]>('/wishlist/')).data,
        enabled: isAuthenticated,
        staleTime: 30_000,
    });

    const qc = useQueryClient();
    const addMutation = useMutation({
        mutationFn: async (productId: number) => (await api.post<WishlistItem>('/wishlist/', { product_id: productId })).data,
        onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
    });
    const removeMutation = useMutation({
        mutationFn: async (productId: number) => { await api.delete(`/wishlist/${productId}`); },
        onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
    });

    const items = query.data ?? [];
    const productIds = new Set(items.map((i) => i.product.id));

    return {
        items,
        isLoading: query.isLoading,
        isInWishlist: (productId: number) => productIds.has(productId),
        add: addMutation.mutateAsync,
        remove: removeMutation.mutateAsync,
        isPending: addMutation.isPending || removeMutation.isPending,
    };
}