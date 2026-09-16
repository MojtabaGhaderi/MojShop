import type { FC } from 'react';

export interface TrustBadgeItem {
    id: number;
    title: string;
    description: string;
    icon_key: string;
}

interface TrustPillarsProps {
    badges: TrustBadgeItem[];
}

function PillarIcon({ iconKey }: { iconKey: string }) {
    const props = {
        className: "h-4 w-4 text-accent stroke-[1.25]",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
    };

    switch (iconKey) {
        case 'gem': // Diamond / Assay mark
            return (
                <svg {...props}>
                    <polygon points="6 3 18 3 22 9 12 21 2 9 6 3" />
                </svg>
            );
        case 'scale': // Balance / Transparency
            return (
                <svg {...props}>
                    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
                    <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
                    <path d="M7 21h10" />
                    <path d="M12 3v18" />
                    <path d="M3 7h18" />
                </svg>
            );
        case 'box': // Packaging / Dispatch
            return (
                <svg {...props}>
                    <path d="m7.5 4.27 9 5.15" />
                    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                    <path d="m3.3 7 8.7 5 8.7-5" />
                    <path d="M12 22V12" />
                </svg>
            );
        case 'shield': // Security
            return (
                <svg {...props}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                </svg>
            );
        case 'dot':
        default:
            return <span className="h-1.5 w-1.5 rounded-full bg-accent" />;
    }
}

export default function TrustPillars({ badges }: TrustPillarsProps) {
    if (!badges || badges.length === 0) return null;

    return (
        <section className="border-t border-border/40 bg-background py-8 sm:py-10">
            <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                    {badges.map((pillar) => (
                        <div
                            key={pillar.id}
                            className="flex items-start gap-3.5 text-right"
                        >
                            <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-secondary/60">
                                <PillarIcon iconKey={pillar.icon_key} />
                            </div>
                            <div>
                                <h3 className="text-xs font-medium tracking-tight text-foreground sm:text-sm">
                                    {pillar.title}
                                </h3>
                                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
                                    {pillar.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}