// frontend/components/add-to-cart.tsx
'use client';

import * as React from 'react';
import { useShopCart } from '@/hooks/use-shop-cart';
import { formatPriceWithCurrency, cn } from '@/lib/utils';
import PriceDisplay from './price-display';
import NotifyMeForm from './notify-me-form';
import type { Variant } from '@/types';

interface AddToCartProps {
  productId: number;
  productSlug: string;
  productName: string;
  calculatedPrice: number;
  images: { id: number; url: string; alt_text: string; is_primary: boolean; sort_order: number }[];
  stockQuantity: number;
  variants: Variant[];
}

export default function AddToCart({
  productId,
  productSlug,
  productName,
  calculatedPrice,
  images,
  stockQuantity,
  variants,
}: AddToCartProps) {
  const activeVariants = React.useMemo(() => variants.filter((v) => v.is_active), [variants]);

  // Default to first available in-stock variant
  const [selectedVariantId, setSelectedVariantId] = React.useState<number | null>(() => {
    if (activeVariants.length === 0) return null;
    const firstInStock = activeVariants.find((v) => v.stock_quantity > 0);
    return firstInStock ? firstInStock.id : activeVariants[0].id;
  });

  const [quantity, setQuantity] = React.useState(1);
  const { addItem, isAdding } = useShopCart();

  const selectedVariant = activeVariants.find((v) => v.id === selectedVariantId) ?? null;
  const effectiveStock = selectedVariant ? selectedVariant.stock_quantity : stockQuantity;
  const currentDisplayedPrice = calculatedPrice + (selectedVariant?.price_adjustment ?? 0);

  const isOutOfStock = effectiveStock === 0;
  const requiresVariant = activeVariants.length > 0;
  const allOutOfStock = requiresVariant
    ? activeVariants.every((v) => v.stock_quantity === 0)
    : stockQuantity === 0;

  function handleSelectVariant(id: number, stock: number) {
    if (stock === 0) return;
    setSelectedVariantId(id);
    setQuantity(1);
  }

  async function handleAdd() {
    if (requiresVariant && !selectedVariant) return;
    try {
      await addItem(
        {
          id: productId,
          name: productName,
          slug: productSlug,
          current_price: calculatedPrice,
          images,
          stock_quantity: stockQuantity,
        },
        quantity,
        selectedVariant
          ? {
            id: selectedVariant.id,
            variant_name: selectedVariant.variant_name,
            price_adjustment: selectedVariant.price_adjustment,
            stock_quantity: selectedVariant.stock_quantity,
          }
          : undefined
      );
    } catch {
      // Handled by react-query
    }
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-accent/40 bg-accent/15 p-6 shadow-[0_8px_32px_0_rgba(116,186,222,0.12)] backdrop-blur-2xl backdrop-saturate-150 transition-all duration-300 select-none"
      dir="rtl"
    >
      {/* ── Rotating Specular Conic Light Beam ── */}
      <div
        className="pointer-events-none absolute -inset-full animate-[spin_12s_linear_infinite] opacity-35 blur-2xl"
        style={{
          background:
            'conic-gradient(from 0deg at 50% 50%, transparent 0deg, var(--color-accent) 60deg, transparent 120deg)',
        }}
      />

      {/* Ambient Blue Reflections */}
      <div className="pointer-events-none absolute -end-12 -top-12 h-36 w-36 rounded-full bg-accent/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -start-10 h-32 w-32 rounded-full bg-accent/15 blur-2xl" />

      {/* ── Interactive Controls ── */}
      <div className="relative z-10 space-y-6">
        {/* Valuation & Live Spot Price */}
        <div className="border-b border-accent/25 pb-5">
          <div className="flex items-center justify-between pb-1.5">
            <span className="text-[11px] font-medium tracking-wide text-foreground/75">
              ارزش نهایی اثر:
            </span>
            {effectiveStock > 0 && effectiveStock <= 4 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-800 backdrop-blur-md">
                <span className="h-1 w-1 rounded-full bg-amber-500 animate-pulse" />
                تنها {effectiveStock.toLocaleString('fa-IR')} عدد موجود در گالری
              </span>
            )}
          </div>

          <div className="mt-1">
            <PriceDisplay price={currentDisplayedPrice} size="lg" isLive />
          </div>
        </div>

        {/* Variant Selection Chips */}
        {activeVariants.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">انتخاب اندازه / تنوع:</span>
              {selectedVariant && (
                <span className="text-[11px] font-medium text-primary">
                  {selectedVariant.variant_name}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {activeVariants.map((v) => {
                const isSelected = v.id === selectedVariantId;
                const disabled = v.stock_quantity === 0;
                return (
                  <button
                    key={v.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleSelectVariant(v.id, v.stock_quantity)}
                    className={cn(
                      'relative min-w-[56px] rounded-xl border px-3.5 py-2 text-xs font-medium transition-all duration-200 cursor-pointer shadow-2xs backdrop-blur-md',
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/25 scale-[1.02]'
                        : 'border-accent/40 bg-white/50 text-foreground hover:border-primary/50 hover:bg-white/80',
                      disabled &&
                      'cursor-not-allowed border-border/30 bg-muted/20 text-muted-foreground opacity-40 line-through'
                    )}
                  >
                    <span>{v.variant_name}</span>
                    {v.price_adjustment !== 0 && !disabled && (
                      <span
                        className={cn(
                          'block text-[9px] font-mono mt-0.5',
                          isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                        )}
                      >
                        {v.price_adjustment > 0 ? '+' : ''}
                        {v.price_adjustment.toLocaleString('fa-IR')}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quantity Stepper & Add to Cart */}
        <div className="pt-1">
          {requiresVariant && !selectedVariant ? (
            <div className="flex h-12 w-full items-center justify-center rounded-xl border border-dashed border-accent/40 bg-white/40 text-xs font-medium text-foreground/70">
              لطفاً یکی از گزینه‌های بالا را انتخاب فرمایید
            </div>
          ) : isOutOfStock ? (
            allOutOfStock ? (
              <NotifyMeForm productSlug={productSlug} />
            ) : (
              <div className="flex h-12 w-full items-center justify-center rounded-xl bg-white/40 text-xs font-medium text-foreground/70">
                این اندازه در حال حاضر موجود نیست
              </div>
            )
          ) : (
            <div className="flex items-center gap-3">
              {/* Stepper */}
              <div className="flex h-12 shrink-0 items-center rounded-xl border border-accent/40 bg-white/70 p-1 shadow-2xs backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                  disabled={quantity <= 1}
                  className="flex h-10 w-9 cursor-pointer items-center justify-center rounded-lg text-sm text-foreground transition-colors hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="کاهش تعداد"
                >
                  −
                </button>
                <span className="flex w-8 items-center justify-center font-mono text-xs font-semibold text-foreground">
                  {quantity.toLocaleString('fa-IR')}
                </span>
                <button
                  type="button"
                  onClick={() => quantity < effectiveStock && setQuantity(quantity + 1)}
                  disabled={quantity >= effectiveStock}
                  className="flex h-10 w-9 cursor-pointer items-center justify-center rounded-lg text-sm text-foreground transition-colors hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="افزایش تعداد"
                >
                  +
                </button>
              </div>

              {/* Primary Cart CTA */}
              <button
                type="button"
                onClick={handleAdd}
                disabled={isAdding}
                className="flex h-12 flex-1 cursor-pointer items-center justify-between rounded-xl bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-[0_4px_16px_rgba(23,59,87,0.22)] transition-all hover:bg-primary/95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>{isAdding ? 'در حال افزودن...' : 'افزودن به سبد خرید'}</span>
                <span className="font-mono text-[11px] font-normal text-primary-foreground/90">
                  {formatPriceWithCurrency(currentDisplayedPrice * quantity)}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}