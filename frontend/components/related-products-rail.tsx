// frontend/components/related-products-rail.tsx
'use client';

import * as React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import ProductCard from '@/components/product-card';
import type { Product } from '@/types';

interface RelatedProductsRailProps {
    products: Product[];
}

export function RelatedProductsRail({ products }: RelatedProductsRailProps) {
    // Ensure enough slides for seamless infinite loop without Embla snapping glitches
    const repeatedProducts = React.useMemo(() => {
        if (products.length === 0) return [];
        if (products.length >= 8) return products;
        const factor = Math.ceil(8 / products.length);
        return Array.from({ length: factor }, () => products).flat();
    }, [products]);

    const [emblaRef, emblaApi] = useEmblaCarousel({
        direction: 'rtl',
        loop: true,
        align: 'start',
        dragFree: true,
    });

    const scrollPrev = React.useCallback(() => {
        emblaApi?.scrollPrev();
    }, [emblaApi]);

    const scrollNext = React.useCallback(() => {
        emblaApi?.scrollNext();
    }, [emblaApi]);

    if (products.length === 0) return null;

    return (
        <section className="relative mt-20 border-t border-border/60 pt-12 select-none" dir="rtl">
            {/* Editorial Section Header */}
            <div className="mb-6 flex items-end justify-between px-1">
                <div>
                    <span className="text-[11px] font-medium tracking-widest text-accent uppercase">
                        مجموعه هماهنگ
                    </span>
                    <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                        آثار مرتبط و مشابه
                    </h2>
                </div>

                {/* Tactile Signature Arrow Controls */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={scrollPrev}
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-border/80 bg-card/80 text-foreground transition-all duration-200 hover:border-accent hover:bg-card active:scale-95 shadow-2xs"
                        aria-label="قبلی"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={scrollNext}
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-border/80 bg-card/80 text-foreground transition-all duration-200 hover:border-accent hover:bg-card active:scale-95 shadow-2xs"
                        aria-label="بعدی"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Infinite Swipe Viewport */}
            <div className="relative overflow-hidden" ref={emblaRef}>
                <div className="flex gap-4 sm:gap-5 py-2">
                    {repeatedProducts.map((p, idx) => (
                        <div
                            key={`${p.id}-${idx}`}
                            className="min-w-0 flex-[0_0_72%] sm:flex-[0_0_46%] md:flex-[0_0_32%] lg:flex-[0_0_28%]"
                        >
                            <div className="h-full transition-transform duration-300 hover:-translate-y-1">
                                <ProductCard product={p} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}