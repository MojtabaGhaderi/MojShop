'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { IMAGE_DIMENSIONS } from '@/types';
import type { ProductImage } from '@/types';

export default function ProductGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
    const primary = images.find((i) => i.is_primary);
    const ordered = primary
        ? [primary, ...images.filter((i) => i.id !== primary.id).sort((a, b) => a.sort_order - b.sort_order)]
        : [...images].sort((a, b) => a.sort_order - b.sort_order);

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const current = ordered[selectedIndex];

    useEffect(() => {
        if (!lightboxOpen) return;
        function handleKey(e: KeyboardEvent) {
            if (e.key === 'Escape') setLightboxOpen(false);
            if (e.key === 'ArrowRight') setSelectedIndex((i) => (i + 1) % ordered.length);
            if (e.key === 'ArrowLeft') setSelectedIndex((i) => (i - 1 + ordered.length) % ordered.length);
        }
        document.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [lightboxOpen, ordered.length]);

    if (ordered.length === 0) {
        return (
            <div className="flex aspect-square items-center justify-center rounded-lg bg-surface-elevated">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary-subtle">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                </svg>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="block aspect-square w-full cursor-zoom-in overflow-hidden rounded-lg bg-surface-elevated"
                aria-label="بزرگ‌نمایی تصویر"
            >
                <Image
                    src={current.url}
                    alt={current.alt_text || productName}
                    width={IMAGE_DIMENSIONS.large.width}
                    height={IMAGE_DIMENSIONS.large.height}
                    unoptimized
                    className="h-full w-full object-cover"
                    priority
                />
            </button>

            {ordered.length > 1 && (
                <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
                    {ordered.map((img, i) => (
                        <button
                            key={img.id}
                            type="button"
                            onClick={() => setSelectedIndex(i)}
                            className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 bg-surface-elevated transition-colors ${i === selectedIndex ? 'border-accent' : 'border-border-default hover:border-primary-subtle'
                                }`}
                            aria-label={`تصویر ${i + 1}`}
                            aria-current={i === selectedIndex}
                        >
                            <Image
                                src={img.url}
                                alt={img.alt_text || productName}
                                width={IMAGE_DIMENSIONS.thumb.width}
                                height={IMAGE_DIMENSIONS.thumb.height}
                                unoptimized
                                className="h-full w-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}

            {lightboxOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={() => setLightboxOpen(false)}>
                    <button
                        type="button"
                        onClick={() => setLightboxOpen(false)}
                        className="absolute top-4 end-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                        aria-label="بستن"
                    >
                        ✕
                    </button>
                    {ordered.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setSelectedIndex((i) => (i - 1 + ordered.length) % ordered.length); }}
                                className="absolute start-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                                aria-label="تصویر قبلی"
                            >
                                ‹
                            </button>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setSelectedIndex((i) => (i + 1) % ordered.length); }}
                                className="absolute end-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                                aria-label="تصویر بعدی"
                            >
                                ›
                            </button>
                        </>
                    )}
                    <div className="max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
                        <Image
                            src={current.url}
                            alt={current.alt_text || productName}
                            width={IMAGE_DIMENSIONS.large.width}
                            height={IMAGE_DIMENSIONS.large.height}
                            unoptimized
                            className="max-h-[90vh] w-auto object-contain"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}