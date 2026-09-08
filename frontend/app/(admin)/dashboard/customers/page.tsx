'use client';

import { useState } from 'react';
import { useAdminUsers, useUpdateUserFlags } from '@/hooks/use-admin-users';
import { useAdminOrders } from '@/hooks/use-admin-orders';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { AuthUser } from '@/types';

export default function AdminCustomersPage() {
    const { data: users, isLoading } = useAdminUsers({ limit: 200 });
    const updateFlags = useUpdateUserFlags();
    const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
    const { data: userOrders, isLoading: ordersLoading } = useAdminOrders(
        selectedUser ? { user_id: selectedUser.id, limit: 50 } : undefined
    );

    return (
        <div className="space-y-4">
            <h1 className="text-xl font-semibold">مشتریان</h1>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow><TableHead>نام</TableHead><TableHead>ایمیل</TableHead><TableHead>موبایل</TableHead><TableHead>فعال</TableHead><TableHead>مدیر</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">در حال بارگذاری...</TableCell></TableRow>}
                        {users?.map((u) => (
                            <TableRow key={u.id} className="cursor-pointer" onClick={() => setSelectedUser(u)}>
                                <TableCell className="font-medium">{u.full_name ?? '—'}</TableCell>
                                <TableCell>{u.email}</TableCell>
                                <TableCell>{u.phone ?? '—'}</TableCell>
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                    <Switch checked={u.is_active} onCheckedChange={(v) => updateFlags.mutate({ id: u.id, payload: { is_active: v } })} />
                                </TableCell>
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                    <Switch checked={u.is_admin} onCheckedChange={(v) => updateFlags.mutate({ id: u.id, payload: { is_admin: v } })} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Sheet open={!!selectedUser} onOpenChange={(o) => !o && setSelectedUser(null)}>
                <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
                    {selectedUser && (
                        <>
                            <SheetHeader><SheetTitle>تاریخچه سفارش‌های {selectedUser.full_name ?? selectedUser.email}</SheetTitle></SheetHeader>
                            <div className="space-y-3 py-4">
                                {ordersLoading && <p className="text-sm text-muted-foreground">در حال بارگذاری...</p>}
                                {!ordersLoading && (userOrders?.items.length ?? 0) === 0 && <p className="text-sm text-muted-foreground">این مشتری هنوز سفارشی ثبت نکرده است.</p>}
                                {userOrders?.items.map((o) => (
                                    <div key={o.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                                        <div><p className="font-medium">سفارش #{o.id}</p><p className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString('fa-IR')}</p></div>
                                        <div className="text-left"><Badge>{o.status}</Badge><p className="mt-1">{o.total.toLocaleString('fa-IR')}</p></div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}