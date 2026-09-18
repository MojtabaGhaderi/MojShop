// frontend/app/(admin)/dashboard/trust-badges/page.tsx
'use client';

import { useState } from 'react';
import {
    useAdminTrustBadges,
    useCreateTrustBadge,
    useUpdateTrustBadge,
    useDeleteTrustBadge,
} from '@/hooks/use-admin-storefront';
import type { TrustBadgeItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, ShieldCheck, Truck, Sparkles, RefreshCw } from 'lucide-react';

const ICON_KEYS = [
    { value: 'shield', label: 'سپر اصالت (Shield)', icon: ShieldCheck },
    { value: 'truck', label: 'ارسال ایمن (Truck)', icon: Truck },
    { value: 'sparkles', label: 'نقره دست‌ساز (Sparkles)', icon: Sparkles },
    { value: 'refresh', label: 'ضمانت بازگشت (Refresh)', icon: RefreshCw },
];

function TrustBadgeForm({
    badge,
    onSubmit,
    isSaving,
}: {
    badge: TrustBadgeItem | null;
    onSubmit: (data: Partial<TrustBadgeItem>) => void;
    isSaving: boolean;
}) {
    const [title, setTitle] = useState(badge?.title ?? '');
    const [description, setDescription] = useState(badge?.description ?? '');
    const [iconKey, setIconKey] = useState(badge?.icon_key ?? 'shield');
    const [sortOrder, setSortOrder] = useState(String(badge?.sort_order ?? 0));

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit({
                    title,
                    description,
                    icon_key: iconKey,
                    sort_order: Number(sortOrder),
                });
            }}
            className="space-y-4 pt-2"
        >
            <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">عنوان ستون اعتماد</Label>
                <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: اصالت تضمین‌شده نقره ۹۲۵"
                    required
                    className="h-10 rounded-xl border-[#E8E2D1] bg-white text-xs"
                />
            </div>

            <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">توضیح تکمیلی</Label>
                <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="مثال: همراه با شناسنامه اصالت عیار کارگاه"
                    required
                    className="h-10 rounded-xl border-[#E8E2D1] bg-white text-xs"
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">آیکون نشان</Label>
                    <Select value={iconKey} onValueChange={setIconKey}>
                        <SelectTrigger className="h-10 rounded-xl border-[#E8E2D1] bg-white text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-[#E8E2D1] bg-[#FAF7F0]">
                            {ICON_KEYS.map((k) => (
                                <SelectItem key={k.value} value={k.value}>
                                    {k.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">ترتیب نمایش</Label>
                    <Input
                        type="number"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="h-10 rounded-xl border-[#E8E2D1] bg-white font-mono text-xs"
                    />
                </div>
            </div>

            <DialogFooter className="pt-2">
                <Button type="submit" disabled={isSaving} className="h-10 rounded-xl bg-accent text-white hover:bg-accent-hover shadow-2xs">
                    {isSaving ? 'در حال ذخیره...' : 'ثبت ستون اعتماد'}
                </Button>
            </DialogFooter>
        </form>
    );
}

export default function AdminTrustBadgesPage() {
    const { data: badges, isLoading } = useAdminTrustBadges();
    const createBadge = useCreateTrustBadge();
    const updateBadge = useUpdateTrustBadge();
    const deleteBadge = useDeleteTrustBadge();

    const [open, setOpen] = useState(false);
    const [editingBadge, setEditingBadge] = useState<TrustBadgeItem | null>(null);

    return (
        <div className="space-y-6 select-none" dir="rtl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-accent">ویترین و اعتبار</span>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">ستون‌های اعتماد</h1>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-10 rounded-xl bg-accent text-white hover:bg-accent-hover shadow-2xs">
                            <Plus className="me-1.5 h-4 w-4" /> نشان اعتماد جدید
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-2xl border-[#E8E2D1] bg-[#FAF7F0] sm:max-w-md" dir="rtl">
                        <DialogHeader className="text-start">
                            <DialogTitle className="text-base font-bold">ایجاد ستون اعتماد جدید</DialogTitle>
                        </DialogHeader>
                        <TrustBadgeForm
                            badge={null}
                            isSaving={createBadge.isPending}
                            onSubmit={async (data) => {
                                await createBadge.mutateAsync(data);
                                setOpen(false);
                            }}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#E8E2D1] bg-white/80 shadow-2xs backdrop-blur-md">
                <Table>
                    <TableHeader className="bg-[#FAF7F0]/80">
                        <TableRow className="border-[#E8E2D1] hover:bg-transparent">
                            <TableHead className="text-xs font-semibold text-foreground">عنوان نشان</TableHead>
                            <TableHead className="text-xs font-semibold text-foreground">توضیح تکمیلی</TableHead>
                            <TableHead className="text-xs font-semibold text-foreground">کلید آیکون</TableHead>
                            <TableHead className="text-xs font-semibold text-foreground">ترتیب</TableHead>
                            <TableHead className="w-24 text-center text-xs font-semibold text-foreground">عملیات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={5} className="py-12 text-center text-xs text-muted-foreground">
                                    در حال بارگذاری نشان‌ها...
                                </TableCell>
                            </TableRow>
                        )}
                        {!isLoading && (!badges || badges.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={5} className="py-12 text-center text-xs text-muted-foreground">
                                    هیچ ستون اعتمادی تعریف نشده است.
                                </TableCell>
                            </TableRow>
                        )}
                        {badges?.map((b) => (
                            <TableRow key={b.id} className="border-[#E8E2D1]/60 transition-colors hover:bg-accent/[0.03]">
                                <TableCell className="text-xs font-semibold text-foreground">{b.title}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">{b.description}</TableCell>
                                <TableCell className="font-mono text-xs text-accent">{b.icon_key}</TableCell>
                                <TableCell className="font-mono text-xs text-foreground">{b.sort_order}</TableCell>
                                <TableCell>
                                    <div className="flex items-center justify-center gap-1">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => setEditingBadge(b)}
                                            className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-accent/10 hover:text-accent"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => deleteBadge.mutate(b.id)}
                                            className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-rose-50 hover:text-rose-600"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!editingBadge} onOpenChange={(o) => !o && setEditingBadge(null)}>
                <DialogContent className="rounded-2xl border-[#E8E2D1] bg-[#FAF7F0] sm:max-w-md" dir="rtl">
                    <DialogHeader className="text-start">
                        <DialogTitle className="text-base font-bold">ویرایش ستون اعتماد</DialogTitle>
                    </DialogHeader>
                    {editingBadge && (
                        <TrustBadgeForm
                            badge={editingBadge}
                            isSaving={updateBadge.isPending}
                            onSubmit={async (data) => {
                                await updateBadge.mutateAsync({ id: editingBadge.id, payload: data });
                                setEditingBadge(null);
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}