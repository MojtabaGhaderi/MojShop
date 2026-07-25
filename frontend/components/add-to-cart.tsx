'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/use-cart';
import { formatPriceWithCurrency } from '@/lib/utils';
import PriceDisplay from './price-display';

interface AddToCartProps {
  productId: number;
  productName: string;
  basePrice: number;
  calculatedPrice: number;
  materialWeights: { metal_type: string; weight_grams: number }[];
  stockQuantity: number;
}

export default function AddToCart({
  productId,
  productName,
  basePrice,
  calculatedPrice,
  materialWeights,
  stockQuantity,
}: AddToCartProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem, isAdding } = useCart();
  const isOutOfStock = stockQuantity === 0;

  async function handleAdd() {
    try {
      await addItem({ product_id: productId, quantity });
    } catch {
      // Error is handled by react-query; could show toast here
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
      {/* Price */}
      <PriceDisplay
        basePrice={basePrice}
        materialWeights={materialWeights}
        size="lg"
      />

      {/* Quantity selector */}
      {!isOutOfStock && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-primary">تعداد:</span>
          <div className="flex items-center rounded-lg border border-border-default">
            <button
              type="button"
              onClick={decrement}
              disabled={quantity <= 1}
              className="flex h-10 w-10 items-center justify-center text-primary transition-colors hover:bg-surface-sunken disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="کاهش تعداد"
            >
              −
            </button>
            <span className="flex h-10 w-10 items-center justify-center border-s border-border-default text-sm font-medium">
              {quantity}
            </span>
            <button
              type="button"
              onClick={increment}
              disabled={quantity >= stockQuantity}
              className="flex h-10 w-10 items-center justify-center text-primary transition-colors hover:bg-surface-sunken disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="افزایش تعداد"
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Total for selected quantity */}
      {quantity > 1 && (
        <p className="text-sm text-primary-muted">
          جمع کل: <span className="font-medium text-primary">{formatPriceWithCurrency(calculatedPrice * quantity)}</span>
        </p>
      )}

      {/* Add to cart button */}
      {isOutOfStock ? (
        <div className="h-12 w-full rounded-lg bg-surface-sunken text-center leading-[3rem] text-sm font-medium text-primary-subtle">
          ناموجود
        </div>
      ) : (
        <button
          type="button"
          onClick={handleAdd}
          disabled={isAdding}
          className="h-12 w-full rounded-lg bg-accent text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isAdding ? 'در حال افزودن...' : 'افزودن به سبد خرید'}
        </button>
      )}

      {/* Stock info */}
      {stockQuantity > 0 && stockQuantity <= 5 && (
        <p className="text-xs text-error">فقط {stockQuantity} عدد باقیمانده!</p>
      )}
    </div>
  );
}
