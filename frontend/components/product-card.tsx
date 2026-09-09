'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { ProductListItem } from '@/types';
import { BACKEND_URL } from '@/lib/constants';
import { formatPriceWithCurrency, getPrimaryImage } from '@/lib/utils';
import { IMAGE_DIMENSIONS } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { useWishlist } from '@/hooks/use-wishlist';

interface ProductCardProps {
  product: ProductListItem;
}

export default function ProductCard({ product }: ProductCardProps) {
  const rawImage = getPrimaryImage(product.images);
  const primaryImage = rawImage
    ? (rawImage.startsWith('http://') || rawImage.startsWith('https://')
      ? rawImage
      : `${BACKEND_URL}${rawImage}`)
    : null;
  const isOutOfStock = product.stock_quantity === 0;

  const { isAuthenticated } = useAuth();
  const wishlist = useWishlist();
  const inWishlist = wishlist.isInWishlist(product.id);

  function handleWishlistClick(e: React.MouseEvent) {
    e.preventDefault();   // don't navigate the enclosing <Link>
    e.stopPropagation();
    if (!isAuthenticated || wishlist.isPending) return;
    if (inWishlist) {
      wishlist.remove(product.id);
    } else {
      wishlist.add(product.id);
    }
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-lg border border-border-default bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-surface-elevated">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={product.images.find((i) => i.is_primary)?.alt_text ?? product.name}
            width={IMAGE_DIMENSIONS.thumb.width}
            height={IMAGE_DIMENSIONS.thumb.height}
            unoptimized
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary-subtle">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}

        {isAuthenticated && (
          <button
            type="button"
            onClick={handleWishlistClick}
            className="absolute end-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-surface/90 text-primary shadow-sm backdrop-blur-sm transition-colors hover:bg-surface"
            aria-label={inWishlist ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className={inWishlist ? 'text-red-500' : 'text-primary'}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/50">
            <span className="rounded bg-surface px-3 py-1 text-sm font-medium text-primary">ناموجود</span>
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="text-sm font-medium text-primary line-clamp-2 leading-snug">{product.name}</h3>
        {product.category && <p className="mt-1 text-xs text-primary-subtle">{product.category.name}</p>}

        {product.review_count > 0 && (
          <div className="mt-1 flex items-center gap-1 text-xs text-primary-subtle">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-500">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" />
            </svg>
            <span>{product.average_rating.toFixed(1)} ({product.review_count})</span>
          </div>
        )}

        <p className="mt-2 text-sm font-bold text-accent">{formatPriceWithCurrency(product.current_price)}</p>
        {product.materials.length > 0 && (
          <p className="mt-1 text-xs text-primary-subtle">{product.materials.map((m) => m.display_name).join(' و ')}</p>
        )}
      </div>
    </Link>
  );
}