'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { ProductListItem } from '@/types';
import { BACKEND_URL } from '@/lib/constants';
import { formatPriceWithCurrency, getPrimaryImage } from '@/lib/utils';
import { IMAGE_DIMENSIONS } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { useWishlist } from '@/hooks/use-wishlist';
import { useShopCart } from '@/hooks/use-shop-cart';

interface ProductCardProps {
  product: ProductListItem;
}

export default function ProductCard({ product }: ProductCardProps) {
  const rawImage = getPrimaryImage(product.images);
  const primaryImage = rawImage
    ? (rawImage.startsWith('http://') || rawImage.startsWith('https://') ? rawImage : `${BACKEND_URL}${rawImage}`)
    : null;
  const isOutOfStock = product.stock_quantity === 0;
  const hasVariants = product.variants.length > 0;

  const { isAuthenticated } = useAuth();
  const wishlist = useWishlist();
  const inWishlist = wishlist.isInWishlist(product.id);
  const cart = useShopCart();

  function handleWishlistClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated || wishlist.isPending) return;
    inWishlist ? wishlist.remove(product.id) : wishlist.add(product.id);
  }

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || hasVariants) return;
    cart.addItem(
      {
        id: product.id, name: product.name, slug: product.slug, current_price: product.current_price, images: product.images,
        stock_quantity: 0
      },
      1
    );
  }

  return (
    <Link href={`/products/${product.slug}`} className="group block overflow-hidden rounded-md bg-surface-elevated">
      <div className="relative aspect-[3/4] overflow-hidden bg-surface-sunken">
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
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary-subtle">
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
            className="absolute end-2 top-2 flex h-7 w-7 items-center justify-center text-primary/70 transition-colors hover:text-primary"
            aria-label={inWishlist ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" className={inWishlist ? 'text-error' : ''}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/40">
            <span className="rounded bg-surface px-3 py-1 text-xs font-medium text-primary">ناموجود</span>
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="text-sm leading-snug text-primary line-clamp-2">{product.name}</h3>
        {product.category && <p className="mt-1 text-xs text-primary-subtle">{product.category.name}</p>}

        {product.review_count > 0 && (
          <div className="mt-1 flex items-center gap-1 text-xs text-primary-subtle">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="text-accent">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" />
            </svg>
            <span>{product.average_rating.toFixed(1)} ({product.review_count})</span>
          </div>
        )}

        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-accent">{formatPriceWithCurrency(product.current_price)}</p>
          {!isOutOfStock && (
            hasVariants ? (
              <span className="text-xs text-primary-muted">مشاهده</span>
            ) : (
              <button
                type="button"
                onClick={handleQuickAdd}
                disabled={cart.isAdding}
                className="rounded bg-primary px-2.5 py-1 text-xs text-surface transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                افزودن
              </button>
            )
          )}
        </div>

        {product.materials.length > 0 && (
          <p className="mt-1 text-xs text-primary-subtle">{product.materials.map((m) => m.display_name).join(' و ')}</p>
        )}
      </div>
    </Link>
  );
}