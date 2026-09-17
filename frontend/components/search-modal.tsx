// frontend/components/search-modal.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/types';
import { formatPriceWithCurrency } from '@/lib/utils';
import { IMAGE_DIMENSIONS } from '@/types';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const STORAGE_KEY = 'mowj_recent_searches';
const MAX_RECENTS = 5;

// Safe LocalStorage helpers with automatic fallback
function getStoredSearches(): string[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed)
            ? parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
            : [];
    } catch {
        return [];
    }
}

function saveSearchTerm(term: string): string[] {
    const cleaned = term.trim();
    if (!cleaned || typeof window === 'undefined') return [];
    try {
        const current = getStoredSearches();
        const updated = [cleaned, ...current.filter((item) => item !== cleaned)].slice(0, MAX_RECENTS);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
    } catch {
        return [];
    }
}

function removeStoredSearch(term: string): string[] {
    if (typeof window === 'undefined') return [];
    try {
        const current = getStoredSearches();
        const updated = current.filter((item) => item !== term);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
    } catch {
        return [];
    }
}

function clearAllStoredSearches(): void {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.removeItem(STORAGE_KEY);
    } catch {
        // Silently handle private browsing or quota limits
    }
}

function resolveImageUrl(url?: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || '';
    return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const router = useRouter();
    const [query, setQuery] = React.useState('');
    const [results, setResults] = React.useState<Product[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [recentSearches, setRecentSearches] = React.useState<string[]>([]);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Sync recent searches from localStorage on mount/open
    React.useEffect(() => {
        if (!isOpen) {
            setQuery('');
            setResults([]);
            return;
        }

        setRecentSearches(getStoredSearches());

        const timer = setTimeout(() => inputRef.current?.focus(), 60);
        document.body.style.overflow = 'hidden';

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            clearTimeout(timer);
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    // Live debounced search with abort controller
    React.useEffect(() => {
        const trimmed = query.trim();
        if (trimmed.length < 2) {
            setResults([]);
            setIsLoading(false);
            return;
        }

        const controller = new AbortController();
        setIsLoading(true);

        const handler = setTimeout(async () => {
            try {
                const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || '';
                const res = await fetch(
                    `${backendBase}/products?search=${encodeURIComponent(trimmed)}&limit=5`,
                    { signal: controller.signal }
                );
                if (res.ok) {
                    const data = await res.json();
                    setResults(Array.isArray(data) ? data : data.items || []);
                } else {
                    setResults([]);
                }
            } catch (err: unknown) {
                if (err instanceof Error && err.name !== 'AbortError') {
                    setResults([]);
                }
            } finally {
                setIsLoading(false);
            }
        }, 250);

        return () => {
            clearTimeout(handler);
            controller.abort();
        };
    }, [query]);

    function executeSearch(term: string) {
        const trimmed = term.trim();
        if (!trimmed) return;
        saveSearchTerm(trimmed);
        onClose();
        router.push(`/products?search=${encodeURIComponent(trimmed)}`);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        executeSearch(query);
    }

    function handleRemoveRecent(e: React.MouseEvent, term: string) {
        e.stopPropagation();
        const updated = removeStoredSearch(term);
        setRecentSearches(updated);
    }

    function handleClearAllRecents() {
        clearAllStoredSearches();
        setRecentSearches([]);
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 select-none" dir="rtl">
            {/* ── 1. Frosted Scrim ── */}
            <div
                className="fixed inset-0 bg-primary/40 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* ── 2. Alabaster Search Card ── */}
            <div className="fixed inset-x-4 top-16 sm:top-24 z-50 mx-auto max-w-2xl overflow-hidden rounded-3xl border border-[#E8E2D1] bg-gradient-to-b from-[#FDFCFA] via-[#FAF7F0] to-[#F5EFE1] shadow-[0_25px_60px_rgba(23,59,87,0.25)] backdrop-blur-2xl transition-all duration-300 animate-in fade-in zoom-in-95">

                {/* Subtle Perlin Noise */}
                <svg
                    className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.025] mix-blend-overlay"
                    aria-hidden="true"
                >
                    <filter id="search-modal-grain">
                        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
                        <feColorMatrix type="saturate" values="0" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#search-modal-grain)" />
                </svg>

                {/* Input Bar */}
                <form onSubmit={handleSubmit} className="relative z-10 border-b border-[#E8E2D1]/80 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-accent shrink-0"
                            aria-hidden="true"
                        >
                            <circle cx="11" cy="11" r="7.5" />
                            <line x1="16.5" y1="16.5" x2="21" y2="21" />
                        </svg>

                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="جستجو در میان نام اثر، متریال یا عیار..."
                            className="w-full bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground/70 focus:outline-none sm:text-base"
                        />

                        {query && (
                            <button
                                type="button"
                                onClick={() => setQuery('')}
                                className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground cursor-pointer"
                                aria-label="پاک کردن متن"
                            >
                                ✕
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={onClose}
                            className="hidden rounded-lg border border-border/80 bg-white/60 px-2 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-block cursor-pointer"
                        >
                            ESC
                        </button>
                    </div>
                </form>

                {/* Search Body: Results OR Recent Searches OR Clean Fallback */}
                <div className="relative z-10 max-h-[60vh] overflow-y-auto p-6 scrollbar-thin">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-10">
                            <span className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                            <span className="ms-3 text-xs text-muted-foreground">در حال جستجوی آثار...</span>
                        </div>
                    ) : query.trim().length >= 2 ? (
                        results.length > 0 ? (
                            <div className="space-y-3">
                                <span className="text-[11px] font-medium text-muted-foreground">آثار یافت شده:</span>
                                <div className="divide-y divide-border/40">
                                    {results.map((product) => {
                                        const primaryImg = product.images?.find((img) => img.is_primary) || product.images?.[0];
                                        return (
                                            <Link
                                                key={product.id}
                                                href={`/products/${product.slug}`}
                                                onClick={() => {
                                                    saveSearchTerm(query);
                                                    onClose();
                                                }}
                                                className="flex items-center gap-4 py-3 transition-colors hover:bg-accent/10 -mx-3 px-3 rounded-xl"
                                            >
                                                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border/80 bg-card p-1">
                                                    {primaryImg ? (
                                                        <Image
                                                            src={resolveImageUrl(primaryImg.url)}
                                                            alt={product.name}
                                                            width={IMAGE_DIMENSIONS.thumb.width}
                                                            height={IMAGE_DIMENSIONS.thumb.height}
                                                            unoptimized
                                                            className="h-full w-full object-contain"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center bg-muted text-[9px] text-muted-foreground">
                                                            بدون تصویر
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xs font-semibold text-foreground truncate">{product.name}</h4>
                                                    {product.category && (
                                                        <span className="text-[10px] text-muted-foreground block mt-0.5">
                                                            {product.category.name}
                                                        </span>
                                                    )}
                                                </div>

                                                <span className="font-mono text-xs font-bold text-foreground shrink-0">
                                                    {formatPriceWithCurrency(product.current_price)}
                                                </span>
                                            </Link>
                                        );
                                    })}
                                </div>

                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    className="mt-4 flex h-10 w-full items-center justify-center rounded-xl bg-primary/10 text-xs font-medium text-foreground transition-colors hover:bg-primary/15 cursor-pointer"
                                >
                                    مشاهده تمامی نتایج برای «{query}»
                                </button>
                            </div>
                        ) : (
                            <div className="py-10 text-center">
                                <p className="text-xs font-medium text-foreground">اثری با این مشخصات یافت نشد</p>
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                    لطفاً با عبارات عمومی‌تر یا نام متریال جستجو فرمایید.
                                </p>
                            </div>
                        )
                    ) : recentSearches.length > 0 ? (
                        /* ── Recent Searches Section (Option B) ── */
                        <div className="space-y-3.5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    <span className="text-[11px] font-medium">جستجوهای اخیر شما</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleClearAllRecents}
                                    className="text-[10px] font-medium text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                                >
                                    پاک کردن همه
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {recentSearches.map((term) => (
                                    <div
                                        key={term}
                                        onClick={() => executeSearch(term)}
                                        className="group inline-flex items-center gap-2 rounded-xl border border-border/70 bg-white/70 ps-3 pe-2 py-1.5 text-xs text-foreground transition-all hover:border-accent hover:bg-white cursor-pointer shadow-2xs"
                                    >
                                        <span>{term}</span>
                                        <button
                                            type="button"
                                            onClick={(e) => handleRemoveRecent(e, term)}
                                            className="flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground opacity-50 transition-opacity hover:opacity-100 hover:text-destructive cursor-pointer"
                                            aria-label={`حذف ${term}`}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* ── Fallback to None (Clean Quiet State) ── */
                        <div className="py-8 text-center text-xs text-muted-foreground/80">
                            <p>نام اثر، متریال (طلا، نقره) یا دسته مورد نظر خود را وارد نمایید.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}