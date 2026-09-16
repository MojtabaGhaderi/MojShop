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
  const hasVariants = Boolean(product.variants?.length);

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
    <Link href={`/products/${product.slug}`} className="group block">
      {/* Immersive Image Container - Strict 4/5 aspect ratio, zero padding cards */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-secondary">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={product.images.find((i) => i.is_primary)?.alt_text ?? product.name}
            width={IMAGE_DIMENSIONS.thumb.width}
            height={IMAGE_DIMENSIONS.thumb.height}
            unoptimized
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/30">
            —
          </div>
        )}

        {/* Wishlist Button - Absolute minimalist placement */}
        {isAuthenticated && (
          <button
            type="button"
            onClick={handleWishlistClick}
            className="absolute end-3 top-3 flex h-8 w-8 items-center justify-center text-foreground/75 transition-colors hover:text-foreground"
            aria-label={inWishlist ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" className={inWishlist ? 'text-destructive' : ''}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/40 backdrop-blur-[2px]">
            <span className="rounded-none bg-background px-3 py-1 text-xs font-medium tracking-widest text-foreground">ناموجود</span>
          </div>
        )}
      </div>

      {/* Typography block sitting cleanly on the canvas below the image */}
      <div className="mt-4 flex flex-col gap-1">
        {product.category && (
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {product.category.name}
          </span>
        )}

        <h3 className="text-sm font-light leading-snug text-foreground line-clamp-1 transition-colors group-hover:text-accent">
          {product.name}
        </h3>

        <div className="mt-1 flex items-center justify-between">
          <p className="text-sm font-medium tracking-tight text-foreground">
            {formatPriceWithCurrency(product.current_price)}
          </p>

          {/* Minimal Quick Action */}
          {!isOutOfStock && (
            hasVariants ? (
              <span className="text-xs text-muted-foreground transition-colors group-hover:text-accent">مشاهده</span>
            ) : (
              <button
                type="button"
                onClick={handleQuickAdd}
                disabled={cart.isAdding}
                className="text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-accent hover:underline disabled:opacity-50"
              >
                افزودن سریع
              </button>
            )
          )}
        </div>
      </div>
    </Link>
  );
}