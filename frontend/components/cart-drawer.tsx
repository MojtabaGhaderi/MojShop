'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/hooks/use-cart';
import { formatPriceWithCurrency, getPrimaryImage } from '@/lib/utils';
import { IMAGE_DIMENSIONS } from '@/types';

// Shared state via a simple event-based approach
type CartDrawerOpenFn = (open: boolean) => void;
let setCartDrawerOpen: CartDrawerOpenFn | null = null;

export function openCartDrawer() {
  setCartDrawerOpen?.(true);
}

export default function CartDrawer() {
  const [open, setOpen] = useState(false);
  const { items, total, updateItem, removeItem } = useCart();

  // Expose setter globally
  useEffect(() => {
    setCartDrawerOpen = setOpen;
    return () => {
      setCartDrawerOpen = null;
    };
  }, []);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false);
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, handleEscape]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="fade-in absolute inset-0 bg-primary/40"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer — slides from end (left in RTL) */}
      <div className="slide-in-end relative z-10 flex h-full w-full max-w-sm flex-col bg-surface shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-default px-4 py-4">
          <h2 className="text-base font-bold text-primary">
            سبد خرید ({items.length})
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-primary transition-colors hover:bg-surface-sunken"
            aria-label="بستن سبد خرید"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary-subtle">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <p className="mt-4 text-sm text-primary-muted">سبد خرید شما خالی است</p>
              <Link
                href="/products"
                onClick={() => setOpen(false)}
                className="mt-3 text-sm font-medium text-accent hover:text-accent-hover"
              >
                مشاهده محصولات
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border-default">
              {items.map((item) => {
                const img = getPrimaryImage(item.product.images);
                return (
                  <li key={item.id} className="flex gap-3 px-4 py-3">
                    {/* Thumbnail */}
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-surface-elevated">
                      {img ? (
                        <Image
                          src={img}
                          alt={item.product.name}
                          width={IMAGE_DIMENSIONS.thumb.width}
                          height={IMAGE_DIMENSIONS.thumb.height}
                          unoptimized
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-primary-subtle">—</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/products/${item.product.slug}`}
                        onClick={() => setOpen(false)}
                        className="line-clamp-1 text-sm font-medium text-primary hover:text-accent"
                      >
                        {item.product.name}
                      </Link>
                      <p className="mt-1 text-xs text-primary-muted">
                        {formatPriceWithCurrency(item.product.current_price)}
                      </p>

                      {/* Quantity controls */}
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            item.quantity > 1
                              ? updateItem({ product_id: item.product_id, quantity: item.quantity - 1 })
                              : removeItem(item.product_id)
                          }
                          className="flex h-7 w-7 items-center justify-center rounded border border-border-default text-xs hover:bg-surface-sunken"
                          aria-label="کاهش"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-xs font-medium">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() =>
                            updateItem({ product_id: item.product_id, quantity: item.quantity + 1 })
                          }
                          className="flex h-7 w-7 items-center justify-center rounded border border-border-default text-xs hover:bg-surface-sunken"
                          aria-label="افزایش"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Line total + remove */}
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-medium text-primary">
                        {formatPriceWithCurrency(item.product.current_price * item.quantity)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.product_id)}
                        className="text-xs text-error transition-colors hover:underline"
                        aria-label="حذف از سبد"
                      >
                        حذف
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border-default px-4 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-primary-muted">جمع کل:</span>
              <span className="text-base font-bold text-primary">{formatPriceWithCurrency(total)}</span>
            </div>
            <Link
              href="/cart"
              onClick={() => setOpen(false)}
              className="block h-11 w-full rounded-lg border border-accent text-center text-sm font-medium text-accent transition-colors hover:bg-accent-subtle"
            >
              مشاهده سبد خرید
            </Link>
            <Link
              href="/checkout"
              onClick={() => setOpen(false)}
              className="block h-11 w-full rounded-lg bg-accent text-center text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover"
            >
              تکمیل سفارش
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}