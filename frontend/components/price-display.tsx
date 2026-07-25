'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatPriceWithCurrency } from '@/lib/utils';
import { PRICE_POLL_INTERVAL, DEFAULT_METAL_RATES } from '@/lib/constants';
import type { MetalRate } from '@/types';

interface PriceDisplayProps {
  basePrice: number;
  materialWeights: { metal_type: string; weight_grams: number }[];
  showLive?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

async function fetchPrices(): Promise<MetalRate[]> {
  try {
    const res = await fetch('/api/prices');
    if (!res.ok) throw new Error();
    const data = await res.json();
    return data.rates ?? DEFAULT_METAL_RATES;
  } catch {
    return DEFAULT_METAL_RATES;
  }
}

export default function PriceDisplay({
  basePrice,
  materialWeights,
  showLive = true,
  size = 'lg',
}: PriceDisplayProps) {
  const { data: serverRates } = useQuery({
    queryKey: ['prices'],
    queryFn: fetchPrices,
    refetchInterval: PRICE_POLL_INTERVAL,
    staleTime: PRICE_POLL_INTERVAL - 5_000,
  });

  const rates = serverRates ?? DEFAULT_METAL_RATES;

  const price = useMemo(() => {
    let total = basePrice;
    for (const mat of materialWeights) {
      const rate = rates.find((r) => r.metal_type === mat.metal_type);
      if (rate) {
        total += mat.weight_grams * rate.rate_per_gram;
      }
    }
    return total;
  }, [basePrice, materialWeights, rates]);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl font-bold',
  };

  return (
    <div className="flex items-center gap-2">
      <span className={sizeClasses[size]}>{formatPriceWithCurrency(price)}</span>
      {showLive && (
        <span className="flex items-center gap-1 text-xs text-primary-subtle" title="قیمت لحظه‌ای بر اساس نرخ روز">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
          زنده
        </span>
      )}
    </div>
  );
}
