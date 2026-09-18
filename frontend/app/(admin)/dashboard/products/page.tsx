// frontend/app/(admin)/dashboard/products/page.tsx
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-accent">آتلیه و کاتالوگ</span>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">آثار و محصولات</h1>
                </div>
                <Button
                    onClick={() => { setEditingProduct(null); setFormOpen(true); }}
                    className="h-10 rounded-xl bg-accent text-white hover:bg-accent-hover shadow-2xs"
                >
                    <Plus className="me-1.5 h-4 w-4" /> افزودن محصول جدید
                </Button>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#E8E2D1] bg-white/70 p-3 shadow-2xs backdrop-blur-sm">
                <Input
                    placeholder="جستجوی نام محصول..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-10 w-full max-w-xs rounded-xl border-[#E8E2D1] bg-white/80 text-xs focus:border-accent focus:ring-accent/20"
                />
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="h-10 w-44 rounded-xl border-[#E8E2D1] bg-white/80 text-xs">
                        <SelectValue placeholder="همه دسته‌ها" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-[#E8E2D1] bg-[#FAF7F0]">
                        <SelectItem value="all">همه دسته‌ها</SelectItem>
                        {categories?.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-10 w-36 rounded-xl border-[#E8E2D1] bg-white/80 text-xs">
                        <SelectValue placeholder="وضعیت" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-[#E8E2D1] bg-[#FAF7F0]">
                        <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                        <SelectItem value="active">فقط فعال</SelectItem>
                        <SelectItem value="inactive">فقط غیرفعال</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Products Table */}
            <div className="overflow-hidden rounded-2xl border border-[#E8E2D1] bg-white/80 shadow-2xs backdrop-blur-md">
                <Table>
                    <TableHeader className="bg-[#FAF7F0]/80">
                        <TableRow className="border-[#E8E2D1] hover:bg-transparent">
                            <TableHead className="text-xs font-semibold text-foreground">محصول</TableHead>
                            <TableHead className="text-xs font-semibold text-foreground">دسته‌بندی</TableHead>
                            <TableHead className="text-xs font-semibold text-foreground">قیمت پایه (تومان)</TableHead>
                            <TableHead className="text-xs font-semibold text-foreground">موجودی انبار</TableHead>
                            <TableHead className="text-xs font-semibold text-foreground">وضعیت نمایش</TableHead>
                            <TableHead className="w-28 text-center text-xs font-semibold text-foreground">عملیات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={6} className="py-12 text-center text-xs text-muted-foreground">
                                    در حال بارگذاری اطلاعات محصولات...
                                </TableCell>
                            </TableRow>
                        )}
                        {!isLoading && filtered.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="py-12">
                                    <EmptyState
                                        icon={Package}
                                        title="اثری یافت نشد"
                                        description={
                                            search || categoryFilter !== 'all' || statusFilter !== 'all'
                                                ? 'فیلترها را تغییر دهید یا یک محصول جدید اضافه کنید.'
                                                : 'هنوز محصولی در کاتالوگ ثبت نشده است.'
                                        }
                                    />
                                </TableCell>
                            </TableRow>
                        )}
                        {filtered.map((p) => (
                            <TableRow key={p.id} className="border-[#E8E2D1]/60 transition-colors hover:bg-accent/[0.03]">
                                <TableCell className="text-xs font-semibold text-foreground">{p.name}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">{p.category?.name ?? '—'}</TableCell>
                                <TableCell className="text-xs font-mono font-medium text-foreground">
                                    {p.base_price.toLocaleString('fa-IR')}
                                </TableCell>
                                <TableCell className="text-xs font-mono">
                                    {p.stock_quantity <= 3 ? (
                                        <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700">
                                            {p.stock_quantity} عدد
                                        </Badge>
                                    ) : (
                                        <span className="text-foreground">{p.stock_quantity} عدد</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <button onClick={() => toggleActive(p)} type="button" className="cursor-pointer">
                                        <Badge
                                            className={
                                                p.is_active
                                                    ? 'border-accent/30 bg-accent/15 text-accent hover:bg-accent/25'
                                                    : 'border-[#E8E2D1] bg-muted/50 text-muted-foreground'
                                            }
                                        >
                                            {p.is_active ? 'فعال در فروشگاه' : 'غیرفعال'}
                                        </Badge>
                                    </button>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center justify-center gap-1">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => { setEditingProduct(p); setFormOpen(true); }}
                                            className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-accent/10 hover:text-accent"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-rose-50 hover:text-rose-600"
                                                >
                                                    ✕
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="rounded-2xl border-[#E8E2D1] bg-[#FAF7F0]">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className="text-base font-bold">غیرفعال کردن اثر؟</AlertDialogTitle>
                                                    <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
                                                        «{p.name}» از ویترین فروشگاه پنهان می‌شود ولی رکوردهای مالی و تاریخی آن حذف نخواهند شد.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter className="gap-2 sm:gap-0">
                                                    <AlertDialogCancel className="rounded-xl border-[#E8E2D1]">انصراف</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => deactivate.mutate(p.id)}
                                                        className="rounded-xl bg-rose-600 text-white hover:bg-rose-700"
                                                    >
                                                        تأیید و غیرفعال‌سازی
                                                    </AlertDialogAction>
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