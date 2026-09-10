'use client';

import { useState } from 'react';
import { useNotifyMe } from '@/hooks/use-notify-me';

export default function NotifyMeForm({ productSlug }: { productSlug: string }) {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const notify = useNotifyMe(productSlug);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        if (!email.trim()) return;
        try {
            const result = await notify.mutateAsync(email.trim());
            setSent(result.message);
        } catch {
            setError('خطا در ثبت درخواست');
        }
    }

    if (sent) {
        return <p className="text-sm text-green-600">{sent}</p>;
    }

    return (
        <div className="space-y-2">
            <p className="text-sm text-primary-muted">این محصول ناموجود است. با ثبت ایمیل، پس از موجود شدن به شما اطلاع می‌دهیم.</p>
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ایمیل شما"
                    className="h-10 flex-1 rounded-lg border border-border-default bg-surface px-3 text-sm text-primary"
                />
                <button type="submit" disabled={notify.isPending} className="h-10 rounded-lg bg-accent px-4 text-sm font-medium text-white disabled:opacity-50">
                    {notify.isPending ? '...' : 'اطلاع بده'}
                </button>
            </form>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}