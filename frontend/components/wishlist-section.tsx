'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useWishlist } from '@/hooks/use-wishlist';
import { formatPriceWithCurrency, getPrimaryImage } from '@/lib/utils';
import { IMAGE_DIMENSIONS } from '@/types';

export default function WishlistSection() {
    const { items, isLoading, remove } = useWishlist();

    if (isLoading) {
        return <div className="mt-4 h-20 animate-pulse rounded-lg bg-surface-elevated" />;
    }

    if (items.length === 0) {
        return <p className="mt-4 text-sm text-primary-muted">هنوز محصولی به علاقه‌مندی‌ها اضافه نکرده‌اید.</p>;
    }

    return (
        <ul className="mt-4 space-y-3">
            {items.map((item) => {
                const img = getPrimaryImage(item.product.images);
                return (
                    <li key={item.id} className="flex items-center gap-3 rounded-lg border border-border-default p-3">
                        <Link href={`/products/${item.product.slug}`} className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-surface-elevated">
                            {img && (
                                <Image src={img} alt={item.product.name} width={IMAGE_DIMENSIONS.thumb.width} height={IMAGE_DIMENSIONS.thumb.height} unoptimized className="h-full w-full object-cover" />
                            )}
                        </Link>
                        <div className="min-w-0 flex-1">
                            <Link href={`/products/${item.product.slug}`} className="text-sm font-medium text-primary hover:text-accent">
                                {item.product.name}
                            </Link>
                            <p className="mt-1 text-sm text-primary-muted">{formatPriceWithCurrency(item.product.current_price)}</p>
                        </div>
                        <button type="button" onClick={() => remove(item.product.id)} className="text-xs text-red-500 hover:underline shrink-0">
                            حذف
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}