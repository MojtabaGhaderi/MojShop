'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { ProductListItem } from '@/types';
import { BACKEND_URL } from '@/lib/constants';
import { formatPriceWithCurrency, getPrimaryImage } from '@/lib/utils';
import { IMAGE_DIMENSIONS } from '@/types';

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

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-lg border border-border-default bg-card transition-shadow hover:shadow-md"
    >
      {/* Image container */}
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
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-primary-subtle"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/50">
            <span className="rounded bg-surface px-3 py-1 text-sm font-medium text-primary">
              ناموجود
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-primary line-clamp-2 leading-snug">
          {product.name}
        </h3>

        {product.category && (
          <p className="mt-1 text-xs text-primary-subtle">
            {product.category.name}
          </p>
        )}

        <p className="mt-2 text-sm font-bold text-accent">
          {formatPriceWithCurrency(product.current_price)}
        </p>

        {product.materials.length > 0 && (
          <p className="mt-1 text-xs text-primary-subtle">
            {product.materials.map((m) => m.display_name).join(' و ')}
          </p>
        )}
      </div>
    </Link>
  );
}