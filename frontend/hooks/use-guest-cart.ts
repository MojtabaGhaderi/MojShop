'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Product } from '@/types';

const STORAGE_KEY = 'guest_cart';

export interface GuestCartItem {
    id: string;
    product_id: number;
    variant_id: number | null;
    quantity: number;
    product: Pick<Product, 'id' | 'name' | 'slug' | 'current_price' | 'images' | 'stock_quantity'>;
    variant: { id: number; variant_name: string; price_adjustment: number; stock_quantity: number } | null;  // NEW
}

function readCart(): GuestCartItem[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function writeCart(items: GuestCartItem[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('guest-cart-updated'));
}

export function useGuestCart() {
    const [items, setItems] = useState<GuestCartItem[]>([]);

    useEffect(() => {
        setItems(readCart());
        const handler = () => setItems(readCart());
        window.addEventListener('guest-cart-updated', handler);
        window.addEventListener('storage', handler); // keeps tabs in sync
        return () => {
            window.removeEventListener('guest-cart-updated', handler);
            window.removeEventListener('storage', handler);
        };
    }, []);

    const addItem = useCallback((
        product: GuestCartItem['product'],
        quantity: number,
        variant: GuestCartItem['variant'] = null
    ) => {
        const current = readCart();
        const existing = current.find((c) => c.product_id === product.id && c.variant_id === (variant?.id ?? null));
        const next = existing
            ? current.map((c) => (c.id === existing.id ? { ...c, quantity: c.quantity + quantity } : c))
            : [...current, { id: crypto.randomUUID(), product_id: product.id, variant_id: variant?.id ?? null, quantity, product, variant }];
        writeCart(next);
    }, []);
    // updateItem / removeItem — now key off the synthetic id, not product_id
    const updateItem = useCallback((id: string, quantity: number) => {
        writeCart(readCart().map((c) => (c.id === id ? { ...c, quantity } : c)));
    }, []);

    const removeItem = useCallback((id: string) => {
        writeCart(readCart().filter((c) => c.id !== id));
    }, []);

    const clearCart = useCallback(() => writeCart([]), []);

    return {
        items,
        itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
        total: items.reduce((sum, i) => sum + i.product.current_price * i.quantity, 0),
        addItem,
        updateItem,
        removeItem,
        clearCart,
    };
}