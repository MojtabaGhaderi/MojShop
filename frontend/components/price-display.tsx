// frontend/components/price-display.tsx
'use client';

import * as React from 'react';
import { formatPriceWithCurrency } from '@/lib/utils';

interface PriceDisplayProps {
  price: number;
  isLive?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function PriceDisplay({
  price,
  isLive = true,
  size = 'lg',
}: PriceDisplayProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 select-none" dir="rtl">
      {/* Big Single Dynamic Price */}
      <span
        className={`font-bold tracking-tight text-foreground font-sans transition-all duration-200 ${size === 'lg' ? 'text-2xl sm:text-3xl' : size === 'md' ? 'text-xl' : 'text-base'
          }`}
      >
        {formatPriceWithCurrency(price)}
      </span>

      {/* Pulsing Live Spot Price Indicator */}
      {isLive && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-800 backdrop-blur-md dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          بر اساس قیمت لحظه‌ای
        </span>
      )}
    </div>
  );
}