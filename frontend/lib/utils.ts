import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fa-IR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(price));
}

export function formatPriceWithCurrency(price: number): string {
  return `${formatPrice(price)} تومان`;
}

export function getProductImageUrl(
  product_id: number,
  filename: string,
  size: 'thumb' | 'medium' | 'large' = 'thumb'
): string {
  const base = filename.replace(/\.[^.]+$/, '');
  return `/uploads/products/${product_id}/${base}-${size}.jpg`;
}

export function getPrimaryImage(
  images: Array<{ url: string; is_primary?: boolean }> = []
): string | null {
  if (!images || images.length === 0) return null;

  // Helper to identify dummy/placeholder URLs
  const isPlaceholder = (url: string) =>
    url.includes('unsplash.com') ||
    url.includes('placeholder') ||
    url.includes('picsum.photos');

  // 1. Separate real uploaded assets from dummy placeholder links
  const realImages = images.filter((img) => !isPlaceholder(img.url));
  const candidatePool = realImages.length > 0 ? realImages : images;

  // 2. Respect the primary image chosen by the admin within the prioritized pool
  const primary = candidatePool.find((img) => img.is_primary);
  if (primary?.url) return primary.url;

  // 3. Fallback to the first image in the candidate pool
  return candidatePool[0]?.url || null;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
}


