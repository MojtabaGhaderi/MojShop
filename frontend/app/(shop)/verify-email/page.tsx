'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');

    useEffect(() => {
        if (!token) { setStatus('failed'); return; }
        api.post('/auth/verify-email', { token })
            .then(() => setStatus('success'))
            .catch(() => setStatus('failed'));
    }, [token]);

    return (
        <div className="mx-auto max-w-md px-4 py-16 text-center">
            {status === 'verifying' && <p className="text-primary-muted">در حال بررسی...</p>}
            {status === 'success' && <p className="text-green-600">ایمیل شما با موفقیت تایید شد.</p>}
            {status === 'failed' && <p className="text-red-500">لینک تایید نامعتبر یا منقضی شده است.</p>}
            <Link href="/" className="mt-4 inline-block text-accent hover:underline">بازگشت به صفحه اصلی</Link>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="mx-auto max-w-md px-4 py-16 text-center text-primary-muted">در حال بارگذاری...</div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}