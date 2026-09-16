"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import type { Banner } from "@/types";

interface HeroCarouselProps {
    banners: Banner[];
}

export default function HeroCarousel({ banners }: HeroCarouselProps) {
    // Configured for RTL physics, looping, and yielding to touch
    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: true, direction: "rtl" },
        [
            Autoplay({
                delay: 5500,
                stopOnInteraction: false, // Resumes autoplay after user swipes
                stopOnMouseEnter: true,   // Pauses when mouse is over the banner
            })
        ]
    );

    const [activeIndex, setActiveIndex] = useState(0);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setActiveIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on("select", onSelect);
        emblaApi.on("reInit", onSelect);
    }, [emblaApi, onSelect]);

    if (!banners || banners.length === 0) return null;

    const hasMultiple = banners.length > 1;

    return (
        <section
            className="relative w-full overflow-hidden bg-secondary"
            aria-label="بنرهای ویژه"
        >
            <div className="relative h-[min(72vh,720px)] min-h-[460px] w-full" ref={hasMultiple ? emblaRef : null}>
                <div className="flex h-full touch-pan-y">
                    {banners.map((banner, index) => (
                        <div
                            key={banner.id}
                            className="relative h-full min-w-0 shrink-0 grow-0 basis-full"
                        >
                            <Image
                                src={banner.image_url}
                                alt={banner.title || "موج گالری"}
                                fill
                                priority={index === 0}
                                className="object-cover object-center"
                                sizes="100vw"
                            />

                            {/* Hard, Dark Horizon Gradient */}
                            <div
                                className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#0E1A24]/90 via-[#0E1A24]/40 to-transparent sm:h-64"
                                aria-hidden="true"
                            />

                            {/* Text Payload - Reverted to White and Pushed Up (pb-20) */}
                            <div className="absolute inset-x-0 bottom-0 h-56 sm:h-64">
                                <div className="mx-auto flex h-full max-w-[1440px] items-end px-5 pb-20 sm:px-8 sm:pb-24 lg:px-10">
                                    <div className="max-w-xl">
                                        {banner.title && (
                                            <h1 className="text-2xl font-medium tracking-tight text-white sm:text-4xl lg:text-5xl">
                                                {banner.title}
                                            </h1>
                                        )}

                                        {banner.subtitle && (
                                            <p className="mt-3 max-w-md text-sm leading-7 text-white/90 sm:text-base">
                                                {banner.subtitle}
                                            </p>
                                        )}

                                        {banner.link_url && (
                                            <Link
                                                href={banner.link_url}
                                                className="group mt-5 inline-flex items-center gap-2 text-sm font-medium text-white transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-[#0E1A24]"
                                            >
                                                <span>مشاهده مجموعه</span>
                                                <span className="transition-transform duration-300 group-hover:-translate-x-1" aria-hidden="true">←</span>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Editorial Counter - Moved up (bottom-20) and text reverted to white */}
            {hasMultiple && (
                <div className="pointer-events-none absolute bottom-20 left-5 z-10 sm:bottom-24 sm:left-8 lg:left-10">
                    <span className="font-mono text-xs tracking-widest text-white" dir="ltr">
                        {String(activeIndex + 1).padStart(2, "0")}
                        <span className="mx-2 text-white/50">/</span>
                        {String(banners.length).padStart(2, "0")}
                    </span>
                </div>
            )}
        </section>
    );
}