'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import { useAddresses } from '@/hooks/use-profile';
import { useCreateOrder } from '@/hooks/use-orders';
import { formatPriceWithCurrency } from '@/lib/utils';

function errorDetail(err: unknown): string {
  if (err instanceof AxiosError) {
    const d = err.response?.data?.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d)) return d.map((x) => x.msg ?? JSON.stringify(x)).join(', ');
  }
  if (err instanceof Error) return err.message;
  return 'خطا در ثبت سفارش';
}

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { items, total, isLoading: cartLoading } = useCart();
  const { addresses, isLoading: addrLoading } = useAddresses();
  const createOrder = useCreateOrder();

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (addresses.length === 0) return;
    const def = addresses.find((a) => a.is_default) ?? addresses[0];
    setSelectedAddressId((prev) => prev ?? def.id);
  }, [addresses]);

  if (authLoading || cartLoading || addrLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="h-8 w-40 animate-pulse rounded bg-surface-elevated" />
        <div className="mt-6 h-40 animate-pulse rounded-xl bg-surface-elevated" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-primary">سبد خرید خالی است</h1>
        <Link href="/products" className="mt-4 inline-block text-accent hover:underline">
          بازگشت به محصولات
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!selectedAddressId) {
      setError('لطفاً یک آدرس انتخاب کنید');
      return;
    }
    try {
      const order = await createOrder.mutateAsync({ address_id: selectedAddressId });
      router.push(`/orders/${order.id}`);
    } catch (err) {
      setError(errorDetail(err));
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <h1 className="text-2xl font-bold text-primary">تکمیل سفارش</h1>

      {/* Cart summary */}
      <section className="mt-6 rounded-xl border border-border-default bg-surface p-5">
        <h2 className="text-lg font-semibold text-primary">خلاصه سبد</h2>
        <ul className="mt-3 divide-y divide-border-default">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3 py-3 text-sm">
              <span className="text-primary">
                {item.product.name}{' '}
                <span className="text-primary-muted">× {item.quantity}</span>
              </span>
              <span className="shrink-0 font-medium text-primary">
                {formatPriceWithCurrency(item.product.current_price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-border-default pt-3">
          <span className="text-primary-muted">جمع کل</span>
          <span className="text-lg font-bold text-primary">
            {formatPriceWithCurrency(total)}
          </span>
        </div>
      </section>

      {/* Address */}
      <section className="mt-6 rounded-xl border border-border-default bg-surface p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">آدرس تحویل</h2>
          <Link href="/profile" className="text-sm text-accent hover:underline">
            مدیریت آدرس‌ها
          </Link>
        </div>

        {addresses.length === 0 ? (
          <p className="mt-4 text-sm text-primary-muted">
            آدرسی ثبت نشده.{' '}
            <Link href="/profile" className="text-accent hover:underline">
              افزودن آدرس در پروفایل
            </Link>
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {addresses.map((addr) => (
              <li key={addr.id}>
                <label
                  className={`flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors ${selectedAddressId === addr.id
                      ? 'border-accent bg-accent/5'
                      : 'border-border-default hover:bg-surface-sunken'
                    }`}
                >
                  <input
                    type="radio"
                    name="address"
                    className="mt-1"
                    checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)}
                  />
                  <div className="min-w-0 text-sm">
                    <p className="font-medium text-primary">
                      {addr.label || 'آدرس'}
                      {addr.is_default && (
                        <span className="ms-2 text-xs text-accent">پیش‌فرض</span>
                      )}
                    </p>
                    <p className="mt-0.5 text-primary-muted">
                      {addr.line_1}
                      {addr.line_2 ? `، ${addr.line_2}` : ''} — {addr.city} —{' '}
                      {addr.postal_code}
                    </p>
                  </div>
                </label>
              </li>
            ))}
          </ul>
        )}
      </section>

      {error && (
        <p className="mt-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-500">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6">
        <button
          type="submit"
          disabled={
            createOrder.isPending || addresses.length === 0 || !selectedAddressId
          }
          className="h-12 w-full rounded-lg bg-accent text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {createOrder.isPending ? 'در حال ثبت سفارش...' : 'ثبت سفارش'}
        </button>
        <p className="mt-2 text-center text-xs text-primary-subtle">
          پرداخت واقعی فعلاً فعال نیست — سفارش با وضعیت «در انتظار» ثبت می‌شود.
        </p>
      </form>
    </div>
  );
}