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

export function getPrimaryImage(images: { is_primary: boolean; url: string }[]): string | null {
  const primary = images.find((img) => img.is_primary);
  return primary ? primary.url : (images[0]?.url ?? null);
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
