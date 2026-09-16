'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { PromoCode } from '@/types';

interface EditorialPromoProps {
    promos: PromoCode[];
}

export default function EditorialPromo({ promos }: EditorialPromoProps) {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    if (!promos || promos.length === 0) return null;

    // Showcase the primary active promo
    const featuredPromo = promos[0];

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2500);
    };

    return (
        <section className="relative border-y border-border/40 bg-background py-16 sm:py-20">
            <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
                <div className="flex flex-col items-center justify-between gap-8 text-center md:flex-row md:text-right">

                    {/* Editorial Headline & Narrative */}
                    <div className="max-w-xl">
                        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                            پیشنهاد اختصاصی
                        </span>
                        <h2 className="mt-2 text-2xl font-light tracking-tight text-foreground sm:text-3xl">
                            تجر‌به‌ای متفاوت از همراهی با موج
                        </h2>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                            {featuredPromo.type === 'percent'
                                ? `با اعمال این کد در مرحله پرداخت، از ${featuredPromo.amount}٪ امتیاز خرید برای تمامی دست‌سازه‌های نقره بهره‌مند شوید.`
                                : `با اعمال این کد، ${featuredPromo.amount.toLocaleString('fa-IR')} تومان امتیاز هدیه بر روی سبد خرید شما لحاظ خواهد شد.`}
                        </p>
                    </div>

                    {/* Interactive Code Voucher & Action */}
                    <div className="flex flex-col items-center gap-4 sm:flex-row md:items-end">

                        {/* Click-to-Copy Pill */}
                        <button
                            type="button"
                            onClick={() => handleCopy(featuredPromo.code)}
                            className="group relative flex h-12 items-center gap-4 rounded-none border border-foreground/20 bg-secondary/30 px-5 transition-all hover:border-foreground hover:bg-secondary/60"
                            title="برای کپی کد کلیک کنید"
                        >
                            <div className="text-right">
                                <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
                                    کد تخفیف
                                </span>
                                <span className="font-mono text-sm font-semibold tracking-wider text-foreground">
                                    {featuredPromo.code}
                                </span>
                            </div>

                            <div className="h-4 w-px bg-border" />

                            <span className="text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                                {copiedCode === featuredPromo.code ? 'کپی شد ✓' : 'کپی'}
                            </span>
                        </button>

                        {/* Direct Shop Action */}
                        <Link
                            href="/products"
                            className="inline-flex h-12 items-center justify-center rounded-none bg-foreground px-7 text-xs font-medium uppercase tracking-widest text-background transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                            مشاهده مجموعه
                        </Link>
                    </div>

                </div>
            </div>
        </section>
    );
}