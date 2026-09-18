// frontend/components/feature-banner.tsx
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import type { Banner } from '@/types';

interface SlideItem {
    image_url: string;
    title?: string | null;
    subtitle?: string | null;
    link_url?: string | null;
}

interface FeatureCarouselProps {
    banners: Banner[];
}

export function FeatureCarousel({ banners }: FeatureCarouselProps) {
    // Collect all images (primary + secondary) across feature banners
    const slides: SlideItem[] = banners.flatMap((b) => {
        const items: SlideItem[] = [
            {
                image_url: b.image_url,
                title: b.title,
                subtitle: b.subtitle,
                link_url: b.link_url,
            },
        ];
        if (b.secondary_image_url) {
            items.push({
                image_url: b.secondary_image_url,
                title: b.title,
                subtitle: b.subtitle,
                link_url: b.link_url,
            });
        }
        return items;
    });

    const [selectedIndex, setSelectedIndex] = useState(0);

    // Initialize Embla with RTL and autoplay (5.5s delay, pauses on user interaction/hover)
    const [emblaRef, emblaApi] = useEmblaCarousel(
        {
            loop: true,
            direction: 'rtl',
            duration: 35,
        },
        [
            Autoplay({
                delay: 5500,
                stopOnInteraction: false,
                stopOnMouseEnter: true,
            }),
        ]
    );

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
    }, [emblaApi, onSelect]);

    const scrollTo = useCallback(
        (index: number) => {
            if (emblaApi) emblaApi.scrollTo(index);
        },
        [emblaApi]
    );

    if (slides.length === 0) return null;

    return (
        <section className="relative w-full overflow-hidden bg-background select-none" dir="rtl">
            {/* Embla Viewport */}
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex touch-pan-y">
                    {slides.map((slide, idx) => (
                        <div
                            key={`${slide.image_url}-${idx}`}
                            className="relative min-w-0 flex-[0_0_100%] aspect-[4/5] min-h-[460px] sm:aspect-[21/9] sm:min-h-[520px]"
                        >
                            {/* Background Slide Image */}
                            <Image
                                src={slide.image_url}
                                alt={slide.title ?? 'مجموعه ویژه'}
                                fill
                                priority={idx === 0}
                                sizes="100vw"
                                className="object-cover object-center"
                            />

                            {/* Editorial Atmosphere Scrim */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/15 sm:bg-gradient-to-r sm:from-black/75 sm:via-black/45 sm:to-black/20" />

                            {/* Content Overlay */}
                            <div className="absolute inset-0 flex items-end sm:items-center">
                                <div className="mx-auto w-full max-w-[1440px] px-6 pb-14 sm:px-8 sm:pb-0 lg:px-12">
                                    <div className="max-w-xl text-right">
                                        <span className="font-mono text-xs uppercase tracking-widest text-white/70">
                                        </span>

                                        {slide.title && (
                                            <h2 className="mt-3 text-2xl font-light leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                                                {slide.title}
                                            </h2>
                                        )}

                                        {slide.subtitle && (
                                            <p className="mt-4 text-sm font-normal leading-relaxed text-white/80 sm:text-base">
                                                {slide.subtitle}
                                            </p>
                                        )}

                                        {slide.link_url && (
                                            <div className="mt-7 sm:mt-9">
                                                <Link
                                                    href={slide.link_url}
                                                    className="group inline-flex h-12 items-center justify-center gap-3 border border-white/60 bg-white/10 px-8 text-xs font-medium uppercase tracking-widest text-white backdrop-blur-sm transition-all duration-300 hover:border-white hover:bg-white hover:text-black"
                                                >
                                                    <span>مشاهده اثر</span>
                                                    <span className="inline-block transition-transform duration-300 group-hover:-translate-x-1">
                                                        ←
                                                    </span>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Progress Indicators */}
            {slides.length > 1 && (
                <div className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 gap-2 sm:bottom-8 sm:left-auto sm:right-12 sm:translate-x-0">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => scrollTo(i)}
                            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${i === selectedIndex ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
                                }`}
                            aria-label={`اسلاید ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}