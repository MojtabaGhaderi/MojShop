'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { CartItem, CartItemAdd, CartItemUpdate } from '@/types';

const CART_KEY = 'cart';

export function useCart() {
  const queryClient = useQueryClient();

  const query = useQuery<CartItem[]>({
    queryKey: [CART_KEY],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return [];
      try {
        const { data } = await api.get<CartItem[]>('/cart/');
        return data;
      } catch {
        return [];
      }
    },
    staleTime: 30_000,
  });

  const addItemMutation = useMutation({
    mutationFn: async (item: CartItemAdd) => {
      const { data } = await api.post('/cart/', item);
      return data;
    },
    onMutate: async (item) => {
      await queryClient.cancelQueries({ queryKey: [CART_KEY] });
      const previous = queryClient.getQueryData<CartItem[]>([CART_KEY]) ?? [];
      queryClient.setQueryData<CartItem[]>([CART_KEY], (old = []) => {
        const existing = old.find((c) => c.product_id === item.product_id);
        if (existing) {
          return old.map((c) =>
            c.product_id === item.product_id
              ? { ...c, quantity: c.quantity + item.quantity }
              : c
          );
        }
        return [...old, { id: Date.now(), product_id: item.product_id, quantity: item.quantity, product: { name: '', slug: '', current_price: 0, images: [] } }];
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData([CART_KEY], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [CART_KEY] });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ product_id, quantity }: CartItemUpdate & { product_id: number }) => {
      const { data } = await api.put(`/cart/${product_id}`, { quantity });
      return data;
    },
    onMutate: async ({ product_id, quantity }) => {
      await queryClient.cancelQueries({ queryKey: [CART_KEY] });
      const previous = queryClient.getQueryData<CartItem[]>([CART_KEY]) ?? [];
      queryClient.setQueryData<CartItem[]>([CART_KEY], (old = []) =>
        old.map((c) => (c.product_id === product_id ? { ...c, quantity } : c))
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData([CART_KEY], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [CART_KEY] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (product_id: number) => {
      await api.delete(`/cart/${product_id}`);
    },
    onMutate: async (product_id) => {
      await queryClient.cancelQueries({ queryKey: [CART_KEY] });
      const previous = queryClient.getQueryData<CartItem[]>([CART_KEY]) ?? [];
      queryClient.setQueryData<CartItem[]>([CART_KEY], (old = []) =>
        old.filter((c) => c.product_id !== product_id)
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData([CART_KEY], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [CART_KEY] });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      await api.delete('/cart/');
    },
    onSuccess: () => {
      queryClient.setQueryData<CartItem[]>([CART_KEY], []);
    },
  });

  const itemCount = (query.data ?? []).reduce((sum, item) => sum + item.quantity, 0);
  const total = (query.data ?? []).reduce(
    (sum, item) => sum + item.product.current_price * item.quantity,
    0
  );

  return {
    items: query.data ?? [],
    itemCount,
    total,
    isLoading: query.isLoading,
    addItem: addItemMutation.mutateAsync,
    updateItem: updateItemMutation.mutateAsync,
    removeItem: removeItemMutation.mutateAsync,
    clearCart: clearCartMutation.mutateAsync,
    isAdding: addItemMutation.isPending,
  };
}
