'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useVerifyPayment } from '@/hooks/use-payments';

type ViewState = 'verifying' | 'success' | 'failed' | 'cancelled';

function CallbackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const verifyPayment = useVerifyPayment();
    const [state, setState] = useState<ViewState>('verifying');
    const [message, setMessage] = useState<string | null>(null);
    const ran = useRef(false);

    const orderId = searchParams.get('order_id');
    const authority = searchParams.get('Authority');
    const status = searchParams.get('Status');
    const guestEmail = searchParams.get('guest_email');


    useEffect(() => {
        if (ran.current) return; // guards against double-verify on a re-render
        ran.current = true;

        if (!orderId || !authority) {
            setState('failed');
            setMessage('اطلاعات پرداخت ناقص است.');
            return;
        }
        if (status !== 'OK') {
            setState('cancelled'); // user backed out at the gateway — never call verify for this
            return;
        }

        verifyPayment.mutate(
            { orderId: Number(orderId), authority },
            {
                onSuccess: (data) => {
                    if (data.status === 'success') {
                        setState('success');
                        const target = guestEmail
                            ? `/orders/${orderId}?guest_email=${encodeURIComponent(guestEmail)}`
                            : `/orders/${orderId}`;
                        setTimeout(() => router.push(target), 1500);
                    } else {
                        setState('failed');
                        setMessage(data.message ?? null);
                    }
                },
                onError: () => setState('failed'),
            }
        );
    }, [orderId, authority, status, router, verifyPayment]);

    return (
        <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
            {state === 'verifying' && (
                <>
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent" />
                    <p className="mt-4 text-primary-muted">در حال بررسی پرداخت...</p>
                </>
            )}
            {state === 'success' && (
                <>
                    <h1 className="text-xl font-bold text-primary">پرداخت با موفقیت انجام شد</h1>
                    <p className="mt-2 text-sm text-primary-muted">در حال انتقال به صفحه سفارش...</p>
                </>
            )}
            {state === 'cancelled' && (
                <>
                    <h1 className="text-xl font-bold text-primary">پرداخت لغو شد</h1>
                    <p className="mt-2 text-sm text-primary-muted">می‌توانید دوباره تلاش کنید.</p>
                    {orderId && <Link href={`/orders/${orderId}`} className="mt-4 text-accent hover:underline">مشاهده سفارش</Link>}
                </>
            )}
            {state === 'failed' && (
                <>
                    <h1 className="text-xl font-bold text-primary">پرداخت ناموفق بود</h1>
                    {message && <p className="mt-2 text-sm text-red-500">{message}</p>}
                    {orderId && <Link href={`/orders/${orderId}`} className="mt-4 text-accent hover:underline">مشاهده سفارش</Link>}
                </>
            )}
        </div>
    );
}

export default function CallbackPage() {
    return (
        <Suspense fallback={<div className="mx-auto max-w-md px-4 py-20 text-center text-primary-muted">در حال بارگذاری...</div>}>
            <CallbackContent />
        </Suspense>
    );
}