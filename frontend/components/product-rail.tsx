// frontend/components/product-rail.tsx
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import ProductCard from './product-card';
import type { ProductListItem } from '@/types';

interface ProductRailProps {
    title: string;
    subtitle?: string;
    products: ProductListItem[];
    viewAllHref: string;
}

export default function ProductRail({
    title,
    subtitle,
    products,
    viewAllHref,
}: ProductRailProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        direction: 'rtl',
        align: 'start',
        dragFree: true,
        watchDrag: true,
    });

    const [mounted, setMounted] = useState(false);
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setCanScrollPrev(emblaApi.canScrollPrev());
        setCanScrollNext(emblaApi.canScrollNext());
    }, [emblaApi]);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
    }, [emblaApi, onSelect]);

    if (!products || products.length === 0) return null;

    return (
        <section
            className="relative overflow-hidden bg-gradient-to-b from-background via-secondary/35 to-background py-14 sm:py-20 select-none"
            dir="rtl"
        >
            <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
                {/* Section Header */}
                <div className="mb-8 flex items-end justify-between sm:mb-12">
                    <div className="text-right">
                        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="mt-1.5 text-xs text-muted-foreground sm:text-sm">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6">
                        {/* Desktop Navigation Chevrons */}
                        <div className="hidden items-center gap-2 md:flex">
                            <button
                                type="button"
                                onClick={scrollPrev}
                                disabled={mounted ? !canScrollPrev : false}
                                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-border/80 bg-background/80 text-foreground backdrop-blur-sm transition-all hover:border-accent hover:bg-card active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 shadow-2xs"
                                aria-label="آثار قبلی"
                            >
                                <svg
                                    width="15"
                                    height="15"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </button>

                            <button
                                type="button"
                                onClick={scrollNext}
                                disabled={mounted ? !canScrollNext : false}
                                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-border/80 bg-background/80 text-foreground backdrop-blur-sm transition-all hover:border-accent hover:bg-card active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 shadow-2xs"
                                aria-label="آثار بعدی"
                            >
                                <svg
                                    width="15"
                                    height="15"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                            </button>
                        </div>

                        {/* Signature Arrow Link */}
                        <Link
                            href={viewAllHref}
                            className="group inline-flex items-center gap-2 text-xs font-semibold text-foreground transition-opacity hover:opacity-80 sm:gap-3 sm:text-sm"
                            aria-label={`مشاهده همه ${title}`}
                        >
                            <span>مشاهده همه</span>
                            <Image
                                src="/signature-arrow.png"
                                alt=""
                                width={300}
                                height={80}
                                className="!h-5 !w-auto max-w-none transition-transform duration-500 ease-out group-hover:-translate-x-2 sm:!h-9"
                            />
                        </Link>
                    </div>
                </div>

                {/* Embla Viewport */}
                <div
                    className="overflow-hidden cursor-grab active:cursor-grabbing"
                    ref={emblaRef}
                >
                    <div className="flex gap-4 sm:gap-6">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="min-w-0 shrink-0 grow-0 basis-[72%] sm:basis-[46%] md:basis-[31%] lg:basis-[23.5%]"
                            >
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}