'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductGrid from '@/components/product-grid';
import ProductFilters from '@/components/product-filters';
import { useProducts } from '@/hooks/use-products';
import type { MetalType } from '@/types';
import { PRODUCTS_PAGE_SIZE } from '@/lib/constants';

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const category = searchParams.get('category') ?? '';
  const metal = (searchParams.get('metal') as MetalType) ?? '';
  const search = searchParams.get('search') ?? '';
  const page = Number(searchParams.get('page') ?? 1);
  const skip = (page - 1) * PRODUCTS_PAGE_SIZE;

  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // Debounce search 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useProducts({
    category: category || undefined,
    metal: (metal as MetalType) || undefined,
    search: debouncedSearch || undefined,
    skip,
    limit: PRODUCTS_PAGE_SIZE,
  });

  const products = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PRODUCTS_PAGE_SIZE);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, val] of Object.entries(updates)) {
        if (val) {
          params.set(key, val);
        } else {
          params.delete(key);
        }
      }
      params.delete('page');
      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams]
  );

  function handleCategoryChange(slug: string) {
    updateParams({ category: slug });
    if (filterDrawerOpen) setFilterDrawerOpen(false);
  }

  function handleMetalChange(m: MetalType | '') {
    updateParams({ metal: m });
    if (filterDrawerOpen) setFilterDrawerOpen(false);
  }

  function handleSearchChange(value: string) {
    updateParams({ search: value });
  }

  function handlePageChange(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (p > 1) {
      params.set('page', String(p));
    } else {
      params.delete('page');
    }
    router.push(`/products?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-primary sm:text-2xl">محصولات</h1>
        {(category || metal || search) && (
          <p className="mt-1 text-sm text-primary-muted">
            {search && `جستجو: «${search}»`}
            {search && category && ' — '}
            {category && `دسته‌بندی: ${category}`}
            {(search || category) && metal && ' — '}
            {metal && `فلز: ${metal}`}
          </p>
        )}
      </div>

      {/* Mobile filter toggle */}
      <div className="mb-4 flex items-center gap-3 lg:hidden">
        <button
          type="button"
          onClick={() => setFilterDrawerOpen(true)}
          className="flex h-10 items-center gap-2 rounded-lg border border-border-default px-4 text-sm font-medium text-primary transition-colors hover:bg-surface-sunken"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="8" y1="12" x2="20" y2="12" />
            <line x1="11" y1="18" x2="20" y2="18" />
          </svg>
          فیلترها
        </button>
        <span className="text-xs text-primary-subtle">
          {total > 0 ? `${total} محصول` : ''}
        </span>
      </div>

      <div className="flex gap-6">
        {/* Desktop sidebar filters */}
        <ProductFilters
          selectedCategory={category}
          selectedMetal={metal}
          search={search}
          onCategoryChange={handleCategoryChange}
          onMetalChange={handleMetalChange}
          onSearchChange={handleSearchChange}
        />

        {/* Mobile filter drawer */}
        {filterDrawerOpen && (
          <ProductFilters
            selectedCategory={category}
            selectedMetal={metal}
            search={search}
            onCategoryChange={handleCategoryChange}
            onMetalChange={handleMetalChange}
            onSearchChange={handleSearchChange}
            onClose={() => setFilterDrawerOpen(false)}
          />
        )}

        {/* Product listing */}
        <div className="min-w-0 flex-1">
          {/* Desktop count + sort */}
          <div className="mb-4 hidden items-center justify-between lg:flex">
            <span className="text-sm text-primary-muted">
              {total > 0 ? `${total} محصول` : 'محصولی یافت نشد'}
            </span>
          </div>

          <ProductGrid products={products} isLoading={isLoading} />

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-1" aria-label="صفحه‌بندی">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-sm text-primary transition-colors hover:bg-surface-sunken disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="صفحه قبلی"
              >
                →
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  if (totalPages <= 7) return true;
                  if (p === 1 || p === totalPages) return true;
                  if (Math.abs(p - page) <= 1) return true;
                  return false;
                })
                .map((p, idx, arr) => {
                  const showEllipsis = idx > 0 && p - (arr[idx - 1] as number) > 1;
                  return (
                    <span key={p} className="flex items-center">
                      {showEllipsis && (
                        <span className="px-1 text-xs text-primary-subtle">...</span>
                      )}
                      <button
                        type="button"
                        onClick={() => handlePageChange(p)}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                          p === page
                            ? 'bg-accent text-on-accent'
                            : 'text-primary hover:bg-surface-sunken'
                        }`}
                        aria-current={p === page ? 'page' : undefined}
                      >
                        {p}
                      </button>
                    </span>
                  );
                })}
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => handlePageChange(page + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-sm text-primary transition-colors hover:bg-surface-sunken disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="صفحه بعدی"
              >
                ←
              </button>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-6"><div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">{Array.from({length: 8}).map((_, i) => <div key={i} className="aspect-square animate-pulse rounded-lg bg-surface-elevated" />)}</div></div>}>
      <ProductsContent />
    </Suspense>
  );
}
