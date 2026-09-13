'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useResetPassword } from '@/hooks/use-password-reset';

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const resetPassword = useResetPassword();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        if (!token) { setError('لینک نامعتبر است'); return; }
        if (password !== confirmPassword) { setError('رمزهای عبور یکسان نیستند'); return; }
        try {
            const result = await resetPassword.mutateAsync({ token, new_password: password });
            setSuccess(result.message);
            setTimeout(() => router.push('/login'), 2000);
        } catch {
            setError('لینک نامعتبر یا منقضی شده است');
        }
    }

    if (!token) {
        return (
            <div className="mx-auto max-w-md px-4 py-12 text-center">
                <p className="text-red-500">لینک بازیابی نامعتبر است.</p>
                <Link href="/forgot-password" className="mt-4 inline-block text-accent hover:underline">درخواست لینک جدید</Link>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-md px-4 py-12">
            <h1 className="text-2xl font-bold text-primary">تعیین رمز عبور جدید</h1>
            {success ? (
                <p className="mt-6 rounded-lg bg-green-500/10 px-4 py-3 text-sm text-green-600">{success}</p>
            ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                        <label className="block text-sm text-primary-subtle">رمز عبور جدید</label>
                        <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded border border-border-default bg-surface px-3 py-2 text-primary" />
                    </div>
                    <div>
                        <label className="block text-sm text-primary-subtle">تکرار رمز عبور</label>
                        <input type="password" required minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 w-full rounded border border-border-default bg-surface px-3 py-2 text-primary" />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <button type="submit" disabled={resetPassword.isPending} className="w-full rounded bg-accent py-2 font-medium text-white disabled:opacity-50">
                        {resetPassword.isPending ? 'در حال ذخیره...' : 'تغییر رمز عبور'}
                    </button>
                </form>
            )}
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="mx-auto max-w-md px-4 py-12 text-center text-primary-muted">در حال بارگذاری...</div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}