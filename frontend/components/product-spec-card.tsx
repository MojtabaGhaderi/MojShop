// frontend/components/product-spec-card.tsx
'use client';

import * as React from 'react';

interface MaterialSpec {
    metal_type: string;
    weight_grams: number;
}

interface ProductSpecCardProps {
    totalWeightGrams?: number | null;
    materials?: MaterialSpec[];
    sku?: string | null;
    categoryName?: string | null;
}

interface MetalMeta {
    label: string;
    hallmark: string;
    dotColor: string;
    badgeStyle: string;
}

const METAL_CONFIG: Record<string, MetalMeta> = {
    silver: {
        label: 'نقره استرلینگ ۹۲۵',
        hallmark: 'عیار ۹۲۵ دست‌ساز',
        dotColor: 'bg-slate-400',
        badgeStyle: 'border-[#C8BA99] bg-white/60 text-slate-800 dark:bg-slate-800/40 dark:text-slate-200',
    },
    gold: {
        label: 'طلای ۱۸ عیار',
        hallmark: 'طلای ۱۸ عیار (۷۵۰)',
        dotColor: 'bg-amber-400',
        badgeStyle: 'border-amber-400/40 bg-amber-500/15 text-amber-900 dark:text-amber-200',
    },
    rose_gold: {
        label: 'رزگلد ۱۸ عیار',
        hallmark: 'رزگلد ۱۸ عیار (۷۵۰)',
        dotColor: 'bg-rose-300',
        badgeStyle: 'border-rose-400/40 bg-rose-500/15 text-rose-900 dark:text-rose-200',
    },
    platinum: {
        label: 'پلاتین ۹۵۰',
        hallmark: 'پلاتین عیار ۹۵۰',
        dotColor: 'bg-cyan-300',
        badgeStyle: 'border-cyan-400/40 bg-cyan-500/15 text-cyan-900 dark:text-cyan-200',
    },
};

const DEFAULT_FALLBACK: MetalMeta = {
    label: 'متریال دست‌ساز',
    hallmark: 'اثر دست‌ساز اصیل',
    dotColor: 'bg-accent',
    badgeStyle: 'border-[#C8BA99] bg-white/50 text-[#3D3322]',
};

export function ProductSpecCard({
    totalWeightGrams,
    materials = [],
    sku,
    categoryName,
}: ProductSpecCardProps) {
    const [isOpen, setIsOpen] = React.useState(false);

    const primaryMaterial = React.useMemo(() => {
        if (!materials.length) return null;
        return [...materials].sort((a, b) => b.weight_grams - a.weight_grams)[0];
    }, [materials]);

    const primaryMeta = primaryMaterial
        ? METAL_CONFIG[primaryMaterial.metal_type] || DEFAULT_FALLBACK
        : DEFAULT_FALLBACK;

    return (
        <div
            className="group relative overflow-hidden rounded-2xl border border-[#D9CEB2]/50 bg-gradient-to-br from-[#FAF5EB]/90 via-[#F3EADB]/75 to-[#EAE0CD]/60 shadow-[0_8px_30px_rgb(70,55,30,0.03)] backdrop-blur-2xl transition-all duration-300"
            dir="rtl"
        >
            {/* Luxury Perlin Noise Grain */}
            <svg
                className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.035] mix-blend-overlay"
                aria-hidden="true"
            >
                <filter id="specs-sand-grain">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.8"
                        numOctaves="3"
                        stitchTiles="stitch"
                    />
                    <feColorMatrix type="saturate" values="0" />
                </filter>
                <rect width="100%" height="100%" filter="url(#specs-sand-grain)" />
            </svg>

            {/* Warm Silk Glow & Inner Reflection */}
            <div className="pointer-events-none absolute -end-16 -top-16 h-40 w-40 rounded-full bg-[#FAF3E1]/60 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -start-12 h-36 w-36 rounded-full bg-[#E0D1B4]/40 blur-2xl" />
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/50" />

            {/* Accordion Trigger */}
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="relative z-10 flex w-full cursor-pointer items-center justify-between p-4.5 text-start transition-colors hover:bg-white/20 focus:outline-none"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-3">
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`text-[#3D3322]/80 transition-transform duration-300 ease-out ${isOpen ? 'rotate-180' : 'rotate-0'
                            }`}
                    >
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                    <span className="text-xs font-semibold tracking-wide text-[#2C2416]">
                        شناسنامه و مشخصات اثر
                    </span>
                </div>

                <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-mono font-medium shadow-xs backdrop-blur-md ${primaryMeta.badgeStyle}`}
                >
                    <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${primaryMeta.dotColor}`} />
                    {primaryMeta.hallmark}
                </span>
            </button>

            {/* Smooth Grid Drawer */}
            <div
                className={`relative z-10 grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
            >
                <div className="overflow-hidden">
                    <div className="border-t border-[#D9CEB2]/40 px-5 pb-5 pt-3.5">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-xs text-[#3D3322]">
                            {categoryName && (
                                <div>
                                    <span className="block text-[11px] text-[#7A6B52]">دسته‌بندی</span>
                                    <span className="mt-0.5 block font-medium text-[#2C2416]">
                                        {categoryName}
                                    </span>
                                </div>
                            )}

                            {totalWeightGrams ? (
                                <div>
                                    <span className="block text-[11px] text-[#7A6B52]">وزن کل اثر</span>
                                    <span className="mt-0.5 block font-mono font-medium text-[#2C2416]">
                                        {totalWeightGrams.toLocaleString('fa-IR')} گرم
                                    </span>
                                </div>
                            ) : null}

                            {materials.length > 0 && (
                                <div className="col-span-2">
                                    <span className="block text-[11px] text-[#7A6B52]">متریال و آلیاژ</span>
                                    <div className="mt-1.5 flex flex-wrap gap-2">
                                        {materials.map((m, idx) => {
                                            const meta = METAL_CONFIG[m.metal_type] || DEFAULT_FALLBACK;
                                            return (
                                                <span
                                                    key={idx}
                                                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#D9CEB2]/60 bg-white/50 px-3 py-1 text-[11px] font-medium text-[#2C2416] backdrop-blur-md shadow-2xs"
                                                >
                                                    <span className={`h-1.5 w-1.5 rounded-full ${meta.dotColor}`} />
                                                    {meta.label}
                                                    {m.weight_grams > 0 && (
                                                        <span className="font-mono text-[10px] text-[#7A6B52]">
                                                            ({m.weight_grams.toLocaleString('fa-IR')}g)
                                                        </span>
                                                    )}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {sku && (
                                <div className="col-span-2 mt-1 flex items-center justify-between border-t border-[#D9CEB2]/40 pt-2.5 font-mono text-[10px] text-[#7A6B52]">
                                    <span>شناسه اثر:</span>
                                    <span className="font-semibold tracking-wider text-[#2C2416]">
                                        {sku}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}