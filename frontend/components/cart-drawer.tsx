'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCartDrawer } from '@/context/cart-drawer-context';
import { useShopCart } from '@/hooks/use-shop-cart';
import { formatPriceWithCurrency } from '@/lib/utils';
import { BACKEND_URL } from '@/lib/constants';

function resolveImageUrl(url: string | undefined) {
  if (!url) return null;
  return url.startsWith('http://') || url.startsWith('https://') ? url : `${BACKEND_URL}${url}`;
}

export default function CartDrawer() {
  const { isOpen, close } = useCartDrawer();
  const cart = useShopCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={close} />
      <div className="absolute inset-y-0 end-0 flex w-full max-w-sm flex-col bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-border-default p-4">
          <h2 className="text-base font-semibold text-primary">سبد خرید</h2>
          <button type="button" onClick={close} className="flex h-8 w-8 items-center justify-center rounded-lg text-primary-muted transition-colors hover:bg-surface-sunken" aria-label="بستن">✕</button>
        </div>

        {cart.items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="text-sm text-primary-muted">سبد خرید شما خالی است</p>
            <Link href="/products" onClick={close} className="text-sm font-medium text-accent hover:underline">مشاهده محصولات</Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border-default overflow-y-auto">
              {cart.items.map((item) => {
                const primary = item.product.images.find((i) => i.is_primary) ?? item.product.images[0];
                const imgUrl = resolveImageUrl(primary?.url);
                return (
                  <li key={item.id} className="flex gap-3 p-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-surface-elevated">
                      {imgUrl && <Image src={imgUrl} alt={primary?.alt_text ?? item.product.name} width={64} height={64} unoptimized className="h-full w-full object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-medium text-primary">{item.product.name}</p>
                      <p className="mt-1 text-sm text-primary-muted">{formatPriceWithCurrency(item.product.current_price)}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center rounded-lg border border-border-default">
                          <button type="button" onClick={() => cart.updateItem(item.id, Math.max(1, item.quantity - 1))} className="flex h-7 w-7 items-center justify-center text-primary hover:bg-surface-sunken" aria-label="کاهش تعداد">−</button>
                          <span className="flex h-7 w-8 items-center justify-center text-xs font-medium">{item.quantity}</span>
                          <button type="button" onClick={() => cart.updateItem(item.id, item.quantity + 1)} className="flex h-7 w-7 items-center justify-center text-primary hover:bg-surface-sunken" aria-label="افزایش تعداد">+</button>
                        </div>
                        <button type="button" onClick={() => cart.removeItem(item.id)} className="text-xs text-red-500 hover:underline">حذف</button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-border-default p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary-muted">جمع کل</span>
                <span className="text-lg font-bold text-primary">{formatPriceWithCurrency(cart.total)}</span>
              </div>
              <Link href="/checkout" onClick={close} className="mt-3 flex h-12 w-full items-center justify-center rounded-lg bg-accent text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover">ادامه به تسویه‌حساب</Link>
              <Link href="/cart" onClick={close} className="mt-2 block text-center text-xs text-primary-muted hover:underline">مشاهده سبد کامل</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}