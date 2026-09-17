// frontend/components/review-section.tsx
'use client';

import * as React from 'react';
import { useReviews } from '@/hooks/use-reviews';
import { cn } from '@/lib/utils';

export default function ReviewSection({ slug }: { slug: string }) {
    const {
        reviews = [],
        isLoading = false,
        averageRating = 0,
        totalCount = 0
    } = useReviews(slug) || {};

    const safeReviews = Array.isArray(reviews) ? reviews : [];
    const count = totalCount ?? safeReviews.length;

    return (
        <section className="mt-16 border-t border-border/60 pt-12 select-none" dir="rtl">
            {/* ── 1. Reviews Header & Average Score ── */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
                <div>
                    <span className="text-[11px] font-medium tracking-widest text-accent uppercase">
                        تجربه خریداران
                    </span>
                    <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                        دیدگاه‌ها و نظرات
                    </h2>
                </div>

                {count > 0 && (
                    <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/60 px-4 py-2.5 backdrop-blur-md shadow-2xs">
                        <div className="flex items-center gap-1.5 text-amber-500">
                            <span className="text-base font-bold font-mono">★</span>
                            <span className="text-sm font-bold font-mono text-foreground">
                                {Number(averageRating || 0).toFixed(1)}
                            </span>
                            <span className="text-[11px] text-muted-foreground font-mono">/ ۵</span>
                        </div>
                        <span className="h-3.5 w-px bg-border/80" />
                        <span className="text-xs text-muted-foreground">
                            {count.toLocaleString('fa-IR')} دیدگاه ثبت‌شده
                        </span>
                    </div>
                )}
            </div>

            {/* ── 2. Loading State ── */}
            {isLoading && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-32 rounded-2xl border border-border/50 bg-muted/20 animate-pulse" />
                    ))}
                </div>
            )}

            {/* ── 3. Empty State ── */}
            {!isLoading && safeReviews.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 py-12 text-center">
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-accent">
                        ★
                    </div>
                    <p className="text-xs font-medium text-foreground">هنوز دیدگاهی برای این اثر ثبت نشده است</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                        اولین نفری باشید که تجربه خود را از این دست‌ساز به اشتراک می‌گذارد.
                    </p>
                </div>
            )}

            {/* ── 4. Reviews Grid ── */}
            {!isLoading && safeReviews.length > 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {safeReviews.map((rev) => (
                        <div
                            key={rev.id}
                            className="group relative overflow-hidden rounded-2xl border border-[#E8E2D1] bg-card/70 p-5 shadow-2xs backdrop-blur-md transition-all duration-300 hover:border-accent/50"
                        >
                            <div className="flex items-start justify-between gap-2 border-b border-border/40 pb-3">
                                <div>
                                    <span className="text-xs font-semibold text-foreground">
                                        {rev.author_name || 'خریدار گالری'}
                                    </span>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        {Array.from({ length: 5 }).map((_, idx) => (
                                            <span
                                                key={idx}
                                                className={cn(
                                                    'text-[10px]',
                                                    idx < rev.rating ? 'text-amber-500' : 'text-border'
                                                )}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <span className="rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[9px] font-mono text-muted-foreground">
                                    خریدار تایید شده
                                </span>
                            </div>

                            <p className="mt-3 text-xs leading-relaxed text-foreground/80 font-sans">
                                {rev.comment}
                            </p>

                            {rev.created_at && (
                                <div className="mt-4 flex justify-end">
                                    <span className="text-[10px] font-mono text-muted-foreground">
                                        {new Date(rev.created_at).toLocaleDateString('fa-IR')}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}