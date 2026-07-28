'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/hooks/use-cart';
import { formatPriceWithCurrency, getPrimaryImage } from '@/lib/utils';
import { IMAGE_DIMENSIONS } from '@/types';

export default function CartPage() {
  const { items, total, updateItem, removeItem, clearCart, isLoading } = useCart();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="h-7 w-32 animate-pulse rounded bg-surface-sunken mb-6" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4 border-b border-border-default py-4 animate-pulse">
            <div className="h-24 w-24 shrink-0 rounded-md bg-surface-elevated" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-surface-sunken" />
              <div className="h-4 w-1/3 rounded bg-surface-sunken" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-primary-subtle">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
        <h1 className="mt-6 text-xl font-bold text-primary">سبد خرید شما خالی است</h1>
        <p className="mt-2 text-sm text-primary-muted">
          محصولات مورد علاقه خود را بررسی کنید و به سبد خرید اضافه کنید.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-accent px-6 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover"
        >
          مشاهده محصولات
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary">سبد خرید</h1>
        <button
          type="button"
          onClick={() => clearCart()}
          className="text-xs text-error transition-colors hover:underline"
        >
          پاک کردن سبد
        </button>
      </div>

      <ul className="divide-y divide-border-default">
        {items.map((item) => {
          const img = getPrimaryImage(item.product.images);
          return (
            <li key={item.id} className="flex gap-4 py-4">
              <Link href={`/products/${item.product.slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-md bg-surface-elevated">
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
              </Link>

              <div className="min-w-0 flex-1">
                <Link href={`/products/${item.product.slug}`} className="text-sm font-medium text-primary hover:text-accent">
                  {item.product.name}
                </Link>
                <p className="mt-1 text-sm text-primary-muted">
                  {formatPriceWithCurrency(item.product.current_price)}
                </p>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center rounded-lg border border-border-default">
                    <button
                      type="button"
                      onClick={() =>
                        item.quantity > 1
                          ? updateItem({ product_id: item.product_id, quantity: item.quantity - 1 })
                          : removeItem(item.product_id)
                      }
                      className="flex h-9 w-9 items-center justify-center text-sm hover:bg-surface-sunken"
                      aria-label="کاهش"
                    >
                      −
                    </button>
                    <span className="flex h-9 w-9 items-center justify-center border-s border-border-default text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateItem({ product_id: item.product_id, quantity: item.quantity + 1 })
                      }
                      className="flex h-9 w-9 items-center justify-center text-sm hover:bg-surface-sunken"
                      aria-label="افزایش"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.product_id)}
                    className="text-xs text-error transition-colors hover:underline"
                  >
                    حذف
                  </button>
                </div>
              </div>

              <div className="flex w-28 shrink-0 flex-col items-end justify-between">
                <span className="text-sm font-bold text-primary">
                  {formatPriceWithCurrency(item.product.current_price * item.quantity)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Summary */}
      <div className="mt-6 rounded-lg border border-border-default bg-surface-elevated p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-primary-muted">جمع کل ({items.length} کالا):</span>
          <span className="text-lg font-bold text-primary">
            {formatPriceWithCurrency(total)}
          </span>
        </div>
        <Link
          href="/checkout"
          className="mt-4 block h-12 w-full rounded-lg bg-accent text-center text-sm font-medium text-on-accent leading-[3rem] transition-colors hover:bg-accent-hover"
        >
          تکمیل سفارش و پرداخت
        </Link>
        <Link
          href="/products"
          className="mt-2 block h-10 w-full rounded-lg border border-border-default text-center text-sm font-medium text-primary leading-[2.5rem] transition-colors hover:bg-surface-sunken"
        >
          ادامه خرید
        </Link>
      </div>
    </div>
  );
}