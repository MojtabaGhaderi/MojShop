"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { Banner } from "@/types";

interface HeroCarouselProps {
    banners: Banner[];
}

export default function HeroCarousel({ banners }: HeroCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [paused, setPaused] = useState(false);

    const hasMultiple = banners.length > 1;

    useEffect(() => {
        if (!hasMultiple || paused) {
            return;
        }

        const interval = window.setInterval(() => {
            setActiveIndex((current) => (current + 1) % banners.length);
        }, 5500);

        return () => window.clearInterval(interval);
    }, [banners.length, hasMultiple, paused]);

    if (banners.length === 0) {
        return null;
    }

    return (
        <section
            className="relative overflow-hidden bg-surface"
            aria-label="بنرهای ویژه"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
        >
            <div className="relative h-[min(72vh,720px)] min-h-[460px]">
                {banners.map((banner, index) => {
                    const isActive = index === activeIndex;

                    const slideContent = (
                        <>
                            <Image
                                src={banner.image_url}
                                alt={banner.title || "موج"}
                                fill
                                priority={index === 0}
                                className="object-cover"
                                sizes="100vw"
                            />
                            {/* Bottom atmospheric layer */}
                            <div
                                className="
    pointer-events-none
    absolute inset-x-0 bottom-0
    h-35
    bg-[#173B57]/25
    backdrop-blur
    backdrop-saturate-125
    [mask-image:linear-gradient(to_bottom,transparent_0%,black_55%,black_100%)]
  "
                                aria-hidden="true"
                            />

                            {/* Hero text */}
                            <div className="absolute inset-x-0 bottom-0 h-48 sm:h-56">
                                <div className="mx-auto flex h-full max-w-[1440px] items-end px-5 pb-10 sm:px-8 sm:pb-12 lg:px-10">
                                    <div className="max-w-xl">
                                        {banner.title && (
                                            <h1 className="text-2xl font-medium tracking-tight text-white sm:text-4xl lg:text-5xl">
                                                {banner.title}
                                            </h1>
                                        )}

                                        {banner.subtitle && (
                                            <p className="mt-3 max-w-md text-sm leading-7 text-white/80 sm:text-base">
                                                {banner.subtitle}
                                            </p>
                                        )}

                                        {banner.link_url && (
                                            <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-white">
                                                <span>مشاهده مجموعه</span>
                                                <span aria-hidden="true">←</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Slide counter */}
                            {hasMultiple && (
                                <div className="absolute bottom-6 left-5 sm:left-8 lg:left-10">
                                    <span
                                        className="text-xs tracking-[0.15em] text-primary/65"
                                        dir="ltr"
                                    >
                                        {String(index + 1).padStart(2, "0")}{" "}
                                        <span className="mx-1">/</span>{" "}
                                        {String(banners.length).padStart(2, "0")}
                                    </span>
                                </div>
                            )}
                        </>
                    );

                    if (banner.link_url) {
                        return (
                            <Link
                                key={banner.id}
                                href={banner.link_url}
                                className={`group absolute inset-0 transition-opacity duration-[800ms] ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${isActive
                                    ? "z-10 opacity-100"
                                    : "pointer-events-none z-0 opacity-0"
                                    }`}
                                aria-hidden={!isActive}
                                tabIndex={isActive ? 0 : -1}
                            >
                                {slideContent}
                            </Link>
                        );
                    }

                    return (
                        <div
                            key={banner.id}
                            className={`absolute inset-0 transition-opacity duration-[800ms] ease-out ${isActive
                                ? "z-10 opacity-100"
                                : "pointer-events-none z-0 opacity-0"
                                }`}
                            aria-hidden={!isActive}
                        >
                            {slideContent}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}