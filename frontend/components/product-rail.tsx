'use client';

import React from 'react';
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
    const [emblaRef] = useEmblaCarousel({
        direction: 'rtl',
        align: 'start',
        dragFree: true,
        containScroll: 'trimSnaps',
    });

    if (!products || products.length === 0) return null;

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-background via-secondary/35 to-background py-16 sm:py-24">
            <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">

                {/* Section Header: Title first, Subtitle below */}
                <div className="mb-8 flex items-end justify-between sm:mb-12">
                    <div>
                        <h2 className="text-xl font-medium tracking-tight text-foreground sm:text-2xl">
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    {/* Signature Arrow Link */}
                    <Link
                        href={viewAllHref}
                        className="group inline-flex items-center gap-3 text-sm font-medium text-foreground transition-opacity hover:opacity-80 sm:text-base"
                        aria-label={`مشاهده همه ${title}`}
                    >
                        <span>مشاهده همه</span>
                        <Image
                            src="/signature-arrow.png"
                            alt=""
                            width={300}
                            height={80}
                            className="!h-5 !w-auto max-w-none transition-transform duration-500 ease-out group-hover:-translate-x-2 sm:!h-11"
                        />
                    </Link>
                </div>

                {/* Embla Viewport: Zero negative margins so the first card aligns flush on mobile */}
                <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
                    <div className="flex touch-pan-y gap-4 sm:gap-6">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="min-w-0 shrink-0 grow-0 basis-[72%] sm:basis-[46%] md:basis-[31%] lg:basis-[23%]"
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