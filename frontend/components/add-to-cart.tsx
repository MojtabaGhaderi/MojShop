'use client';

import { useMemo, useState } from 'react';
import { useShopCart } from '@/hooks/use-shop-cart';
import { formatPriceWithCurrency } from '@/lib/utils';
import PriceDisplay from './price-display';
import type { Variant } from '@/types';

interface AddToCartProps {
  productId: number;
  productSlug: string;
  productName: string;
  basePrice: number;
  calculatedPrice: number;
  materialWeights: { metal_type: string; weight_grams: number }[];
  images: { id: number; url: string; alt_text: string; is_primary: boolean; sort_order: number }[];
  stockQuantity: number;
  variants: Variant[];
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
  variants,
}: AddToCartProps) {
  const activeVariants = useMemo(() => variants.filter((v) => v.is_active), [variants]);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addItem, isAdding } = useShopCart();

  const selectedVariant = activeVariants.find((v) => v.id === selectedVariantId) ?? null;
  const effectiveStock = selectedVariant ? selectedVariant.stock_quantity : stockQuantity;
  const effectivePrice = calculatedPrice + (selectedVariant?.price_adjustment ?? 0);
  const isOutOfStock = effectiveStock === 0;
  const requiresVariant = activeVariants.length > 0;

  function handleVariantChange(variantId: string) {
    const id = variantId ? Number(variantId) : null;
    setSelectedVariantId(id);
    setQuantity(1); // reset — previous quantity may exceed the new variant's stock
  }

  async function handleAdd() {
    if (requiresVariant && !selectedVariant) return;
    try {
      await addItem(
        { id: productId, name: productName, slug: productSlug, current_price: calculatedPrice, images, stock_quantity: stockQuantity },
        quantity,
        selectedVariant
          ? { id: selectedVariant.id, variant_name: selectedVariant.variant_name, price_adjustment: selectedVariant.price_adjustment, stock_quantity: selectedVariant.stock_quantity }
          : undefined
      );
    } catch {
      // handled by react-query on the auth path
    }
  }

  function decrement() {
    if (quantity > 1) setQuantity(quantity - 1);
  }
  function increment() {
    if (quantity < effectiveStock) setQuantity(quantity + 1);
  }

  return (
    <div className="space-y-4">
      <PriceDisplay basePrice={basePrice} materialWeights={materialWeights} size="lg" />
      {selectedVariant && selectedVariant.price_adjustment !== 0 && (
        <p className="text-sm text-primary-muted">
          قیمت با احتساب {selectedVariant.variant_name}:{' '}
          <span className="font-medium text-primary">{formatPriceWithCurrency(effectivePrice)}</span>
        </p>
      )}

      {activeVariants.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-primary">انتخاب گزینه:</label>
          <select
            value={selectedVariantId ?? ''}
            onChange={(e) => handleVariantChange(e.target.value)}
            className="h-11 w-full rounded-lg border border-border-default bg-surface px-3 text-sm text-primary"
          >
            <option value="">— انتخاب کنید —</option>
            {activeVariants.map((v) => (
              <option key={v.id} value={v.id} disabled={v.stock_quantity === 0}>
                {v.variant_name}
                {v.price_adjustment !== 0 ? ` (${v.price_adjustment > 0 ? '+' : ''}${v.price_adjustment.toLocaleString('fa-IR')})` : ''}
                {v.stock_quantity === 0 ? ' — ناموجود' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {!isOutOfStock && (!requiresVariant || selectedVariant) && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-primary">تعداد:</span>
          <div className="flex items-center rounded-lg border border-border-default">
            <button type="button" onClick={decrement} disabled={quantity <= 1}
              className="flex h-10 w-10 items-center justify-center text-primary transition-colors hover:bg-surface-sunken disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="کاهش تعداد">−</button>
            <span className="flex h-10 w-10 items-center justify-center border-s border-border-default text-sm font-medium">{quantity}</span>
            <button type="button" onClick={increment} disabled={quantity >= effectiveStock}
              className="flex h-10 w-10 items-center justify-center text-primary transition-colors hover:bg-surface-sunken disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="افزایش تعداد">+</button>
          </div>
        </div>
      )}

      {quantity > 1 && (!requiresVariant || selectedVariant) && (
        <p className="text-sm text-primary-muted">
          جمع کل: <span className="font-medium text-primary">{formatPriceWithCurrency(effectivePrice * quantity)}</span>
        </p>
      )}

      {requiresVariant && !selectedVariant ? (
        <div className="h-12 w-full rounded-lg bg-surface-sunken text-center leading-[3rem] text-sm font-medium text-primary-subtle">
          لطفاً یک گزینه انتخاب کنید
        </div>
      ) : isOutOfStock ? (
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

      {effectiveStock > 0 && effectiveStock <= 5 && (!requiresVariant || selectedVariant) && (
        <p className="text-xs text-error">فقط {effectiveStock} عدد باقیمانده!</p>
      )}
    </div>
  );
}