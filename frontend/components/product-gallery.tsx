'use client';

import * as React from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { IMAGE_DIMENSIONS } from '@/types';
import type { ProductImage } from '@/types';
import { cn } from '@/lib/utils';

function resolveImageUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || '';
    return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
}

export default function ProductGallery({
    images,
    productName,
}: {
    images: ProductImage[];
    productName: string;
}) {
    const primary = images.find((i) => i.is_primary);
    const ordered = React.useMemo(() => {
        return primary
            ? [primary, ...images.filter((i) => i.id !== primary.id).sort((a, b) => a.sort_order - b.sort_order)]
            : [...images].sort((a, b) => a.sort_order - b.sort_order);
    }, [images, primary]);

    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [lightboxOpen, setLightboxOpen] = React.useState(false);

    const [emblaMainRef, emblaMain] = useEmblaCarousel({ direction: 'rtl', loop: true });
    const [emblaThumbRef, emblaThumb] = useEmblaCarousel({
        direction: 'rtl',
        containScroll: 'keepSnaps',
        dragFree: true,
    });

    const onSelect = React.useCallback(() => {
        if (!emblaMain || !emblaThumb) return;
        const idx = emblaMain.selectedScrollSnap();
        setSelectedIndex(idx);
        emblaThumb.scrollTo(idx);
    }, [emblaMain, emblaThumb]);

    React.useEffect(() => {
        if (!emblaMain) return;
        emblaMain.on('select', onSelect);
        return () => {
            emblaMain.off('select', onSelect);
        };
    }, [emblaMain, onSelect]);

    React.useEffect(() => {
        if (!lightboxOpen) return;
        function handleKey(e: KeyboardEvent) {
            if (e.key === 'Escape') setLightboxOpen(false);
            if (e.key === 'ArrowLeft') setSelectedIndex((i) => (i + 1) % ordered.length);
            if (e.key === 'ArrowRight') setSelectedIndex((i) => (i - 1 + ordered.length) % ordered.length);
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
            <div className="flex aspect-square items-center justify-center rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/60 backdrop-blur-sm">
                <svg
                    width="44"
                    height="44"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-zinc-400/80"
                >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                </svg>
            </div>
        );
    }

    const current = ordered[selectedIndex];

    return (
        <div className="flex flex-col gap-3.5 select-none" dir="rtl">
            {/* Main Viewport */}
            <div
                className="relative aspect-square w-full overflow-hidden rounded-2xl border border-zinc-200/50 dark:border-zinc-800/70 bg-gradient-to-b from-zinc-50/70 to-zinc-100/40 dark:from-zinc-900/60 dark:to-zinc-950/40 backdrop-blur-md"
                ref={emblaMainRef}
            >
                <div className="flex h-full">
                    {ordered.map((img, idx) => (
                        <div
                            key={img.id}
                            className="relative h-full min-w-full flex items-center justify-center cursor-zoom-in p-8"
                            onClick={() => setLightboxOpen(true)}
                        >
                            <Image
                                src={resolveImageUrl(img.url)}
                                alt={img.alt_text || productName}
                                width={IMAGE_DIMENSIONS.large.width}
                                height={IMAGE_DIMENSIONS.large.height}
                                priority={idx === 0}
                                unoptimized
                                className="h-full w-full object-contain transition-transform duration-700 ease-out hover:scale-105"
                            />
                        </div>
                    ))}
                </div>

                {/* Minimal Counter Tag */}
                <div className="absolute bottom-3 end-3 px-2.5 py-1 rounded-full bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-zinc-200/40 dark:border-zinc-800/50 text-[11px] font-mono tracking-wider text-zinc-600 dark:text-zinc-400">
                    {selectedIndex + 1} / {ordered.length}
                </div>
            </div>

            {/* Thumbnails Rail with Low-Opacity Tray */}
            {ordered.length > 1 && (
                <div
                    className="overflow-hidden rounded-2xl p-1.5 border border-zinc-200/40 dark:border-zinc-800/50 bg-zinc-900/[0.02] dark:bg-white/[0.02] backdrop-blur-md"
                    ref={emblaThumbRef}
                >
                    <div className="flex gap-2.5">
                        {ordered.map((img, i) => (
                            <button
                                key={img.id}
                                type="button"
                                onClick={() => emblaMain?.scrollTo(i)}
                                className={cn(
                                    "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border transition-all duration-300",
                                    i === selectedIndex
                                        ? "border-zinc-900 dark:border-zinc-100 bg-white dark:bg-zinc-900 shadow-sm scale-100 ring-1 ring-zinc-900/10 dark:ring-zinc-100/10"
                                        : "border-zinc-200/50 dark:border-zinc-800/60 bg-zinc-100/40 dark:bg-zinc-900/30 opacity-55 hover:opacity-90 hover:scale-[0.98]"
                                )}
                                aria-label={`تصویر ${i + 1}`}
                                aria-current={i === selectedIndex}
                            >
                                <Image
                                    src={resolveImageUrl(img.url)}
                                    alt={img.alt_text || productName}
                                    width={IMAGE_DIMENSIONS.thumb.width}
                                    height={IMAGE_DIMENSIONS.thumb.height}
                                    unoptimized
                                    className="h-full w-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Lightbox */}
            {lightboxOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
                    onClick={() => setLightboxOpen(false)}
                >
                    <button
                        type="button"
                        onClick={() => setLightboxOpen(false)}
                        className="absolute top-6 end-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/90 transition-colors hover:bg-white/20"
                        aria-label="بستن"
                    >
                        ✕
                    </button>

                    {ordered.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedIndex((i) => (i + 1) % ordered.length);
                                }}
                                className="absolute start-6 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                                aria-label="تصویر بعدی"
                            >
                                ‹
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedIndex((i) => (i - 1 + ordered.length) % ordered.length);
                                }}
                                className="absolute end-6 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                                aria-label="تصویر قبلی"
                            >
                                ›
                            </button>
                        </>
                    )}

                    <div className="relative max-h-[85vh] max-w-[85vw] p-4" onClick={(e) => e.stopPropagation()}>
                        <Image
                            src={resolveImageUrl(current.url)}
                            alt={current.alt_text || productName}
                            width={IMAGE_DIMENSIONS.large.width}
                            height={IMAGE_DIMENSIONS.large.height}
                            unoptimized
                            className="max-h-[85vh] w-auto object-contain select-none"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}