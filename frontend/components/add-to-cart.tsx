'use client';

import { useState } from 'react';
import { useShopCart } from '@/hooks/use-shop-cart';
import { formatPriceWithCurrency } from '@/lib/utils';
import PriceDisplay from './price-display';
import type { ProductImage } from '@/types';

interface AddToCartProps {
  productId: number;
  productSlug: string;               // NEW — required
  productName: string;
  basePrice: number;
  calculatedPrice: number;
  materialWeights: { metal_type: string; weight_grams: number }[];
  images: ProductImage[];            // NEW — required
  stockQuantity: number;
}

export default function AddToCart({
  productId,
  productSlug,
  productName,
  basePrice,
  calculatedPrice,
  materialWeights,
  images,
  stockQuantity,
}: AddToCartProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem, isAdding } = useShopCart();
  const isOutOfStock = stockQuantity === 0;

  async function handleAdd() {
    try {
      await addItem(
        { id: productId, name: productName, slug: productSlug, current_price: calculatedPrice, images, stock_quantity: stockQuantity },
        quantity
      );
    } catch {
      // Error is handled by react-query on the auth path; could show a toast here
    }
  }

  function decrement() {
    if (quantity > 1) setQuantity(quantity - 1);
  }
  function increment() {
    if (quantity < stockQuantity) setQuantity(quantity + 1);
  }

  return (
    <div className="space-y-4">
      <PriceDisplay basePrice={basePrice} materialWeights={materialWeights} size="lg" />

      {!isOutOfStock && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-primary">تعداد:</span>
          <div className="flex items-center rounded-lg border border-border-default">
            <button type="button" onClick={decrement} disabled={quantity <= 1}
              className="flex h-10 w-10 items-center justify-center text-primary transition-colors hover:bg-surface-sunken disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="کاهش تعداد">−</button>
            <span className="flex h-10 w-10 items-center justify-center border-s border-border-default text-sm font-medium">{quantity}</span>
            <button type="button" onClick={increment} disabled={quantity >= stockQuantity}
              className="flex h-10 w-10 items-center justify-center text-primary transition-colors hover:bg-surface-sunken disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="افزایش تعداد">+</button>
          </div>
        </div>
      )}

      {quantity > 1 && (
        <p className="text-sm text-primary-muted">
          جمع کل: <span className="font-medium text-primary">{formatPriceWithCurrency(calculatedPrice * quantity)}</span>
        </p>
      )}

      {isOutOfStock ? (
        <div className="h-12 w-full rounded-lg bg-surface-sunken text-center leading-[3rem] text-sm font-medium text-primary-subtle">ناموجود</div>
      ) : (
        <button type="button" onClick={handleAdd} disabled={isAdding}
          className="h-12 w-full rounded-lg bg-accent text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed">
          {isAdding ? 'در حال افزودن...' : 'افزودن به سبد خرید'}
        </button>
      )}

      {stockQuantity > 0 && stockQuantity <= 5 && (
        <p className="text-xs text-error">فقط {stockQuantity} عدد باقیمانده!</p>
      )}
    </div>
  );
}