// frontend/components/cart-drawer.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartDrawer } from '@/context/cart-drawer-context';
import { useShopCart } from '@/hooks/use-shop-cart';
import { formatPriceWithCurrency } from '@/lib/utils';
import { IMAGE_DIMENSIONS } from '@/types';

function resolveImageUrl(url?: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || '';
  return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
}

export default function CartDrawer() {
  const drawer = useCartDrawer() as any;
  const isOpen = Boolean(drawer.isOpen);
  const handleClose = () => {
    if (typeof drawer.close === 'function') drawer.close();
    else if (typeof drawer.closeDrawer === 'function') drawer.closeDrawer();
    else if (typeof drawer.setIsOpen === 'function') drawer.setIsOpen(false);
  };

  const cart = useShopCart() as any;
  const rawItems: any[] = cart.items || cart.cart?.items || [];
  const removeItem = (id: any) => {
    if (typeof cart.removeItem === 'function') cart.removeItem(id);
    else if (typeof cart.deleteItem === 'function') cart.deleteItem(id);
  };
  const changeQuantity = (id: any, qty: number) => {
    if (typeof cart.updateItem === 'function') cart.updateItem(id, qty);
    else if (typeof cart.updateQuantity === 'function') cart.updateQuantity(id, qty);
  };

  // Derive totals defensively from items array
  const totalCount = React.useMemo(() => {
    if (typeof cart.totalCount === 'number') return cart.totalCount;
    return rawItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  }, [cart.totalCount, rawItems]);

  const totalPrice = React.useMemo(() => {
    if (typeof cart.totalPrice === 'number') return cart.totalPrice;
    return rawItems.reduce((acc, item) => {
      const price =
        item.product?.current_price ??
        item.unit_price ??
        item.price ??
        0;
      const adj =
        item.variant?.price_adjustment ??
        item.price_adjustment ??
        0;
      return acc + (price + adj) * (item.quantity || 1);
    }, 0);
  }, [cart.totalPrice, rawItems]);

  // Escape listener & scroll lock
  React.useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose();
    }
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 select-none" dir="rtl">
      {/* ── 1. Frosted Scrim Backdrop ── */}
      <div
        className="fixed inset-0 bg-primary/30 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* ── 2. Solid Luxury Drawer Panel ── */}
      <aside
        className="fixed inset-y-0 start-0 z-50 flex w-full max-w-md flex-col border-e border-border/80 bg-background shadow-[0_20px_50px_rgba(23,59,87,0.25)] transition-transform duration-300 ease-out animate-in slide-in-from-start sm:max-w-lg"
        role="dialog"
        aria-modal="true"
        aria-label="سبد خرید شما"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/70 px-6 py-5">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-foreground">سبد خرید شما</h2>
            <span className="inline-flex items-center rounded-full bg-accent/20 px-2.5 py-0.5 text-[11px] font-mono font-medium text-foreground">
              {totalCount.toLocaleString('fa-IR')} عدد
            </span>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-accent hover:bg-muted"
            aria-label="بستن"
          >
            ✕
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin">
          {rawItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-foreground">سبد خرید شما خالی است</p>
              <p className="mt-1 text-xs text-muted-foreground">آثار دست‌ساز و منحصر‌به‌فرد ما را کاوش کنید.</p>
              <button
                type="button"
                onClick={handleClose}
                className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/95 active:scale-95"
              >
                مشاهده گالری محصولات
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {rawItems.map((item) => {
                const product = item.product || item;
                const primaryImg = product?.images?.find((img: any) => img.is_primary) || product?.images?.[0];
                const variantName = item.variant_name || item.variant?.variant_name;
                const priceAdjustment = item.price_adjustment || item.variant?.price_adjustment || 0;
                const baseItemPrice = product?.current_price ?? item.unit_price ?? item.price ?? 0;
                const linePrice = (baseItemPrice + priceAdjustment) * (item.quantity || 1);

                return (
                  <div key={item.id} className="flex gap-4 py-4.5">
                    {/* Thumbnail */}
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-card p-1">
                      {primaryImg ? (
                        <Image
                          src={resolveImageUrl(primaryImg.url)}
                          alt={product?.name || 'محصول'}
                          width={IMAGE_DIMENSIONS.thumb.width}
                          height={IMAGE_DIMENSIONS.thumb.height}
                          unoptimized
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted text-[10px] text-muted-foreground">
                          بدون تصویر
                        </div>
                      )}
                    </div>

                    {/* Meta & Stepper */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            href={`/products/${product?.slug}`}
                            onClick={handleClose}
                            className="text-xs font-semibold text-foreground transition-colors hover:text-accent"
                          >
                            {product?.name}
                          </Link>

                          {variantName && (
                            <span className="mt-0.5 block text-[10px] font-medium text-muted-foreground">
                              اندازه / تنوع: {variantName}
                            </span>
                          )}
                        </div>

                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground transition-colors hover:text-destructive p-1"
                          aria-label="حذف اثر"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>

                      {/* Pricing and Stepper Controls */}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-foreground">
                          {formatPriceWithCurrency(linePrice)}
                        </span>

                        <div className="flex h-8 items-center rounded-lg border border-border bg-card p-0.5 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => changeQuantity(item.id, (item.quantity || 1) - 1)}
                            disabled={(item.quantity || 1) <= 1}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-xs text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="کاهش تعداد"
                          >
                            −
                          </button>
                          <span className="flex w-7 items-center justify-center font-mono text-[11px] font-semibold text-foreground">
                            {(item.quantity || 1).toLocaleString('fa-IR')}
                          </span>
                          <button
                            type="button"
                            onClick={() => changeQuantity(item.id, (item.quantity || 1) + 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-xs text-foreground hover:bg-muted"
                            aria-label="افزایش تعداد"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Anchored Footer */}
        {rawItems.length > 0 && (
          <div className="border-t border-border/80 bg-card/70 p-6 backdrop-blur-md">
            <div className="flex items-center justify-between pb-4 text-xs">
              <span className="text-muted-foreground font-medium">مجموع کل خرید:</span>
              <span className="font-mono text-sm font-bold text-foreground">
                {formatPriceWithCurrency(totalPrice)}
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              <Link
                href="/checkout"
                onClick={handleClose}
                className="flex h-12 w-full cursor-pointer items-center justify-between rounded-xl bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-[0_4px_16px_rgba(23,59,87,0.2)] transition-all hover:bg-primary/95 active:scale-[0.99]"
              >
                <span>تکمیل سفارش و پرداخت</span>
                <span className="font-mono font-medium text-primary-foreground/90">
                  {formatPriceWithCurrency(totalPrice)}
                </span>
              </Link>

              <Link
                href="/cart"
                onClick={handleClose}
                className="flex h-10 w-full cursor-pointer items-center justify-center rounded-xl border border-border bg-transparent text-xs font-medium text-foreground transition-colors hover:bg-muted/50"
              >
                مشاهده کامل سبد خرید
              </Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}