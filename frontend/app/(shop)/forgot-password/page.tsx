'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForgotPassword } from '@/hooks/use-password-reset';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const forgotPassword = useForgotPassword();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const result = await forgotPassword.mutateAsync(email);
        setMessage(result.message);
    }

    return (
        <div className="mx-auto max-w-md px-4 py-12">
            <h1 className="text-2xl font-bold text-primary">بازیابی رمز عبور</h1>
            {message ? (
                <p className="mt-6 rounded-lg bg-green-500/10 px-4 py-3 text-sm text-green-600">{message}</p>
            ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                        <label className="block text-sm text-primary-subtle">ایمیل</label>
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded border border-border-default bg-surface px-3 py-2 text-primary" />
                    </div>
                    <button type="submit" disabled={forgotPassword.isPending} className="w-full rounded bg-accent py-2 font-medium text-white disabled:opacity-50">
                        {forgotPassword.isPending ? 'در حال ارسال...' : 'ارسال لینک بازیابی'}
                    </button>
                </form>
            )}
            <p className="mt-4 text-center text-sm text-primary-subtle">
                <Link href="/login" className="text-accent hover:underline">بازگشت به ورود</Link>
            </p>
        </div>
    );
}