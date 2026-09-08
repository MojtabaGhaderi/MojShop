'use client';

import { useMemo, useState } from 'react';
import { useAdminProducts, useDeactivateProduct, useUpdateProduct } from '@/hooks/use-admin-products';
import { useCategories } from '@/hooks/use-categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Package } from 'lucide-react';
import { ProductFormSheet } from '@/components/admin/product-form-sheet';
import { EmptyState } from '@/components/admin/empty-state';
import type { Product } from '@/types';

export default function AdminProductsPage() {
    const { data: products, isLoading } = useAdminProducts({ limit: 200 });
    const { data: categories } = useCategories();
    const deactivate = useDeactivateProduct();
    const updateProduct = useUpdateProduct();

    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formOpen, setFormOpen] = useState(false);

    const filtered = useMemo(() => {
        if (!products) return [];
        return products.filter((p) => {
            if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
            if (categoryFilter !== 'all' && String(p.category?.id) !== categoryFilter) return false;
            if (statusFilter === 'active' && !p.is_active) return false;
            if (statusFilter === 'inactive' && p.is_active) return false;
            return true;
        });
    }, [products, search, categoryFilter, statusFilter]);

    function toggleActive(p: Product) {
        updateProduct.mutate({ id: p.id, payload: { is_active: !p.is_active } });
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">محصولات</h1>
                <Button onClick={() => { setEditingProduct(null); setFormOpen(true); }}>
                    <Plus className="me-2 h-4 w-4" /> افزودن محصول
                </Button>
            </div>

            <div className="flex flex-wrap gap-2">
                <Input placeholder="جستجوی نام محصول..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-48"><SelectValue placeholder="همه دسته‌ها" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">همه دسته‌ها</SelectItem>
                        {categories?.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40"><SelectValue placeholder="وضعیت" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">همه</SelectItem>
                        <SelectItem value="active">فعال</SelectItem>
                        <SelectItem value="inactive">غیرفعال</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>محصول</TableHead>
                            <TableHead>دسته</TableHead>
                            <TableHead>قیمت پایه</TableHead>
                            <TableHead>موجودی</TableHead>
                            <TableHead>وضعیت</TableHead>
                            <TableHead className="w-32">عملیات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">در حال بارگذاری...</TableCell></TableRow>}
                        {!isLoading && filtered.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6}>
                                    <EmptyState
                                        icon={Package}
                                        title="محصولی یافت نشد"
                                        description={search || categoryFilter !== 'all' || statusFilter !== 'all' ? 'فیلترها را تغییر دهید یا یک محصول جدید اضافه کنید.' : 'هنوز محصولی اضافه نشده است.'}
                                    />
                                </TableCell>
                            </TableRow>
                        )}
                        {filtered.map((p) => (
                            <TableRow key={p.id}>
                                <TableCell className="font-medium">{p.name}</TableCell>
                                <TableCell>{p.category?.name ?? '—'}</TableCell>
                                <TableCell>{p.base_price.toLocaleString('fa-IR')}</TableCell>
                                <TableCell>{p.stock_quantity <= 5 ? <Badge variant="destructive">{p.stock_quantity}</Badge> : p.stock_quantity}</TableCell>
                                <TableCell>
                                    <button onClick={() => toggleActive(p)} type="button">
                                        <Badge variant={p.is_active ? 'default' : 'secondary'} className="cursor-pointer">
                                            {p.is_active ? 'فعال' : 'غیرفعال'}
                                        </Badge>
                                    </button>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1">
                                        <Button size="icon" variant="ghost" onClick={() => { setEditingProduct(p); setFormOpen(true); }}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size="icon" variant="ghost" className="text-destructive">✕</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>غیرفعال کردن محصول؟</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        «{p.name}» از فروشگاه مخفی می‌شود اما حذف نمی‌شود و می‌توانید بعداً دوباره فعالش کنید.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>انصراف</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => deactivate.mutate(p.id)}>غیرفعال کن</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <ProductFormSheet open={formOpen} onOpenChange={setFormOpen} product={editingProduct} categories={categories ?? []} />
        </div>
    );
}