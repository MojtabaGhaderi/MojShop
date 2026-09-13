
//(shop) orders/[id]/page.tsx
'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useOrder, useGuestOrder } from '@/hooks/use-orders';
import { useCreatePayment } from '@/hooks/use-payments';
import { formatPriceWithCurrency } from '@/lib/utils';
import type { OrderStatus } from '@/types';
import { api } from '@/lib/api';

const STATUS_LABEL: Record<OrderStatus, string> = {
    pending: 'در انتظار',
    paid: 'پرداخت‌شده',
    shipped: 'ارسال‌شده',
    delivered: 'تحویل‌شده',
    cancelled: 'لغو شده',
};

function formatDate(iso: string) {
    try {
        return new Intl.DateTimeFormat('fa-IR', {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(new Date(iso));
    } catch {
        return iso;
    }
}

function OrderDetailContent() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const orderId = Number(params.id);
    const guestEmail = searchParams.get('guest_email');

    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const authOrder = useOrder(
        !guestEmail && Number.isFinite(orderId) ? orderId : null
    );

    const guestOrder = useGuestOrder(
        guestEmail && Number.isFinite(orderId) ? orderId : null,
        guestEmail
    );

    const { data: order, isLoading, error } = guestEmail
        ? guestOrder
        : authOrder;

    const createPayment = useCreatePayment();
    const [paymentError, setPaymentError] = useState<string | null>(null);

    useEffect(() => {
        // A guest with a valid ?guest_email= link never needs to be logged in —
        // only redirect when there's no guest_email AND no session.
        if (guestEmail) return;

        if (!authLoading && !isAuthenticated) {
            router.replace('/login');
        }
    }, [authLoading, isAuthenticated, guestEmail, router]);

    async function handlePay() {
        if (!order) return;

        setPaymentError(null);

        try {
            const payment = await createPayment.mutateAsync(order.id);

            if (!isAuthenticated && guestEmail) {
                sessionStorage.setItem('guest_order_email', guestEmail);
            }

            window.location.href = payment.payment_url;
        } catch (err) {
            setPaymentError(
                err instanceof Error
                    ? err.message
                    : 'خطا در انتقال به درگاه پرداخت'
            );
        }
    }

    if ((!guestEmail && authLoading) || isLoading) {
        return (
            <div className="mx-auto max-w-2xl px-4 py-12">
                <div className="h-8 w-48 animate-pulse rounded bg-surface-elevated" />
                <div className="mt-6 h-64 animate-pulse rounded-xl bg-surface-elevated" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="mx-auto max-w-2xl px-4 py-16 text-center">
                <p className="text-primary-muted">سفارش یافت نشد.</p>

                {!guestEmail && (
                    <Link
                        href="/orders"
                        className="mt-4 inline-block text-accent hover:underline"
                    >
                        بازگشت به لیست سفارش‌ها
                    </Link>
                )}
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
            {!guestEmail && (
                <Link
                    href="/orders"
                    className="text-sm text-accent hover:underline"
                >
                    ← سفارش‌ها
                </Link>
            )}

            <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-primary">
                        سفارش #{order.id}
                    </h1>

                    <p className="mt-1 text-sm text-primary-muted">
                        {formatDate(order.created_at)}
                    </p>
                </div>

                <span className="rounded-full bg-accent/15 px-3 py-1 text-sm font-medium text-accent">
                    {STATUS_LABEL[order.status] ?? order.status}
                </span>
            </div>

            {order.invoice && (
                <p className="mt-2 text-xs text-primary-subtle">
                    فاکتور: {order.invoice.invoice_number}
                </p>
            )}
            {order.tracking_number && (
                <p className="mt-2 text-sm text-primary-muted">
                    کد رهگیری: <span className="font-medium text-primary">{order.tracking_number}</span>
                    {order.tracking_url && (
                        <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="ms-2 text-accent hover:underline">پیگیری مرسوله</a>
                    )}
                </p>
            )}

            {/* Items */}
            <section className="mt-6 rounded-xl border border-border-default bg-surface p-5">
                <h2 className="text-lg font-semibold text-primary">
                    اقلام
                </h2>

                <ul className="mt-3 divide-y divide-border-default">
                    {order.items.map((item) => (
                        <li
                            key={item.id}
                            className="flex gap-3 py-3"
                        >
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-surface-elevated">
                                {item.image_url ? (
                                    <Image
                                        src={item.image_url}
                                        alt={item.product_name}
                                        width={64}
                                        height={64}
                                        unoptimized
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-primary-subtle">
                                        —
                                    </div>
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <Link
                                    href={`/products/${item.product_slug}`}
                                    className="text-sm font-medium text-primary hover:text-accent"
                                >
                                    {item.product_name}
                                </Link>

                                {item.variant_name && (
                                    <p className="mt-0.5 text-xs text-primary-muted">
                                        نوع: {item.variant_name}
                                    </p>
                                )}

                                <p className="mt-0.5 text-xs text-primary-muted">
                                    {formatPriceWithCurrency(item.unit_price)} ×{' '}
                                    {item.quantity}
                                </p>
                            </div>

                            <span className="text-sm font-medium text-primary">
                                {formatPriceWithCurrency(
                                    item.unit_price * item.quantity
                                )}
                            </span>
                        </li>
                    ))}
                </ul>
            </section>

            {/* Address */}
            <section className="mt-4 rounded-xl border border-border-default bg-surface p-5">
                <h2 className="text-lg font-semibold text-primary">
                    آدرس تحویل
                </h2>

                <p className="mt-2 text-sm text-primary-muted">
                    {order.address.label && (
                        <span className="font-medium text-primary">
                            {order.address.label} —{' '}
                        </span>
                    )}

                    {order.address.line_1}

                    {order.address.line_2
                        ? `، ${order.address.line_2}`
                        : ''}

                    <br />

                    {order.address.city} — {order.address.postal_code} —{' '}
                    {order.address.country}
                </p>
            </section>

            {/* Totals */}
            <section className="mt-4 rounded-xl border border-border-default bg-surface-elevated p-5">
                <div className="flex justify-between text-sm text-primary-muted">
                    <span>جمع اقلام</span>
                    <span>
                        {formatPriceWithCurrency(order.subtotal)}
                    </span>
                </div>

                {order.discount_amount > 0 && (
                    <div className="mt-1 flex justify-between text-sm text-green-600">
                        <span>تخفیف</span>
                        <span>
                            −
                            {formatPriceWithCurrency(
                                order.discount_amount
                            )}
                        </span>
                    </div>
                )}

                <div className="mt-1 flex justify-between text-sm text-primary-muted">
                    <span>ارسال</span>
                    <span>
                        {formatPriceWithCurrency(order.shipping_cost)}
                    </span>
                </div>

                <div className="mt-1 flex justify-between text-sm text-primary-muted">
                    <span>مالیات</span>
                    <span>
                        {formatPriceWithCurrency(order.tax)}
                    </span>
                </div>

                <div className="mt-3 flex justify-between border-t border-border-default pt-3">
                    <span className="font-medium text-primary">
                        مبلغ کل
                    </span>

                    <span className="text-lg font-bold text-primary">
                        {formatPriceWithCurrency(order.total)}
                    </span>
                </div>
            </section>

            {/* Payment */}
            {order.status === 'pending' && (
                <section className="mt-4 rounded-xl border border-accent/30 bg-accent/5 p-5">
                    <h2 className="text-lg font-semibold text-primary">
                        پرداخت سفارش
                    </h2>

                    <p className="mt-2 text-sm text-primary-muted">
                        این سفارش برای شما رزرو شده است. برای تکمیل خرید،
                        پرداخت را انجام دهید.
                    </p>

                    {paymentError && (
                        <p className="mt-3 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-500">
                            {paymentError}
                        </p>
                    )}

                    <button
                        type="button"
                        onClick={handlePay}
                        disabled={createPayment.isPending}
                        className="mt-4 h-12 w-full rounded-lg bg-accent text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-50"
                    >
                        {createPayment.isPending
                            ? 'در حال انتقال به درگاه پرداخت...'
                            : 'پرداخت سفارش'}
                    </button>
                </section>
            )}
            {order.status === 'pending' && !guestEmail && (
                <button
                    type="button"
                    onClick={async () => {
                        if (!confirm('آیا از لغو این سفارش مطمئن هستید؟')) return;
                        try {
                            await api.post(`/orders/${order.id}/cancel`);
                            window.location.reload();
                        } catch {
                            alert('خطا در لغو سفارش');
                        }
                    }}
                    className="mt-3 w-full text-center text-sm text-red-500 hover:underline"
                >
                    لغو سفارش
                </button>
            )}
        </div>
    );
}

export default function OrderDetailPage() {
    return (
        <Suspense
            fallback={
                <div className="mx-auto max-w-2xl px-4 py-12">
                    <div className="h-8 w-48 animate-pulse rounded bg-surface-elevated" />
                    <div className="mt-6 h-64 animate-pulse rounded-xl bg-surface-elevated" />
                </div>
            }
        >
            <OrderDetailContent />
        </Suspense>
    );
}
