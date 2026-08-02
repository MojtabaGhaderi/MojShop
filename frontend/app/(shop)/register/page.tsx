'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

export default function RegisterPage() {
    const { register, registerError, isLoading } = useAuth();
    const [form, setForm] = useState({
        email: '',
        password: '',
        full_name: '',
        phone: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await register(form);
            window.location.href = '/';
        } catch {
            // Error handled by hook
        }
    };

    return (
        <div className="mx-auto max-w-md px-4 py-12">
            <h1 className="text-2xl font-bold text-primary">ثبت‌نام</h1>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                    <label className="block text-sm text-primary-subtle">نام کامل</label>
                    <input
                        type="text"
                        required
                        value={form.full_name}
                        onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                        className="mt-1 w-full rounded border border-border-default bg-surface px-3 py-2 text-primary"
                    />
                </div>
                <div>
                    <label className="block text-sm text-primary-subtle">ایمیل</label>
                    <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="mt-1 w-full rounded border border-border-default bg-surface px-3 py-2 text-primary"
                    />
                </div>
                <div>
                    <label className="block text-sm text-primary-subtle">شماره موبایل</label>
                    <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="mt-1 w-full rounded border border-border-default bg-surface px-3 py-2 text-primary"
                        placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    />
                </div>
                <div>
                    <label className="block text-sm text-primary-subtle">رمز عبور</label>
                    <input
                        type="password"
                        required
                        minLength={6}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="mt-1 w-full rounded border border-border-default bg-surface px-3 py-2 text-primary"
                    />
                </div>
                {registerError && (
                    <p className="text-sm text-red-500">
                        {registerError instanceof Error ? registerError.message : 'خطا در ثبت‌نام'}
                    </p>
                )}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded bg-accent py-2 font-medium text-white disabled:opacity-50"
                >
                    {isLoading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
                </button>
            </form>
            <p className="mt-4 text-center text-sm text-primary-subtle">
                قبلاً ثبت‌نام کردید؟{' '}
                <Link href="/login" className="text-accent hover:underline">
                    ورود
                </Link>
            </p>
        </div>
    );
}