import type { MetalRate, MetalType } from '@/types';

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export const METAL_RATES: Record<MetalType, { rate_per_gram: number; label: string }> = {
  gold: { rate_per_gram: 85.5, label: 'طلا' },
  silver: { rate_per_gram: 1.2, label: 'نقره' },
  platinum: { rate_per_gram: 45.0, label: 'پلاتین' },
  palladium: { rate_per_gram: 35.0, label: 'پالادیوم' },
};

export const DEFAULT_METAL_RATES: MetalRate[] = Object.entries(METAL_RATES).map(
  ([metal_type, val]) => ({
    metal_type: metal_type as MetalType,
    rate_per_gram: val.rate_per_gram,
    label: val.label,
  })
);

export const PRODUCTS_PAGE_SIZE = 12;

export const PRICE_POLL_INTERVAL = 30_000;

export const SITE_NAME = 'موج گالری';
export const SITE_DESCRIPTION = 'فروشگاه آنلاین جواهرات و اکسسوری — موج گالری';

export const NAV_LINKS = [
  { href: '/', label: 'صفحه اصلی' },
  { href: '/products', label: 'محصولات' },
] as const;
