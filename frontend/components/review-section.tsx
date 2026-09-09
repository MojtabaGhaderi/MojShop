'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useReviews, useCreateReview, useDeleteReview } from '@/hooks/use-reviews';

function Stars({ rating, onRate }: { rating: number; onRate?: (r: number) => void }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
                <button
                    key={n}
                    type="button"
                    disabled={!onRate}
                    onClick={() => onRate?.(n)}
                    className={onRate ? 'cursor-pointer' : 'cursor-default'}
                    aria-label={`${n} ستاره`}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={n <= rating ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" className={n <= rating ? 'text-yellow-500' : 'text-border-default'}>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" />
                    </svg>
                </button>
            ))}
        </div>
    );
}

export default function ReviewSection({ slug }: { slug: string }) {
    const { user, isAuthenticated } = useAuth();
    const { data: reviews, isLoading } = useReviews(slug);
    const createReview = useCreateReview(slug);
    const deleteReview = useDeleteReview(slug);

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [error, setError] = useState<string | null>(null);

    const myReview = reviews?.find((r) => r.user.id === user?.id);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        if (rating === 0) { setError('لطفاً امتیاز را انتخاب کنید'); return; }
        try {
            await createReview.mutateAsync({ rating, comment: comment.trim() || undefined });
            setRating(0);
            setComment('');
        } catch {
            setError('خطا در ثبت نظر');
        }
    }

    function formatDate(iso: string) {
        try {
            return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' }).format(new Date(iso));
        } catch {
            return iso;
        }
    }

    return (
        <div className="space-y-6 border-t border-border-default pt-6">
            <h2 className="text-lg font-semibold text-primary">نظرات کاربران</h2>

            {isAuthenticated && !myReview && (
                <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-border-default p-4">
                    <Stars rating={rating} onRate={setRating} />
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="نظر شما (اختیاری)"
                        rows={3}
                        className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-primary"
                    />
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <button type="submit" disabled={createReview.isPending} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
                        {createReview.isPending ? 'در حال ثبت...' : 'ثبت نظر'}
                    </button>
                </form>
            )}

            {isLoading && <p className="text-sm text-primary-muted">در حال بارگذاری...</p>}
            {!isLoading && reviews?.length === 0 && <p className="text-sm text-primary-muted">هنوز نظری ثبت نشده است.</p>}

            <ul className="space-y-4">
                {reviews?.map((r) => (
                    <li key={r.id} className="border-b border-border-default pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-primary">{r.user.full_name ?? 'کاربر'}</p>
                                <div className="mt-1 flex items-center gap-2">
                                    <Stars rating={r.rating} />
                                    <span className="text-xs text-primary-subtle">{formatDate(r.created_at)}</span>
                                </div>
                            </div>
                            {r.user.id === user?.id && (
                                <button type="button" onClick={() => deleteReview.mutate(r.id)} className="text-xs text-red-500 hover:underline">
                                    حذف
                                </button>
                            )}
                        </div>
                        {r.comment && <p className="mt-2 text-sm text-primary-muted">{r.comment}</p>}
                    </li>
                ))}
            </ul>
        </div>
    );
}