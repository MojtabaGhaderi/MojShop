'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PRODUCTS_PAGE_SIZE } from '@/lib/constants';
import type { ProductsResponse, ProductFilters } from '@/types';

export function useProducts(filters: ProductFilters) {
  return useQuery<ProductsResponse>({
    queryKey: ['products', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.category) params.set('category', filters.category);
      if (filters.metal) params.set('metal', filters.metal);
      if (filters.tags) params.set('tags', filters.tags);
      if (filters.search) params.set('search', filters.search);
      params.set('skip', String(filters.skip ?? 0));
      params.set('limit', String(filters.limit ?? PRODUCTS_PAGE_SIZE));
      const { data } = await api.get<ProductsResponse>(`/products/?${params.toString()}`);
      return data;
    },
    placeholderData: (prev) => prev,
    staleTime: 60_000,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data } = await api.get(`/products/${slug}`);
      return data;
    },
    enabled: !!slug,
    staleTime: 60_000,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories/');
      return data;
    },
    staleTime: 10 * 60_000,
  });
}
