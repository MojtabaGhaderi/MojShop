// frontend/components/admin/product-form-sheet.tsx
'use client';

import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';
import { useCreateProduct, useUpdateProduct } from '@/hooks/use-admin-products';
import { ProductImageUploader } from '@/components/admin/product-image-uploader';
import type { Category, MetalType, Product, ProductMaterialInput } from '@/types';
import { VariantManager } from '@/components/admin/variant-manager';

const METAL_TYPES: { value: MetalType; label: string }[] = [
    { value: 'gold', label: 'طلا' },
    { value: 'silver', label: 'نقره' },
    { value: 'platinum', label: 'پلاتین' },
    { value: 'palladium', label: 'پالادیوم' },
];

function slugify(name: string) {
    return name.trim().toLowerCase().replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '').replace(/\s+/g, '-');
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product | null;
    categories: Category[];
}

export function ProductFormSheet({ open, onOpenChange, product, categories }: Props) {
    const isEditing = !!product;
    const createProduct = useCreateProduct();
    const updateProduct = useUpdateProduct();

    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [slugTouched, setSlugTouched] = useState(false);
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [basePrice, setBasePrice] = useState('0');
    const [weight, setWeight] = useState('0');
    const [stock, setStock] = useState('0');
    const [isActive, setIsActive] = useState(true);
    const [materials, setMaterials] = useState<ProductMaterialInput[]>([]);
    const [createdProductId, setCreatedProductId] = useState<number | null>(null);

    useEffect(() => {
        if (!open) return;
        if (product) {
            setName(product.name);
            setSlug(product.slug);
            setSlugTouched(true);
            setDescription(product.description ?? '');
            setCategoryId(product.category ? String(product.category.id) : '');
            setBasePrice(String(product.base_price));
            setWeight(String(product.total_weight_grams));
            setStock(String(product.stock_quantity));
            setIsActive(product.is_active);
            setMaterials(product.materials.map((m) => ({ metal_type: m.metal_type, weight_grams: m.weight_grams, display_name: m.display_name })));
            setCreatedProductId(null);
        } else {
            setName(''); setSlug(''); setSlugTouched(false); setDescription('');
            setCategoryId(''); setBasePrice('0'); setWeight('0'); setStock('0');
            setIsActive(true); setMaterials([]); setCreatedProductId(null);
        }
    }, [open, product]);

    function handleNameChange(value: string) {
        setName(value);
        if (!slugTouched) setSlug(slugify(value));
    }

    function addMaterial() {
        setMaterials((m) => [...m, { metal_type: 'gold', weight_grams: 0, display_name: '' }]);
    }
    function updateMaterial(index: number, patch: Partial<ProductMaterialInput>) {
        setMaterials((m) => m.map((mat, i) => (i === index ? { ...mat, ...patch } : mat)));
    }
    function removeMaterial(index: number) {
        setMaterials((m) => m.filter((_, i) => i !== index));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const payload = {
            name, slug,
            description: description || undefined,
            category_id: categoryId ? Number(categoryId) : undefined,
            base_price: Number(basePrice),
            total_weight_grams: Number(weight),
            stock_quantity: Number(stock),
            is_active: isActive,
            materials,
        };

        if (isEditing && product) {
            await updateProduct.mutateAsync({ id: product.id, payload });
            onOpenChange(false);
        } else {
            const created = await createProduct.mutateAsync(payload);
            setCreatedProductId(created.id); // keep the sheet open for image upload
        }
    }

    const targetProductId = product?.id ?? createdProductId;
    const isSaving = createProduct.isPending || updateProduct.isPending;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
                <SheetHeader><SheetTitle>{isEditing ? 'ویرایش محصول' : 'افزودن محصول'}</SheetTitle></SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">نام محصول</Label>
                        <Input id="name" value={name} onChange={(e) => handleNameChange(e.target.value)} required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="slug">اسلاگ (URL)</Label>
                        <Input id="slug" value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }} required disabled={isEditing} />
                        {isEditing && <p className="text-xs text-muted-foreground">اسلاگ پس از ساخت محصول قابل تغییر نیست.</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">توضیحات</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                        <Label>دسته‌بندی</Label>
                        <Select value={categoryId} onValueChange={setCategoryId}>
                            <SelectTrigger><SelectValue placeholder="انتخاب دسته" /></SelectTrigger>
                            <SelectContent>
                                {categories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="base_price">قیمت پایه</Label>
                            <Input id="base_price" type="number" min={0} value={basePrice} onChange={(e) => setBasePrice(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="weight">وزن (گرم)</Label>
                            <Input id="weight" type="number" min={0} step="0.01" value={weight} onChange={(e) => setWeight(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stock">موجودی</Label>
                            <Input id="stock" type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} required />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-md border p-3">
                        <Label htmlFor="is_active">فعال (قابل نمایش در فروشگاه)</Label>
                        <Switch id="is_active" checked={isActive} onCheckedChange={setIsActive} />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>متریال‌ها</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addMaterial}>
                                <Plus className="me-1 h-3 w-3" /> افزودن
                            </Button>
                        </div>
                        {materials.map((m, i) => (
                            <div key={i} className="flex items-end gap-2 rounded-md border p-2">
                                <div className="flex-1 space-y-1">
                                    <Label className="text-xs">نوع فلز</Label>
                                    <Select value={m.metal_type} onValueChange={(v) => updateMaterial(i, { metal_type: v as MetalType })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {METAL_TYPES.map((mt) => <SelectItem key={mt.value} value={mt.value}>{mt.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="w-24 space-y-1">
                                    <Label className="text-xs">وزن (گرم)</Label>
                                    <Input type="number" min={0} step="0.01" value={m.weight_grams} onChange={(e) => updateMaterial(i, { weight_grams: Number(e.target.value) })} />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <Label className="text-xs">برچسب</Label>
                                    <Input value={m.display_name ?? ''} onChange={(e) => updateMaterial(i, { display_name: e.target.value })} />
                                </div>
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeMaterial(i)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    {targetProductId && (
                        <div className="space-y-2 border-t pt-4">
                            <Label>تصاویر محصول</Label>
                            <ProductImageUploader productId={targetProductId} />
                        </div>

                    )}
                    {targetProductId && (
                        <div className="space-y-2 border-t pt-4">
                            <Label>گزینه‌ها (مثلاً سایز)</Label>
                            <VariantManager productId={targetProductId} variants={product?.variants ?? []} />
                        </div>
                    )}

                    <SheetFooter className="gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            {createdProductId ? 'پایان و بستن' : 'انصراف'}
                        </Button>
                        {!createdProductId && (
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? 'در حال ذخیره...' : isEditing ? 'ذخیره تغییرات' : 'ساخت محصول'}
                            </Button>
                        )}
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}