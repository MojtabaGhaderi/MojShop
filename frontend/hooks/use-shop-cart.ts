'use client';

import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import { useGuestCart, type GuestCartItem } from '@/hooks/use-guest-cart';
import type { ShopCartItem } from '@/types';

interface ShopCart {
    items: ShopCartItem[];
    itemCount: number;
    total: number;
    isLoading: boolean;
    isAdding: boolean;

    addItem: (
        product: GuestCartItem['product'],
        quantity: number,
        variant?: GuestCartItem['variant']
    ) => Promise<unknown> | void;

    updateItem: (
        id: string | number,
        quantity: number
    ) => Promise<unknown> | void;

    removeItem: (
        id: string | number
    ) => Promise<unknown> | void;

    clearCart: () => Promise<unknown> | void;

    isGuest: boolean;
}

export function useShopCart(): ShopCart {
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

            total: items.reduce(
                (sum, item) => sum + item.unitPrice * item.quantity,
                0
            ),

            isLoading: authCart.isLoading,
            isAdding: authCart.isAdding,

            addItem: (product, quantity, variant) =>
                authCart.addItem({
                    product_id: product.id,
                    variant_id: variant?.id,
                    quantity,
                }),

            updateItem: (id, quantity) =>
                authCart.updateItem({
                    id: Number(id),
                    quantity,
                }),

            removeItem: (id) =>
                authCart.removeItem(Number(id)),

            clearCart: authCart.clearCart,

            isGuest: false,
        };
    }

    const items: ShopCartItem[] = guestCart.items.map((c) => ({
        id: c.id,
        product_id: c.product_id,
        variant_id: c.variant_id,
        quantity: c.quantity,
        product: c.product,
        unitPrice:
            c.product.current_price +
            (c.variant?.price_adjustment ?? 0),
    }));

    return {
        items,

        itemCount: items.reduce(
            (sum, item) => sum + item.quantity,
            0
        ),

        total: items.reduce(
            (sum, item) => sum + item.unitPrice * item.quantity,
            0
        ),

        isLoading: false,
        isAdding: false,

        addItem: guestCart.addItem,

        updateItem: (id, quantity) =>
            guestCart.updateItem(String(id), quantity),

        removeItem: (id) =>
            guestCart.removeItem(String(id)),

        clearCart: guestCart.clearCart,

        isGuest: true,
    };
}