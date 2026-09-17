'use client';

import * as React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

export default function LoginPage() {
    const { login, loginError, isLoginPending } = useAuth();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);

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
        <div className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-16 select-none" dir="rtl">
            {/* ── Soft Ambient Glows ── */}
            <div className="pointer-events-none absolute -top-16 end-1/4 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 start-1/4 h-72 w-72 rounded-full bg-[#E8DCBE]/25 blur-3xl" />

            {/* ── Luxury Alabaster Card ── */}
            <div className="relative w-full max-w-[440px] overflow-hidden rounded-3xl border border-[#E8E2D1] bg-gradient-to-b from-[#FDFCFA]/95 via-[#FAF7F0]/90 to-[#F5EFE1]/80 p-8 sm:p-10 shadow-[0_20px_60px_rgba(23,59,87,0.06)] backdrop-blur-2xl transition-all duration-300">

                {/* Fine Alabaster Film-Grain Noise */}
                <svg
                    className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.028] mix-blend-overlay"
                    aria-hidden="true"
                >
                    <filter id="login-grain">
                        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
                        <feColorMatrix type="saturate" values="0" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#login-grain)" />
                </svg>

                {/* Inner Bevel Light */}
                <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/90" />

                <div className="relative z-10">
                    {/* Header */}
                    <div className="text-center">
                        <span className="text-[11px] font-medium tracking-widest text-accent uppercase">
                            گالری موج
                        </span>
                        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            ورود به حساب کاربری
                        </h1>
                        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                            برای دسترسی به سفارش‌ها و خدمات اختصاصی وارد شوید
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                        {/* Email Field */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-foreground tracking-wide">
                                نشانی ایمیل
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    dir="ltr"
                                    className="h-12 w-full rounded-xl border border-[#E0D8C3] bg-white/80 px-4 text-xs font-medium text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 focus:border-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="block text-xs font-semibold text-foreground tracking-wide">
                                    رمز عبور
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-[11px] font-medium text-accent transition-colors hover:text-accent-hover hover:underline"
                                >
                                    فراموشی رمز عبور؟
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    dir="ltr"
                                    className="h-12 w-full rounded-xl border border-[#E0D8C3] bg-white/80 pr-11 pl-4 text-xs font-medium text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 focus:border-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 text-left"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                                    aria-label={showPassword ? 'مخفی کردن رمز' : 'نمایش رمز'}
                                >
                                    {showPassword ? (
                                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {loginError && (
                            <div className="flex items-center gap-2 rounded-xl border border-rose-300/50 bg-rose-50/70 p-3 text-xs text-rose-800 backdrop-blur-md animate-in fade-in duration-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                                <span>{loginError instanceof Error ? loginError.message : 'اطلاعات ورود نادرست است'}</span>
                            </div>
                        )}

                        {/* Submit CTA */}
                        <button
                            type="submit"
                            disabled={isLoginPending}
                            className="mt-2 flex h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-[0_4px_16px_rgba(23,59,87,0.18)] transition-all hover:bg-primary/95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isLoginPending ? (
                                <div className="flex items-center gap-2">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                                    <span>در حال بررسی...</span>
                                </div>
                            ) : (
                                <span>ورود به حساب کاربری</span>
                            )}
                        </button>
                    </form>

                    {/* Footer Link */}
                    <div className="mt-8 border-t border-[#E8E2D1]/70 pt-6 text-center">
                        <p className="text-xs text-muted-foreground">
                            هنوز عضو گالری نشده‌اید؟{' '}
                            <Link
                                href="/register"
                                className="font-semibold text-accent transition-colors hover:text-accent-hover hover:underline"
                            >
                                ایجاد حساب کاربری
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}