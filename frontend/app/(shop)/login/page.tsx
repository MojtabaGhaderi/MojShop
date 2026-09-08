'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

export default function LoginPage() {
    const { login, loginError, isLoginPending } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login({ email, password });
            window.location.href = '/';
        } catch {
            // Error handled by hook
        }
    };

    return (
        <div className="mx-auto max-w-md px-4 py-12">
            <h1 className="text-2xl font-bold text-primary">ورود</h1>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                    <label className="block text-sm text-primary-subtle">ایمیل</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 w-full rounded border border-border-default bg-surface px-3 py-2 text-primary"
                    />
                </div>
                <div>
                    <label className="block text-sm text-primary-subtle">رمز عبور</label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 w-full rounded border border-border-default bg-surface px-3 py-2 text-primary"
                    />
                </div>
                {loginError && (
                    <p className="text-sm text-red-500">
                        {loginError instanceof Error ? loginError.message : 'خطا در ورود'}
                    </p>
                )}
                <button
                    type="submit"
                    disabled={isLoginPending}
                    className="w-full rounded bg-accent py-2 font-medium text-white disabled:opacity-50"
                >
                    {isLoginPending ? 'در حال ورود...' : 'ورود'}
                </button>
            </form>
            <p className="mt-4 text-center text-sm text-primary-subtle">
                حساب کاربری ندارید؟{' '}
                <Link href="/register" className="text-accent hover:underline">
                    ثبت‌نام
                </Link>
            </p>
        </div>
    );
}