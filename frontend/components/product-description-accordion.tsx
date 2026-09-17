// frontend/components/product-description-accordion.tsx
'use client';

import * as React from 'react';

interface ProductDescriptionAccordionProps {
    description: string;
}

export function ProductDescriptionAccordion({ description }: ProductDescriptionAccordionProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const isLong = description.length > 180;

    return (
        <div
            className="group relative overflow-hidden rounded-2xl border border-[#E8E2D1] bg-gradient-to-br from-[#FDFCFA]/95 via-[#FAF7F0]/85 to-[#F3EDE0]/70 p-5 shadow-[0_8px_30px_0_rgba(23,59,87,0.04)] backdrop-blur-2xl transition-all duration-500"
            dir="rtl"
        >
            {/* Alabaster Porcelain Micro-Grain Filter */}
            <svg
                className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.028] mix-blend-overlay"
                aria-hidden="true"
            >
                <filter id="desc-alabaster-grain">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.85"
                        numOctaves="3"
                        stitchTiles="stitch"
                    />
                    <feColorMatrix type="saturate" values="0" />
                </filter>
                <rect width="100%" height="100%" filter="url(#desc-alabaster-grain)" />
            </svg>

            {/* Ambient Pearl Glow & Bevel Highlight */}
            <div className="pointer-events-none absolute -end-16 -top-16 h-40 w-40 rounded-full bg-white/80 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-14 -start-14 h-36 w-36 rounded-full bg-[#E8DCBE]/25 blur-2xl" />
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/90" />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/70" />
                    <h2 className="text-xs font-semibold tracking-wide text-foreground">
                        درباره‌ی اثر
                    </h2>
                </div>

                {isLong && (
                    <button
                        type="button"
                        onClick={() => setIsOpen((prev) => !prev)}
                        className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[#D9CEB2]/60 bg-white/70 px-2.5 py-1 text-[11px] font-medium text-foreground/80 shadow-2xs backdrop-blur-md transition-all hover:bg-white hover:text-primary"
                    >
                        <span>{isOpen ? 'بستن' : 'مطالعه بیشتر'}</span>
                        <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                        >
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Content Drawer */}
            <div
                className={`relative z-10 mt-3 text-xs leading-[1.8] text-foreground/85 transition-all duration-500 ease-in-out ${isLong && !isOpen ? 'line-clamp-3' : 'line-clamp-none'
                    }`}
            >
                <p className="whitespace-pre-line font-sans font-normal">{description}</p>
            </div>

            {/* Soft Fog Mask When Clamped */}
            {isLong && !isOpen && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#FAF7F0] to-transparent" />
            )}
        </div>
    );
}