// frontend/app/(admin)/dashboard/categories/page.tsx
'use client';

import { useState } from 'react';
import { useAdminCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/use-admin-categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil } from 'lucide-react';
import { slugify } from '@/lib/utils';
import type { Category } from '@/types';

function CategoryForm({
    category, onSubmit, isSaving,
}: {
    category: Category | null;
    onSubmit: (data: { name: string; slug: string; description?: string; is_active?: boolean; image_url?: string }) => void;
    isSaving: boolean;
}) {
    const [name, setName] = useState(category?.name ?? '');
    const [slug, setSlug] = useState(category?.slug ?? '');
    const [slugTouched, setSlugTouched] = useState(!!category);
    const [description, setDescription] = useState(category?.description ?? '');
    const [isActive, setIsActive] = useState(category?.is_active ?? true);
    const [imageUrl, setImageUrl] = useState(category?.image_url ?? '');

    function handleNameChange(v: string) {
        setName(v);
        if (!slugTouched) setSlug(slugify(v));
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit({ name, slug, description: description || undefined, is_active: isActive, image_url: imageUrl || undefined });
            }}
            className="space-y-4 pt-2"
        >
            <div className="space-y-1.5">
                <Label htmlFor="cat-name" className="text-xs font-semibold text-foreground">عنوان دسته</Label>
                <Input id="cat-name" value={name} onChange={(e) => handleNameChange(e.target.value)} required className="h-10 rounded-xl border-[#E8E2D1] bg-white" />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="cat-slug" className="text-xs font-semibold text-foreground">اسلاگ لاتین (URL)</Label>
                <Input id="cat-slug" dir="ltr" value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }} required className="h-10 rounded-xl border-[#E8E2D1] bg-white font-mono text-xs" />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="cat-desc" className="text-xs font-semibold text-foreground">توضیحات کوتاه</Label>
                <Textarea id="cat-desc" value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-xl border-[#E8E2D1] bg-white text-xs" />
            </div>
            <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">آدرس تصویر جلد (Image URL)</Label>
                <Input dir="ltr" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="h-10 rounded-xl border-[#E8E2D1] bg-white font-mono text-xs" />
            </div>
            {category && (
                <div className="flex items-center justify-between rounded-xl border border-[#E8E2D1] bg-white/60 p-3">
                    <Label htmlFor="cat-active" className="text-xs font-semibold text-foreground">نمایش در سایت</Label>
                    <Switch id="cat-active" checked={isActive} onCheckedChange={setIsActive} className="data-[state=checked]:bg-accent" />
                </div>
            )}
            <DialogFooter className="pt-2">
                <Button type="submit" disabled={isSaving} className="h-10 rounded-xl bg-accent text-white hover:bg-accent-hover shadow-2xs">
                    {isSaving ? 'در حال ذخیره...' : 'ثبت دسته‌بندی'}
                </Button>
            </DialogFooter>
        </form>
    );
}

export default function AdminCategoriesPage() {
    const { data: categories, isLoading } = useAdminCategories();
    const createCategory = useCreateCategory();
    const updateCategory = useUpdateCategory();
    const deleteCategory = useDeleteCategory();

    const [editingId, setEditingId] = useState<number | null>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    async function handleDelete(id: number) {
        setDeleteError(null);
        try {
            await deleteCategory.mutateAsync(id);
        } catch (err: any) {
            setDeleteError(err?.response?.data?.detail ?? 'خطا در حذف دسته‌بندی');
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-accent">آتلیه و ساختار</span>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">دسته‌بندی‌ها</h1>
                </div>
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-10 rounded-xl bg-accent text-white hover:bg-accent-hover shadow-2xs">
                            <Plus className="me-1.5 h-4 w-4" /> دسته‌بندی جدید
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-2xl border-[#E8E2D1] bg-[#FAF7F0] sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-base font-bold">ایجاد دسته‌بندی جدید</DialogTitle>
                        </DialogHeader>
                        <CategoryForm
                            category={null}
                            isSaving={createCategory.isPending}
                            onSubmit={async (data) => { await createCategory.mutateAsync(data); setCreateOpen(false); }}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {deleteError && (
                <div className="rounded-xl border border-rose-300 bg-rose-50/80 p-3 text-xs text-rose-800 backdrop-blur-sm">
                    {deleteError}
                </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-[#E8E2D1] bg-white/80 shadow-2xs backdrop-blur-md">
                <Table>
                    <TableHeader className="bg-[#FAF7F0]/80">
                        <TableRow className="border-[#E8E2D1] hover:bg-transparent">
                            <TableHead className="text-xs font-semibold text-foreground">عنوان</TableHead>
                            <TableHead className="text-xs font-semibold text-foreground">اسلاگ URL</TableHead>
                            <TableHead className="text-xs font-semibold text-foreground">وضعیت</TableHead>
                            <TableHead className="w-24 text-center text-xs font-semibold text-foreground">عملیات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={4} className="py-12 text-center text-xs text-muted-foreground">
                                    در حال دریافت دسته‌بندی‌ها...
                                </TableCell>
                            </TableRow>
                        )}
                        {categories?.map((c) => (
                            <TableRow key={c.id} className="border-[#E8E2D1]/60 transition-colors hover:bg-accent/[0.03]">
                                <TableCell className="text-xs font-semibold text-foreground">{c.name}</TableCell>
                                <TableCell className="font-mono text-xs text-muted-foreground">{c.slug}</TableCell>
                                <TableCell>
                                    <Badge className={c.is_active ? 'border-accent/30 bg-accent/15 text-accent' : 'border-[#E8E2D1] bg-muted/50 text-muted-foreground'}>
                                        {c.is_active ? 'فعال' : 'غیرفعال'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center justify-center gap-1">
                                        <Dialog open={editingId === c.id} onOpenChange={(o) => setEditingId(o ? c.id : null)}>
                                            <DialogTrigger asChild>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-accent/10 hover:text-accent">
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="rounded-2xl border-[#E8E2D1] bg-[#FAF7F0] sm:max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle className="text-base font-bold">ویرایش دسته‌بندی</DialogTitle>
                                                </DialogHeader>
                                                <CategoryForm
                                                    category={c}
                                                    isSaving={updateCategory.isPending}
                                                    onSubmit={async (data) => { await updateCategory.mutateAsync({ id: c.id, payload: data }); setEditingId(null); }}
                                                />
                                            </DialogContent>
                                        </Dialog>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-rose-50 hover:text-rose-600">
                                                    ✕
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="rounded-2xl border-[#E8E2D1] bg-[#FAF7F0]">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className="text-base font-bold">حذف دسته‌بندی؟</AlertDialogTitle>
                                                    <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
                                                        اگر اثری به دسته‌بندی «{c.name}» متصل باشد، به منظور جلوگیری از اختلال در کاتالوگ حذف مسدود خواهد شد.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter className="gap-2 sm:gap-0">
                                                    <AlertDialogCancel className="rounded-xl border-[#E8E2D1]">انصراف</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(c.id)} className="rounded-xl bg-rose-600 text-white hover:bg-rose-700">
                                                        تأیید حذف
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
        </div>
    );
}