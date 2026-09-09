//components/product-filters.tsx

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { MetalType, Category } from '@/types';
import { api } from '@/lib/api';

interface ProductFiltersProps {
  selectedCategory: string;
  selectedMetal: MetalType | '';
  search: string;
  onCategoryChange: (slug: string) => void;
  onMetalChange: (metal: MetalType | '') => void;
  onSearchChange: (value: string) => void;
  onClose?: () => void;
}

const METAL_OPTIONS: { value: MetalType | ''; label: string }[] = [
  { value: '', label: 'همه فلزات' },
  { value: 'gold', label: 'طلا' },
  { value: 'silver', label: 'نقره' },
  { value: 'platinum', label: 'پلاتین' },
  { value: 'palladium', label: 'پالادیوم' },
];

export default function ProductFilters({
  selectedCategory,
  selectedMetal,
  search,
  onCategoryChange,
  onMetalChange,
  onSearchChange,
  onClose,
}: ProductFiltersProps) {
  const [localSearch, setLocalSearch] = useState(search);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories/');
      return Array.isArray(data) ? data : [];
    },
    staleTime: 10 * 60_000,
  });

  const activeCategories = categories.filter((c) => c.is_active);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearchChange(localSearch);
  }

  const content = (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="search"
            value={localSearch}
            onChange={(e) => {
              setLocalSearch(e.target.value);
              if (e.target.value === '') onSearchChange('');
            }}
            placeholder="جستجوی محصول..."
            className="w-full rounded-lg border border-border-default bg-surface-elevated py-2.5 pe-10 ps-3 text-sm text-primary placeholder:text-primary-subtle focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <button
            type="submit"
            className="absolute inset-y-0 end-0 flex w-10 items-center justify-center text-primary-subtle hover:text-accent"
            aria-label="جستجو"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </form>
      </div>

      {/* Categories */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-primary">دسته‌بندی</h3>
        <ul className="space-y-1">
          <li>
            <button
              type="button"
              onClick={() => onCategoryChange('')}
              className={`w-full rounded-lg px-3 py-2 text-start text-sm transition-colors ${selectedCategory === ''
                  ? 'bg-accent-subtle font-medium text-accent'
                  : 'text-primary-muted hover:bg-surface-sunken hover:text-primary'
                }`}
            >
              همه دسته‌ها
            </button>
          </li>
          {activeCategories.map((cat) => (
            <li key={cat.id}>
              <button
                type="button"
                onClick={() => onCategoryChange(cat.slug)}
                className={`w-full rounded-lg px-3 py-2 text-start text-sm transition-colors ${selectedCategory === cat.slug
                    ? 'bg-accent-subtle font-medium text-accent'
                    : 'text-primary-muted hover:bg-surface-sunken hover:text-primary'
                  }`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Metal type */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-primary">نوع فلز</h3>
        <ul className="space-y-1">
          {METAL_OPTIONS.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => onMetalChange(opt.value)}
                className={`w-full rounded-lg px-3 py-2 text-start text-sm transition-colors ${selectedMetal === opt.value
                    ? 'bg-accent-subtle font-medium text-accent'
                    : 'text-primary-muted hover:bg-surface-sunken hover:text-primary'
                  }`}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  // Mobile: bottom sheet drawer
  if (onClose) {
    return (
      <div className="fixed inset-0 z-50">
        <div className="fade-in absolute inset-0 bg-primary/40" onClick={onClose} aria-hidden="true" />
        <div className="slide-in-bottom relative z-10 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-surface px-4 pb-8 pt-4 shadow-lg scrollbar-thin">
          {/* Drag handle */}
          <div className="mb-4 flex justify-center">
            <div className="h-1 w-10 rounded-full bg-border-strong" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-primary">فیلتر محصولات</h2>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-primary-muted hover:bg-surface-sunken"
              aria-label="بستن فیلترها"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          {content}
        </div>
      </div>
    );
  }

  // Desktop: sidebar
  return <aside className="w-64 shrink-0 pe-6 lg:block hidden">{content}</aside>;
}