'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus } from 'lucide-react';
import { useCreateVariant, useUpdateVariant, useDeleteVariant } from '@/hooks/use-admin-variants';
import type { Variant } from '@/types';

function VariantRow({ variant, onDelete }: { variant: Variant; onDelete: (id: number) => void }) {
    const updateVariant = useUpdateVariant();
    const [name, setName] = useState(variant.variant_name);
    const [adjustment, setAdjustment] = useState(String(variant.price_adjustment));
    const [stock, setStock] = useState(String(variant.stock_quantity));
    const [isActive, setIsActive] = useState(variant.is_active);   // NEW

    function commit(field: 'variant_name' | 'price_adjustment' | 'stock_quantity', value: string | number) {
        updateVariant.mutate({ variantId: variant.id, payload: { [field]: value } });
    }

    function handleActiveChange(checked: boolean) {
        setIsActive(checked);                                          // NEW — flips immediately, doesn't wait on the server
        updateVariant.mutate({ variantId: variant.id, payload: { is_active: checked } });
    }

    return (
        <div className="flex items-center gap-2 rounded-md border p-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} onBlur={() => name !== variant.variant_name && commit('variant_name', name)} className="h-8 flex-1 text-sm" />
            <Input type="number" value={adjustment} onChange={(e) => setAdjustment(e.target.value)} onBlur={() => Number(adjustment) !== variant.price_adjustment && commit('price_adjustment', Number(adjustment))} className="h-8 w-24 text-sm" placeholder="تعدیل قیمت" />
            <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} onBlur={() => Number(stock) !== variant.stock_quantity && commit('stock_quantity', Number(stock))} className="h-8 w-20 text-sm" placeholder="موجودی" />
            <Switch checked={isActive} onCheckedChange={handleActiveChange} />   {/* was: checked={variant.is_active}, onCheckedChange calling mutate directly */}
            <Button type="button" variant="ghost" size="icon" onClick={() => onDelete(variant.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
        </div>
    );
}

export function VariantManager({ productId, variants }: { productId: number; variants: Variant[] }) {
    const createVariant = useCreateVariant();
    const deleteVariant = useDeleteVariant();

    const [newName, setNewName] = useState('');
    const [newSku, setNewSku] = useState('');
    const [newAdjustment, setNewAdjustment] = useState('0');
    const [newStock, setNewStock] = useState('0');

    async function handleCreate() {
        if (!newName.trim()) return;
        await createVariant.mutateAsync({
            productId,
            payload: {
                variant_name: newName.trim(),
                sku: newSku.trim() || undefined,
                price_adjustment: Number(newAdjustment),
                stock_quantity: Number(newStock),
            },
        });
        setNewName(''); setNewSku(''); setNewAdjustment('0'); setNewStock('0');
    }

    return (
        <div className="space-y-3">
            {variants.length > 0 && (
                <div className="space-y-2">
                    {variants.map((v) => (
                        <VariantRow key={v.id} variant={v} onDelete={(id) => deleteVariant.mutate(id)} />
                    ))}
                </div>
            )}

            <div className="flex items-end gap-2 rounded-md border border-dashed p-2">
                <div className="flex-1 space-y-1">
                    <Label className="text-xs">نام گزینه (مثال: سایز 7)</Label>
                    <Input value={newName} onChange={(e) => setNewName(e.target.value)} className="h-8 text-sm" />
                </div>
                <div className="w-24 space-y-1">
                    <Label className="text-xs">تعدیل قیمت</Label>
                    <Input type="number" value={newAdjustment} onChange={(e) => setNewAdjustment(e.target.value)} className="h-8 text-sm" />
                </div>
                <div className="w-20 space-y-1">
                    <Label className="text-xs">موجودی</Label>
                    <Input type="number" value={newStock} onChange={(e) => setNewStock(e.target.value)} className="h-8 text-sm" />
                </div>
                <Button type="button" size="sm" onClick={handleCreate} disabled={createVariant.isPending || !newName.trim()}>
                    <Plus className="h-3 w-3" />
                </Button>
            </div>
        </div>
    );
}