'use client';

import { useState } from 'react';
import { useAdminOrders, useUpdateOrderStatus } from '@/hooks/use-admin-orders';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Printer, Eye } from 'lucide-react';
import type { Order, OrderStatus } from '@/types';

const STATUS_LABELS: Record<OrderStatus, string> = {
    pending: 'در انتظار پرداخت', paid: 'پرداخت‌شده', shipped: 'ارسال‌شده', delivered: 'تحویل داده‌شده', cancelled: 'لغوشده',
};
const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    pending: ['paid', 'cancelled'], paid: ['shipped', 'cancelled'], shipped: ['delivered'], delivered: [], cancelled: [],
};
const STATUS_VARIANT: Record<OrderStatus, 'default' | 'secondary' | 'destructive'> = {
    pending: 'secondary', paid: 'default', shipped: 'default', delivered: 'default', cancelled: 'destructive',
};

export default function AdminOrdersPage() {
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const { data, isLoading } = useAdminOrders({
        status: statusFilter === 'all' ? undefined : (statusFilter as OrderStatus),
        limit: 100,
    });
    const updateStatus = useUpdateOrderStatus();
    const orders = data?.items ?? [];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">سفارش‌ها</h1>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                        {Object.entries(STATUS_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>شماره</TableHead><TableHead>مشتری</TableHead><TableHead>مبلغ کل</TableHead>
                            <TableHead>وضعیت</TableHead><TableHead>تاریخ</TableHead><TableHead className="w-32">عملیات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">در حال بارگذاری...</TableCell></TableRow>}
                        {!isLoading && orders.length === 0 && <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">سفارشی یافت نشد</TableCell></TableRow>}
                        {orders.map((o) => (
                            <TableRow key={o.id}>
                                <TableCell className="font-medium">#{o.id}</TableCell>
                                <TableCell>{o.address.city} — {o.address.label ?? '—'}</TableCell>
                                <TableCell>{o.total.toLocaleString('fa-IR')}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={STATUS_VARIANT[o.status]}>{STATUS_LABELS[o.status]}</Badge>
                                        {ORDER_TRANSITIONS[o.status].length > 0 && (
                                            <Select value="" onValueChange={(v) => updateStatus.mutate({ id: o.id, status: v as OrderStatus })}>
                                                <SelectTrigger className="h-7 w-32 text-xs"><SelectValue placeholder="تغییر وضعیت" /></SelectTrigger>
                                                <SelectContent>
                                                    {ORDER_TRANSITIONS[o.status].map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString('fa-IR')}</TableCell>
                                <TableCell>
                                    <div className="flex gap-1">
                                        <Button size="icon" variant="ghost" onClick={() => setSelectedOrder(o)}><Eye className="h-4 w-4" /></Button>
                                        <Button size="icon" variant="ghost" asChild>
                                            <a href={`/dashboard/orders/${o.id}/packing-slip`} target="_blank" rel="noopener noreferrer">
                                                <Printer className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Sheet open={!!selectedOrder} onOpenChange={(o) => !o && setSelectedOrder(null)}>
                <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
                    {selectedOrder && (
                        <>
                            <SheetHeader><SheetTitle>سفارش #{selectedOrder.id}</SheetTitle></SheetHeader>
                            <div className="space-y-4 py-4 text-sm">
                                <div>
                                    <p className="font-medium text-muted-foreground">آدرس تحویل</p>
                                    <p>{selectedOrder.address.line_1}، {selectedOrder.address.city}</p>
                                    <p className="text-muted-foreground">{selectedOrder.address.postal_code}</p>
                                </div>
                                <div>
                                    <p className="mb-2 font-medium text-muted-foreground">اقلام</p>
                                    <div className="space-y-2">
                                        {selectedOrder.items.map((item) => (
                                            <div key={item.id} className="flex justify-between border-b pb-2">
                                                <span>{item.product_name} × {item.quantity}</span>
                                                <span>{(item.unit_price * item.quantity).toLocaleString('fa-IR')}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-1 border-t pt-3">
                                    <div className="flex justify-between"><span className="text-muted-foreground">جمع جزء</span><span>{selectedOrder.subtotal.toLocaleString('fa-IR')}</span></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">هزینه ارسال</span><span>{selectedOrder.shipping_cost.toLocaleString('fa-IR')}</span></div>
                                    <div className="flex justify-between font-semibold"><span>مجموع</span><span>{selectedOrder.total.toLocaleString('fa-IR')}</span></div>
                                </div>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}