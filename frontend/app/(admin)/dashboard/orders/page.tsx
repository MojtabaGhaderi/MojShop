// frontend/app/(admin)/dashboard/orders/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { useAdminOrders, useUpdateOrderStatus } from '@/hooks/use-admin-orders';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Printer, Eye, RotateCcw } from 'lucide-react';
import type { Order, OrderStatus } from '@/types';

const STATUS_LABELS: Record<OrderStatus, string> = {
    pending: 'در انتظار پرداخت',
    paid: 'پرداخت‌شده',
    shipped: 'ارسال‌شده',
    delivered: 'تحویل داده‌شده',
    cancelled: 'لغوشده',
};

const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    pending: ['paid', 'cancelled'],
    paid: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
};

interface OrderFilters {
    id: string;
    destination: string;
    product: string;
    total: string;
    status: string;
    date: string;
}

const INITIAL_FILTERS: OrderFilters = {
    id: '',
    destination: '',
    product: '',
    total: '',
    status: 'all',
    date: '',
};

export default function AdminOrdersPage() {
    const [filters, setFilters] = useState<OrderFilters>(INITIAL_FILTERS);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const { data, isLoading } = useAdminOrders({ limit: 100 });
    const updateStatus = useUpdateOrderStatus();
    const rawOrders = data?.items ?? [];

    const hasActiveFilters = useMemo(() => {
        return (
            filters.id !== '' ||
            filters.destination !== '' ||
            filters.product !== '' ||
            filters.total !== '' ||
            filters.status !== 'all' ||
            filters.date !== ''
        );
    }, [filters]);

    const updateFilter = (key: keyof OrderFilters, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    // Simultaneous multi-column filtering
    const filteredOrders = useMemo(() => {
        return rawOrders.filter((o) => {
            // 1. Order ID filter
            if (filters.id.trim()) {
                const cleanIdSearch = filters.id.trim().replace(/^#/, '');
                if (!String(o.id).includes(cleanIdSearch)) return false;
            }

            // 2. Destination filter (city, address, label, postal code)
            if (filters.destination.trim()) {
                const term = filters.destination.trim().toLowerCase();
                const cityMatch = o.address?.city?.toLowerCase().includes(term);
                const lineMatch = o.address?.line_1?.toLowerCase().includes(term);
                const labelMatch = o.address?.label?.toLowerCase().includes(term);
                const postalMatch = o.address?.postal_code?.includes(term);
                if (!cityMatch && !lineMatch && !labelMatch && !postalMatch) return false;
            }

            // 3. Product items filter
            if (filters.product.trim()) {
                const term = filters.product.trim().toLowerCase();
                const hasMatchingProduct = o.items?.some((item) =>
                    item.product_name.toLowerCase().includes(term)
                );
                if (!hasMatchingProduct) return false;
            }

            // 4. Total price filter
            if (filters.total.trim()) {
                const cleanTotal = filters.total.trim().replace(/,/g, '');
                if (!String(o.total).includes(cleanTotal)) return false;
            }

            // 5. Status filter
            if (filters.status !== 'all' && o.status !== filters.status) {
                return false;
            }

            // 6. Date filter (formats into local Persian date string for matching)
            if (filters.date.trim()) {
                const dateStr = new Date(o.created_at).toLocaleDateString('fa-IR');
                if (!dateStr.includes(filters.date.trim())) return false;
            }

            return true;
        });
    }, [rawOrders, filters]);

    return (
        <div className="space-y-6 select-none" dir="rtl">
            {/* Top Bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-accent">
                        مرور و فروش
                    </span>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        مدیریت سفارش‌ها
                    </h1>
                </div>

                {hasActiveFilters && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilters(INITIAL_FILTERS)}
                        className="h-9 gap-1.5 rounded-xl border-accent/40 bg-white text-xs font-semibold text-accent hover:bg-accent/10 shadow-2xs"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>پاک کردن تمام فیلترها</span>
                    </Button>
                )}
            </div>

            {/* Orders Table with Column-Specific Filter Inputs */}
            <div className="overflow-hidden rounded-2xl border border-[#E8E2D1] bg-white/80 shadow-2xs backdrop-blur-md">
                <Table>
                    <TableHeader>
                        {/* Primary Column Headings */}
                        <TableRow className="border-[#E8E2D1] bg-[#FAF7F0]/90 hover:bg-transparent">
                            <TableHead className="w-24 text-xs font-semibold text-foreground">شماره سفارش</TableHead>
                            <TableHead className="text-xs font-semibold text-foreground">مقصد تحویل</TableHead>
                            <TableHead className="text-xs font-semibold text-foreground">کالاهای سفارش</TableHead>
                            <TableHead className="text-xs font-semibold text-foreground">مبلغ کل (تومان)</TableHead>
                            <TableHead className="w-36 text-xs font-semibold text-foreground">وضعیت</TableHead>
                            <TableHead className="w-28 text-xs font-semibold text-foreground">تاریخ ثبت</TableHead>
                            <TableHead className="w-20 text-center text-xs font-semibold text-foreground">عملیات</TableHead>
                        </TableRow>

                        {/* Column-Specific Search Inputs Row */}
                        <TableRow className="border-[#E8E2D1] bg-[#F5F2EA]/60 hover:bg-[#F5F2EA]/60">
                            {/* Order ID */}
                            <TableHead className="p-2">
                                <Input
                                    value={filters.id}
                                    onChange={(e) => updateFilter('id', e.target.value)}
                                    placeholder="شماره..."
                                    dir="ltr"
                                    className="h-7 w-full rounded-lg border-[#E0D8C3] bg-white px-2 text-[11px] font-mono placeholder:text-muted-foreground/60 focus:border-accent focus:ring-1 focus:ring-accent/30"
                                />
                            </TableHead>

                            {/* Destination */}
                            <TableHead className="p-2">
                                <Input
                                    value={filters.destination}
                                    onChange={(e) => updateFilter('destination', e.target.value)}
                                    placeholder="جستجوی شهر یا آدرس..."
                                    className="h-7 w-full rounded-lg border-[#E0D8C3] bg-white px-2 text-[11px] placeholder:text-muted-foreground/60 focus:border-accent focus:ring-1 focus:ring-accent/30"
                                />
                            </TableHead>

                            {/* Product title */}
                            <TableHead className="p-2">
                                <Input
                                    value={filters.product}
                                    onChange={(e) => updateFilter('product', e.target.value)}
                                    placeholder="نام زیورآلات..."
                                    className="h-7 w-full rounded-lg border-[#E0D8C3] bg-white px-2 text-[11px] placeholder:text-muted-foreground/60 focus:border-accent focus:ring-1 focus:ring-accent/30"
                                />
                            </TableHead>

                            {/* Total Price */}
                            <TableHead className="p-2">
                                <Input
                                    value={filters.total}
                                    onChange={(e) => updateFilter('total', e.target.value)}
                                    placeholder="مبلغ..."
                                    dir="ltr"
                                    className="h-7 w-full rounded-lg border-[#E0D8C3] bg-white px-2 text-[11px] font-mono placeholder:text-muted-foreground/60 focus:border-accent focus:ring-1 focus:ring-accent/30"
                                />
                            </TableHead>

                            {/* Status Select */}
                            <TableHead className="p-2">
                                <Select
                                    value={filters.status}
                                    onValueChange={(val) => updateFilter('status', val)}
                                >
                                    <SelectTrigger className="h-7 w-full rounded-lg border-[#E0D8C3] bg-white px-2 text-[11px] font-medium">
                                        <SelectValue placeholder="همه" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-[#E8E2D1] bg-[#FAF7F0]">
                                        <SelectItem value="all" className="text-xs">همه وضعیت‌ها</SelectItem>
                                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                            <SelectItem key={value} value={value} className="text-xs">
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </TableHead>

                            {/* Date */}
                            <TableHead className="p-2">
                                <Input
                                    value={filters.date}
                                    onChange={(e) => updateFilter('date', e.target.value)}
                                    placeholder="مثال: ۱۴۰۵"
                                    className="h-7 w-full rounded-lg border-[#E0D8C3] bg-white px-2 text-[11px] font-mono placeholder:text-muted-foreground/60 focus:border-accent focus:ring-1 focus:ring-accent/30"
                                />
                            </TableHead>

                            {/* Clear / Empty Cell */}
                            <TableHead className="p-2 text-center text-muted-foreground text-[10px]">
                                {filteredOrders.length} مورد
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={7} className="py-12 text-center text-xs text-muted-foreground">
                                    در حال دریافت اطلاعات سفارش‌ها...
                                </TableCell>
                            </TableRow>
                        )}
                        {!isLoading && filteredOrders.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="py-12 text-center text-xs text-muted-foreground">
                                    سفارشی با این فیلترهای همزمان یافت نشد.
                                </TableCell>
                            </TableRow>
                        )}
                        {filteredOrders.map((o) => (
                            <TableRow key={o.id} className="border-[#E8E2D1]/60 transition-colors hover:bg-accent/[0.03]">
                                <TableCell className="font-mono text-xs font-bold text-accent">#{o.id}</TableCell>
                                <TableCell className="text-xs text-foreground">
                                    <span className="font-semibold">{o.address.city}</span> — {o.address.label ?? o.address.line_1}
                                </TableCell>
                                <TableCell className="text-xs text-foreground max-w-[200px] truncate">
                                    {o.items?.map((i) => i.product_name).join('، ') || '—'}
                                </TableCell>
                                <TableCell className="font-mono text-xs font-medium text-foreground">
                                    {o.total.toLocaleString('fa-IR')}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5">
                                        <Badge
                                            className={
                                                o.status === 'paid'
                                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                                    : o.status === 'shipped'
                                                        ? 'border-accent/40 bg-accent/15 text-accent'
                                                        : o.status === 'delivered'
                                                            ? 'border-slate-200 bg-slate-100 text-slate-700'
                                                            : o.status === 'cancelled'
                                                                ? 'border-rose-200 bg-rose-50 text-rose-700'
                                                                : 'border-amber-200 bg-amber-50 text-amber-800'
                                            }
                                        >
                                            {STATUS_LABELS[o.status]}
                                        </Badge>
                                        {ORDER_TRANSITIONS[o.status].length > 0 && (
                                            <Select
                                                value=""
                                                onValueChange={(v) => updateStatus.mutate({ id: o.id, status: v as OrderStatus })}
                                            >
                                                <SelectTrigger className="h-6 w-20 rounded-md border-[#E8E2D1] bg-white text-[10px] text-muted-foreground p-1">
                                                    <SelectValue placeholder="تغییر" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-[#E8E2D1] bg-[#FAF7F0]">
                                                    {ORDER_TRANSITIONS[o.status].map((s) => (
                                                        <SelectItem key={s} value={s} className="text-xs">
                                                            {STATUS_LABELS[s]}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground font-mono">
                                    {new Date(o.created_at).toLocaleDateString('fa-IR')}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center justify-center gap-1">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => setSelectedOrder(o)}
                                            className="h-7 w-7 rounded-lg text-muted-foreground hover:bg-accent/10 hover:text-accent"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-7 w-7 rounded-lg text-muted-foreground hover:bg-white hover:text-foreground"
                                            asChild
                                        >
                                            <a href={`/dashboard/orders/${o.id}/packing-slip`} target="_blank" rel="noopener noreferrer">
                                                <Printer className="h-3.5 w-3.5" />
                                            </a>
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Order Details Sheet */}
            <Sheet open={!!selectedOrder} onOpenChange={(o) => !o && setSelectedOrder(null)}>
                <SheetContent className="w-full overflow-y-auto border-s border-[#E8E2D1] bg-[#FAF7F0] p-6 sm:max-w-lg" dir="rtl">
                    {selectedOrder && (
                        <>
                            <SheetHeader className="border-b border-[#E8E2D1] pb-4 text-start">
                                <SheetTitle className="text-lg font-bold text-foreground">
                                    جزئیات سفارش #{selectedOrder.id}
                                </SheetTitle>
                            </SheetHeader>
                            <div className="space-y-6 py-4 text-xs">
                                <div className="rounded-2xl border border-[#E8E2D1] bg-white/80 p-4 space-y-1.5 shadow-2xs">
                                    <p className="font-semibold text-accent">نشانی تحویل گیرنده</p>
                                    <p className="text-foreground">{selectedOrder.address.line_1}، {selectedOrder.address.city}</p>
                                    <p className="text-muted-foreground font-mono">کد پستی: {selectedOrder.address.postal_code}</p>
                                </div>

                                <div className="rounded-2xl border border-[#E8E2D1] bg-white/80 p-4 shadow-2xs">
                                    <p className="mb-3 font-semibold text-accent">اقلام خریداری شده</p>
                                    <div className="divide-y divide-[#E8E2D1]/60">
                                        {selectedOrder.items.map((item) => (
                                            <div key={item.id} className="flex justify-between py-2.5">
                                                <span className="font-medium text-foreground">{item.product_name} × {item.quantity}</span>
                                                <span className="font-mono text-muted-foreground">
                                                    {(item.unit_price * item.quantity).toLocaleString('fa-IR')} تومان
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-[#E8E2D1] bg-white/80 p-4 space-y-2 font-mono shadow-2xs">
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>جمع اقلام:</span>
                                        <span>{selectedOrder.subtotal.toLocaleString('fa-IR')} تومان</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>هزینه بسته‌بندی و ارسال:</span>
                                        <span>{selectedOrder.shipping_cost.toLocaleString('fa-IR')} تومان</span>
                                    </div>
                                    <div className="flex justify-between border-t border-[#E8E2D1] pt-2 text-sm font-bold text-foreground">
                                        <span>مبلغ نهایی پرداختی:</span>
                                        <span className="text-accent">{selectedOrder.total.toLocaleString('fa-IR')} تومان</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}