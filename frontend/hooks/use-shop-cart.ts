'use client';

import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import { useGuestCart, type GuestCartItem } from '@/hooks/use-guest-cart';
import type { ShopCartItem } from '@/types';

export function useShopCart() {
    const { isAuthenticated } = useAuth();
    const authCart = useCart();
    const guestCart = useGuestCart();

    if (isAuthenticated) {
        const items: ShopCartItem[] = authCart.items.map((c) => ({
            id: c.id,
            product_id: c.product.id,
            variant_id: c.variant?.id ?? null,
            quantity: c.quantity,
            product: c.product,
            unitPrice: c.unit_price,
        }));
        return {
            items,
            itemCount: authCart.itemCount,
            total: items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
            isLoading: authCart.isLoading,
            isAdding: authCart.isAdding,
            addItem: (product: GuestCartItem['product'], quantity: number, variant?: GuestCartItem['variant']) =>
                authCart.addItem({ product_id: product.id, variant_id: variant?.id, quantity }),
            updateItem: (id: number | string, quantity: number) => authCart.updateItem({ id: id as number, quantity }),
            removeItem: (id: number | string) => authCart.removeItem(id as number),
            clearCart: () => authCart.clearCart(),
            isGuest: false as const,
        };
    }

    const items: ShopCartItem[] = guestCart.items.map((c) => ({
        id: c.id,
        product_id: c.product_id,
        variant_id: c.variant_id,
        quantity: c.quantity,
        product: c.product,
        unitPrice: c.product.current_price + (c.variant?.price_adjustment ?? 0),
    }));

    return {
        items,
        itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
        total: items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
        isLoading: false,
        isAdding: false,
        addItem: guestCart.addItem,
        updateItem: guestCart.updateItem,
        removeItem: guestCart.removeItem,
        clearCart: guestCart.clearCart,
        isGuest: true as const,
    };
}