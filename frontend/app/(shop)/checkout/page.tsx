'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { useAuth } from '@/hooks/use-auth';
import { useShopCart } from '@/hooks/use-shop-cart';
import { useAddresses } from '@/hooks/use-profile';
import { useCreateOrder, useCreateGuestOrder } from '@/hooks/use-orders';
import { useValidatePromo } from '@/hooks/use-promos';
import { useCreatePayment } from '@/hooks/use-payments';
import { formatPriceWithCurrency } from '@/lib/utils';
import type { Order } from '@/types';

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
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const cart = useShopCart();
  const { addresses, isLoading: addrLoading } = useAddresses();
  const createOrder = useCreateOrder();
  const createGuestOrder = useCreateGuestOrder();
  const createPayment = useCreatePayment();
  const validatePromo = useValidatePromo();

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestAddress, setGuestAddress] = useState({ label: '', line_1: '', line_2: '', city: '', postal_code: '', country: 'Iran' });

  const [promoCode, setPromoCode] = useState('');
  const [promoResult, setPromoResult] = useState<{ valid: boolean; discount_amount: number; message?: string } | null>(null);

  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (addresses.length === 0) return;
    const def = addresses.find((a) => a.is_default) ?? addresses[0];
    setSelectedAddressId((prev) => prev ?? def.id);
  }, [addresses]);

  if (authLoading || cart.isLoading || (isAuthenticated && addrLoading)) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="h-8 w-40 animate-pulse rounded bg-surface-elevated" />
        <div className="mt-6 h-40 animate-pulse rounded-xl bg-surface-elevated" />
      </div>
    );
  }

  if (cart.items.length === 0 && !pendingOrder) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-primary">سبد خرید خالی است</h1>
        <Link href="/products" className="mt-4 inline-block text-accent hover:underline">بازگشت به محصولات</Link>
      </div>
    );
  }

  async function handleApplyPromo() {
    if (!promoCode.trim()) return;
    try {
      setPromoResult(await validatePromo.mutateAsync({ code: promoCode.trim(), subtotal: cart.total }));
    } catch {
      setPromoResult({ valid: false, discount_amount: 0, message: 'خطا در بررسی کد تخفیف' });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      let order: Order;
      if (isAuthenticated) {
        if (!selectedAddressId) { setError('لطفاً یک آدرس انتخاب کنید'); return; }
        order = await createOrder.mutateAsync({
          address_id: selectedAddressId,
          promo_code: promoResult?.valid ? promoCode.trim() : undefined,
        });
      } else {
        if (!guestName || !guestEmail || !guestAddress.line_1 || !guestAddress.city || !guestAddress.postal_code) {
          setError('لطفاً همه فیلدهای ضروری را پر کنید');
          return;
        }
        order = await createGuestOrder.mutateAsync({
          guest_name: guestName,
          guest_email: guestEmail,
          address: guestAddress,
          items: cart.items.map((i) => ({ product_id: i.product_id, variant_id: i.variant_id ?? undefined, quantity: i.quantity })),
          promo_code: promoResult?.valid ? promoCode.trim() : undefined,
        });
      }
      setPendingOrder(order);
    } catch (err) {
      setError(errorDetail(err));
    }
  }

  async function handlePay() {
    if (!pendingOrder) return;
    setError(null);
    try {
      const payment = await createPayment.mutateAsync(pendingOrder.id);
      if (!isAuthenticated) {
        // Day 6's known gap: guest order lookup needs the email again — carry it forward
        // for the callback/order-detail page until that's addressed.
        sessionStorage.setItem('guest_order_email', guestEmail);
      }
      window.location.href = payment.payment_url;
    } catch (err) {
      setError(errorDetail(err));
    }
  }

  if (pendingOrder) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <h1 className="text-2xl font-bold text-primary">بررسی نهایی</h1>
        <section className="mt-6 rounded-xl border border-border-default bg-surface p-5">
          <h2 className="text-lg font-semibold text-primary">سفارش #{pendingOrder.id}</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-primary-muted">جمع جزء</span><span className="text-primary">{formatPriceWithCurrency(pendingOrder.subtotal)}</span></div>
            {pendingOrder.discount_amount > 0 && (
              <div className="flex justify-between text-green-600"><span>تخفیف</span><span>−{formatPriceWithCurrency(pendingOrder.discount_amount)}</span></div>
            )}
            <div className="flex justify-between"><span className="text-primary-muted">هزینه ارسال</span><span className="text-primary">{formatPriceWithCurrency(pendingOrder.shipping_cost)}</span></div>
            <div className="flex justify-between border-t border-border-default pt-2 text-base font-bold"><span className="text-primary">مبلغ قابل پرداخت</span><span className="text-primary">{formatPriceWithCurrency(pendingOrder.total)}</span></div>
          </div>
        </section>

        {error && <p className="mt-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-500">{error}</p>}

        <button type="button" onClick={handlePay} disabled={createPayment.isPending}
          className="mt-6 h-12 w-full rounded-lg bg-accent text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-50">
          {createPayment.isPending ? 'در حال انتقال به درگاه پرداخت...' : 'پرداخت'}
        </button>
        <button type="button" onClick={() => setPendingOrder(null)} className="mt-2 w-full text-center text-sm text-primary-muted hover:underline">
          ویرایش سفارش
        </button>
        <p className="mt-2 text-center text-xs text-primary-subtle">این سفارش تا ۱۵ دقیقه برای شما رزرو می‌شود.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <h1 className="text-2xl font-bold text-primary">تکمیل سفارش</h1>

      <section className="mt-6 rounded-xl border border-border-default bg-surface p-5">
        <h2 className="text-lg font-semibold text-primary">خلاصه سبد</h2>
        <ul className="mt-3 divide-y divide-border-default">
          {cart.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3 py-3 text-sm">
              <span className="text-primary">{item.product.name} <span className="text-primary-muted">× {item.quantity}</span></span>
              {/* was: item.product.current_price * item.quantity — didn't reflect variant price adjustment */}
              <span className="shrink-0 font-medium text-primary">{formatPriceWithCurrency(item.unitPrice * item.quantity)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex gap-2">
          <input type="text" value={promoCode} onChange={(e) => { setPromoCode(e.target.value); setPromoResult(null); }}
            placeholder="کد تخفیف" className="flex-1 rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-primary" />
          <button type="button" onClick={handleApplyPromo} disabled={validatePromo.isPending || !promoCode.trim()}
            className="rounded-lg border border-border-default px-4 py-2 text-sm font-medium text-primary hover:bg-surface-sunken disabled:opacity-50">
            {validatePromo.isPending ? '...' : 'اعمال'}
          </button>
        </div>
        {promoResult && (
          <p className={`mt-2 text-xs ${promoResult.valid ? 'text-green-600' : 'text-red-500'}`}>
            {promoResult.valid ? `کد تخفیف اعمال شد (−${formatPriceWithCurrency(promoResult.discount_amount)})` : promoResult.message}
          </p>
        )}

        <div className="mt-3 flex justify-between border-t border-border-default pt-3">
          <span className="text-primary-muted">جمع کل</span>
          <span className="text-lg font-bold text-primary">{formatPriceWithCurrency(cart.total)}</span>
        </div>
        <p className="mt-1 text-xs text-primary-subtle">هزینه ارسال و تخفیف نهایی پس از ثبت سفارش محاسبه و نمایش داده می‌شود.</p>
      </section>

      {isAuthenticated ? (
        <section className="mt-6 rounded-xl border border-border-default bg-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary">آدرس تحویل</h2>
            <Link href="/profile" className="text-sm text-accent hover:underline">مدیریت آدرس‌ها</Link>
          </div>
          {addresses.length === 0 ? (
            <p className="mt-4 text-sm text-primary-muted">آدرسی ثبت نشده. <Link href="/profile" className="text-accent hover:underline">افزودن آدرس در پروفایل</Link></p>
          ) : (
            <ul className="mt-4 space-y-2">
              {addresses.map((addr) => (
                <li key={addr.id}>
                  <label className={`flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors ${selectedAddressId === addr.id ? 'border-accent bg-accent/5' : 'border-border-default hover:bg-surface-sunken'}`}>
                    <input type="radio" name="address" className="mt-1" checked={selectedAddressId === addr.id} onChange={() => setSelectedAddressId(addr.id)} />
                    <div className="min-w-0 text-sm">
                      <p className="font-medium text-primary">{addr.label || 'آدرس'}{addr.is_default && <span className="ms-2 text-xs text-accent">پیش‌فرض</span>}</p>
                      <p className="mt-0.5 text-primary-muted">{addr.line_1}{addr.line_2 ? `، ${addr.line_2}` : ''} — {addr.city} — {addr.postal_code}</p>
                    </div>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <section className="mt-6 rounded-xl border border-border-default bg-surface p-5">
          <h2 className="text-lg font-semibold text-primary">اطلاعات مشتری</h2>
          <p className="mt-1 text-xs text-primary-muted">حساب کاربری دارید؟ <Link href="/login" className="text-accent hover:underline">وارد شوید</Link></p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="نام کامل" required className="rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-primary" />
            <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="ایمیل" required className="rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-primary" />
          </div>
          <h3 className="mt-4 text-sm font-medium text-primary">آدرس تحویل</h3>
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input value={guestAddress.line_1} onChange={(e) => setGuestAddress({ ...guestAddress, line_1: e.target.value })} placeholder="آدرس (خط اول)" required className="rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-primary sm:col-span-2" />
            <input value={guestAddress.line_2} onChange={(e) => setGuestAddress({ ...guestAddress, line_2: e.target.value })} placeholder="آدرس (خط دوم — اختیاری)" className="rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-primary sm:col-span-2" />
            <input value={guestAddress.city} onChange={(e) => setGuestAddress({ ...guestAddress, city: e.target.value })} placeholder="شهر" required className="rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-primary" />
            <input value={guestAddress.postal_code} onChange={(e) => setGuestAddress({ ...guestAddress, postal_code: e.target.value })} placeholder="کد پستی" required className="rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-primary" />
          </div>
        </section>
      )}

      {error && <p className="mt-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="mt-6">
        <button type="submit"
          disabled={createOrder.isPending || createGuestOrder.isPending || (isAuthenticated && (addresses.length === 0 || !selectedAddressId))}
          className="h-12 w-full rounded-lg bg-accent text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-50">
          {createOrder.isPending || createGuestOrder.isPending ? 'در حال ثبت سفارش...' : 'ادامه به بررسی نهایی'}
        </button>
      </form>
    </div>
  );
}