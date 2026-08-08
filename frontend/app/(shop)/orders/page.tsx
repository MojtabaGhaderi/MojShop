'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useOrders } from '@/hooks/use-orders';
import { formatPriceWithCurrency } from '@/lib/utils';
import type { OrderStatus } from '@/types';

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

export default function OrdersPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { data: orders = [], isLoading } = useOrders();

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.replace('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    if (authLoading || isLoading) {
        return (
            <div className="mx-auto max-w-2xl px-4 py-12">
                <div className="h-8 w-40 animate-pulse rounded bg-surface-elevated" />
                <div className="mt-6 space-y-3">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-24 animate-pulse rounded-xl bg-surface-elevated" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
            <h1 className="text-2xl font-bold text-primary">سفارش‌های من</h1>

            {orders.length === 0 ? (
                <div className="mt-10 text-center">
                    <p className="text-primary-muted">هنوز سفارشی ثبت نکرده‌اید.</p>
                    <Link
                        href="/products"
                        className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
                    >
                        مشاهده محصولات
                    </Link>
                </div>
            ) : (
                <ul className="mt-6 space-y-3">
                    {orders.map((order) => (
                        <li key={order.id}>
                            <Link
                                href={`/orders/${order.id}`}
                                className="block rounded-xl border border-border-default bg-surface p-4 transition-colors hover:border-accent/40"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-medium text-primary">سفارش #{order.id}</p>
                                        <p className="mt-1 text-xs text-primary-muted">
                                            {formatDate(order.created_at)}
                                        </p>
                                        <p className="mt-1 text-xs text-primary-subtle">
                                            {order.items.length} قلم —{' '}
                                            {STATUS_LABEL[order.status] ?? order.status}
                                        </p>
                                    </div>
                                    <span className="text-sm font-bold text-primary">
                                        {formatPriceWithCurrency(order.total)}
                                    </span>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}