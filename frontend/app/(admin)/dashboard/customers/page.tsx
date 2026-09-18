// frontend/app/(admin)/dashboard/customers/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { useAdminUsers, useUpdateUserFlags } from '@/hooks/use-admin-users';
import { useAdminOrders } from '@/hooks/use-admin-orders';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react';
import type { AuthUser } from '@/types';

interface CustomerFilters {
    name: string;
    email: string;
    phone: string;
    activeStatus: 'all' | 'active' | 'inactive';
    roleStatus: 'all' | 'admin' | 'user';
}

const INITIAL_CUSTOMER_FILTERS: CustomerFilters = {
    name: '',
    email: '',
    phone: '',
    activeStatus: 'all',
    roleStatus: 'all',
};

export default function AdminCustomersPage() {
    const [filters, setFilters] = useState<CustomerFilters>(INITIAL_CUSTOMER_FILTERS);
    // limit set to 100 to prevent FastAPI 422 limit validation errors
    const { data: users, isLoading } = useAdminUsers({ limit: 100 });
    const updateFlags = useUpdateUserFlags();
    const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);

    const { data: userOrders, isLoading: ordersLoading } = useAdminOrders(
        selectedUser ? { user_id: selectedUser.id, limit: 50 } : undefined
    );

    const hasActiveFilters = useMemo(() => {
        return (
            filters.name !== '' ||
            filters.email !== '' ||
            filters.phone !== '' ||
            filters.activeStatus !== 'all' ||
            filters.roleStatus !== 'all'
        );
    }, [filters]);

    const updateFilter = (key: keyof CustomerFilters, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    // Keep selectedUser in sync if flags are updated
    const activeSelectedUser = useMemo(() => {
        if (!selectedUser || !users) return selectedUser;
        return users.find((u) => u.id === selectedUser.id) || selectedUser;
    }, [selectedUser, users]);

    // Simultaneous multi-column filtering
    const filteredUsers = useMemo(() => {
        if (!users) return [];

        return users.filter((u) => {
            // 1. Name
            if (filters.name.trim()) {
                const term = filters.name.trim().toLowerCase();
                if (!u.full_name?.toLowerCase().includes(term)) return false;
            }

            // 2. Email
            if (filters.email.trim()) {
                const term = filters.email.trim().toLowerCase();
                if (!u.email?.toLowerCase().includes(term)) return false;
            }

            // 3. Phone
            if (filters.phone.trim()) {
                const term = filters.phone.trim();
                if (!u.phone?.includes(term)) return false;
            }

            // 4. Active Status
            if (filters.activeStatus === 'active' && !u.is_active) return false;
            if (filters.activeStatus === 'inactive' && u.is_active) return false;

            // 5. Role Status
            if (filters.roleStatus === 'admin' && !u.is_admin) return false;
            if (filters.roleStatus === 'user' && u.is_admin) return false;

            return true;
        });
    }, [users, filters]);

    return (
        <div className="space-y-6 select-none" dir="rtl">
            {/* Header & Reset Button */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-accent">
                        مرور و کاربران
                    </span>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        باشگاه مشتریان
                    </h1>
                </div>

                {hasActiveFilters && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilters(INITIAL_CUSTOMER_FILTERS)}
                        className="h-9 gap-1.5 rounded-xl border-accent/40 bg-white text-xs font-semibold text-accent hover:bg-accent/10 shadow-2xs"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>پاک کردن فیلترها</span>
                    </Button>
                )}
            </div>

            {/* Customers Table */}
            <div className="overflow-hidden rounded-2xl border border-[#E8E2D1] bg-white/80 shadow-2xs backdrop-blur-md">
                <Table>
                    <TableHeader>
                        {/* Column Titles */}
                        <TableRow className="border-[#E8E2D1] bg-[#FAF7F0]/90 hover:bg-transparent">
                            <TableHead className="text-xs font-semibold text-foreground">نام و نام خانوادگی</TableHead>
                            <TableHead className="text-xs font-semibold text-foreground">نشانی ایمیل</TableHead>
                            <TableHead className="text-xs font-semibold text-foreground">شماره موبایل</TableHead>
                            <TableHead className="w-28 text-xs font-semibold text-foreground">نقش کاربری</TableHead>
                            <TableHead className="w-28 text-xs font-semibold text-foreground">وضعیت حساب</TableHead>
                        </TableRow>

                        {/* Column Search Inputs */}
                        <TableRow className="border-[#E8E2D1] bg-[#F5F2EA]/60 hover:bg-[#F5F2EA]/60">
                            {/* Name Search */}
                            <TableHead className="p-2">
                                <Input
                                    value={filters.name}
                                    onChange={(e) => updateFilter('name', e.target.value)}
                                    placeholder="جستجوی نام..."
                                    className="h-7 w-full rounded-lg border-[#E0D8C3] bg-white px-2 text-[11px] placeholder:text-muted-foreground/60 focus:border-accent focus:ring-1 focus:ring-accent/30"
                                />
                            </TableHead>

                            {/* Email Search */}
                            <TableHead className="p-2">
                                <Input
                                    value={filters.email}
                                    onChange={(e) => updateFilter('email', e.target.value)}
                                    placeholder="جستجوی ایمیل..."
                                    dir="ltr"
                                    className="h-7 w-full rounded-lg border-[#E0D8C3] bg-white px-2 text-[11px] font-mono placeholder:text-muted-foreground/60 focus:border-accent focus:ring-1 focus:ring-accent/30"
                                />
                            </TableHead>

                            {/* Phone Search */}
                            <TableHead className="p-2">
                                <Input
                                    value={filters.phone}
                                    onChange={(e) => updateFilter('phone', e.target.value)}
                                    placeholder="شماره (مثال: 47)..."
                                    dir="ltr"
                                    className="h-7 w-full rounded-lg border-[#E0D8C3] bg-white px-2 text-[11px] font-mono placeholder:text-muted-foreground/60 focus:border-accent focus:ring-1 focus:ring-accent/30"
                                />
                            </TableHead>

                            {/* Role Dropdown */}
                            <TableHead className="p-2">
                                <Select
                                    value={filters.roleStatus}
                                    onValueChange={(val) => updateFilter('roleStatus', val)}
                                >
                                    <SelectTrigger className="h-7 w-full rounded-lg border-[#E0D8C3] bg-white px-2 text-[11px] font-medium">
                                        <SelectValue placeholder="همه" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-[#E8E2D1] bg-[#FAF7F0]">
                                        <SelectItem value="all" className="text-xs">همه</SelectItem>
                                        <SelectItem value="admin" className="text-xs">مدیران</SelectItem>
                                        <SelectItem value="user" className="text-xs">مشتریان عادی</SelectItem>
                                    </SelectContent>
                                </Select>
                            </TableHead>

                            {/* Active Status Dropdown */}
                            <TableHead className="p-2">
                                <Select
                                    value={filters.activeStatus}
                                    onValueChange={(val) => updateFilter('activeStatus', val)}
                                >
                                    <SelectTrigger className="h-7 w-full rounded-lg border-[#E0D8C3] bg-white px-2 text-[11px] font-medium">
                                        <SelectValue placeholder="همه" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-[#E8E2D1] bg-[#FAF7F0]">
                                        <SelectItem value="all" className="text-xs">همه</SelectItem>
                                        <SelectItem value="active" className="text-xs">فعال</SelectItem>
                                        <SelectItem value="inactive" className="text-xs">مسدود</SelectItem>
                                    </SelectContent>
                                </Select>
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={5} className="py-12 text-center text-xs text-muted-foreground">
                                    در حال دریافت فهرست کاربران...
                                </TableCell>
                            </TableRow>
                        )}
                        {!isLoading && filteredUsers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="py-12 text-center text-xs text-muted-foreground">
                                    کاربری با ترکیب فیلترهای وارد شده پیدا نشد.
                                </TableCell>
                            </TableRow>
                        )}
                        {filteredUsers.map((u) => (
                            <TableRow
                                key={u.id}
                                className="cursor-pointer border-[#E8E2D1]/60 transition-colors hover:bg-accent/[0.03]"
                                onClick={() => setSelectedUser(u)}
                            >
                                <TableCell className="text-xs font-semibold text-foreground">
                                    {u.full_name ?? '—'}
                                </TableCell>
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                    {u.email}
                                </TableCell>
                                <TableCell className="font-mono text-xs text-foreground">
                                    {u.phone ?? '—'}
                                </TableCell>
                                <TableCell>
                                    {u.is_admin ? (
                                        <Badge className="border-accent/40 bg-accent/15 text-accent text-[10px]">
                                            مدیر کل
                                        </Badge>
                                    ) : (
                                        <span className="text-[11px] text-muted-foreground">مشتری</span>
                                    )}
                                </TableCell>
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                    <Switch
                                        checked={u.is_active}
                                        onCheckedChange={(v) => updateFlags.mutate({ id: u.id, payload: { is_active: v } })}
                                        className="data-[state=checked]:bg-accent"
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Customer Details & Sensitive Permission Management Sheet */}
            <Sheet open={!!activeSelectedUser} onOpenChange={(o) => !o && setSelectedUser(null)}>
                <SheetContent className="w-full overflow-y-auto border-s border-[#E8E2D1] bg-[#FAF7F0] p-6 sm:max-w-lg" dir="rtl">
                    {activeSelectedUser && (
                        <>
                            <SheetHeader className="border-b border-[#E8E2D1] pb-4 text-start">
                                <SheetTitle className="text-lg font-bold text-foreground">
                                    پروفایل {activeSelectedUser.full_name ?? activeSelectedUser.email}
                                </SheetTitle>
                            </SheetHeader>

                            <div className="space-y-6 py-4 text-xs">
                                {/* User Summary Card */}
                                <div className="rounded-2xl border border-[#E8E2D1] bg-white/80 p-4 space-y-2 shadow-2xs">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">شناسه کاربری:</span>
                                        <span className="font-mono font-bold text-foreground">#{activeSelectedUser.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">نشانی ایمیل:</span>
                                        <span className="font-mono text-foreground">{activeSelectedUser.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">شماره تماس:</span>
                                        <span className="font-mono text-foreground">{activeSelectedUser.phone || 'ثبت نشده'}</span>
                                    </div>
                                </div>

                                {/* Secure Admin Role Assignment Section (Protected with Confirmation) */}
                                <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50/60 to-white p-4 space-y-3 shadow-2xs">
                                    <div className="flex items-center gap-2 text-amber-900 font-bold">
                                        <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
                                        <span>سطح دسترسی مدیریتی</span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                        کاربران با دسترسی مدیر به تمام تنظیمات قیمت‌گذاری، کاتالوگ و سوابق مالی مشتریان دسترسی نامحدود خواهند داشت.
                                    </p>

                                    <div className="flex items-center justify-between pt-1">
                                        <span className="text-xs font-medium text-foreground">
                                            وضعیت کنونی: {activeSelectedUser.is_admin ? 'مدیر سیستم' : 'مشتری عادی'}
                                        </span>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant={activeSelectedUser.is_admin ? 'destructive' : 'outline'}
                                                    size="sm"
                                                    className="h-8 rounded-xl text-xs"
                                                >
                                                    {activeSelectedUser.is_admin ? 'عزل از مدیریت' : 'ارتقاء به مدیر'}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="rounded-2xl border-[#E8E2D1] bg-[#FAF7F0]" dir="rtl">
                                                <AlertDialogHeader className="text-start">
                                                    <AlertDialogTitle className="text-base font-bold">
                                                        {activeSelectedUser.is_admin
                                                            ? 'عزل کاربر از دسترسی مدیریت؟'
                                                            : 'اعطای دسترسی مدیر کل به این کاربر؟'}
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
                                                        {activeSelectedUser.is_admin
                                                            ? `دسترسی «${activeSelectedUser.full_name || activeSelectedUser.email}» به داشبورد و سفارش‌ها مسدود خواهد شد.`
                                                            : `آیا مطمئن هستید که می‌خواهید به «${activeSelectedUser.full_name || activeSelectedUser.email}» دسترسی کامل مدیریتی اعطا کنید؟`}
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter className="gap-2 sm:gap-0">
                                                    <AlertDialogCancel className="rounded-xl border-[#E8E2D1]">انصراف</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() =>
                                                            updateFlags.mutate({
                                                                id: activeSelectedUser.id,
                                                                payload: { is_admin: !activeSelectedUser.is_admin },
                                                            })
                                                        }
                                                        className={`rounded-xl text-white ${activeSelectedUser.is_admin
                                                            ? 'bg-rose-600 hover:bg-rose-700'
                                                            : 'bg-accent hover:bg-accent-hover'
                                                            }`}
                                                    >
                                                        تأیید و اعمال تغییر
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>

                                {/* Orders History */}
                                <div className="space-y-3">
                                    <span className="block font-semibold text-foreground">
                                        سوابق سفارش‌ها
                                    </span>
                                    {ordersLoading && <p className="text-xs text-muted-foreground">در حال بارگذاری سوابق...</p>}
                                    {!ordersLoading && (userOrders?.items.length ?? 0) === 0 && (
                                        <p className="text-xs text-muted-foreground">این مشتری هنوز سفارشی ثبت نکرده است.</p>
                                    )}
                                    {userOrders?.items.map((o) => (
                                        <div key={o.id} className="flex items-center justify-between rounded-xl border border-[#E8E2D1] bg-white/80 p-3.5 shadow-2xs">
                                            <div>
                                                <p className="font-mono text-xs font-bold text-accent">سفارش #{o.id}</p>
                                                <p className="text-[11px] text-muted-foreground font-mono">{new Date(o.created_at).toLocaleDateString('fa-IR')}</p>
                                            </div>
                                            <div className="text-left">
                                                <Badge className="border-accent/40 bg-accent/15 text-accent">{o.status}</Badge>
                                                <p className="mt-1 font-mono text-xs font-medium text-foreground">{o.total.toLocaleString('fa-IR')} تومان</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}