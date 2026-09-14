//dashboard/categories/page.tsx
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
            onSubmit={(e) => { e.preventDefault(); onSubmit({ name, slug, description: description || undefined, is_active: isActive, image_url: imageUrl || undefined }); }}
            className="space-y-4"
        >
            <div className="space-y-2">
                <Label htmlFor="cat-name">نام</Label>
                <Input id="cat-name" value={name} onChange={(e) => handleNameChange(e.target.value)} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="cat-slug">اسلاگ</Label>
                <Input id="cat-slug" value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="cat-desc">توضیحات</Label>
                <Textarea id="cat-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="space-y-2"><Label>آدرس تصویر</Label><Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} /></div>
            {category && (
                <div className="flex items-center justify-between rounded-md border p-3">
                    <Label htmlFor="cat-active">فعال</Label>
                    <Switch id="cat-active" checked={isActive} onCheckedChange={setIsActive} />
                </div>
            )}
            <DialogFooter>
                <Button type="submit" disabled={isSaving}>{isSaving ? 'در حال ذخیره...' : 'ذخیره'}</Button>
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
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">دسته‌بندی‌ها</h1>
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="me-2 h-4 w-4" /> افزودن دسته</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>دسته‌بندی جدید</DialogTitle></DialogHeader>
                        <CategoryForm
                            category={null}
                            isSaving={createCategory.isPending}
                            onSubmit={async (data) => { await createCategory.mutateAsync(data); setCreateOpen(false); }}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>نام</TableHead>
                            <TableHead>اسلاگ</TableHead>
                            <TableHead>وضعیت</TableHead>
                            <TableHead className="w-24">عملیات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">در حال بارگذاری...</TableCell></TableRow>}
                        {categories?.map((c) => (
                            <TableRow key={c.id}>
                                <TableCell className="font-medium">{c.name}</TableCell>
                                <TableCell className="text-muted-foreground">{c.slug}</TableCell>
                                <TableCell><Badge variant={c.is_active ? 'default' : 'secondary'}>{c.is_active ? 'فعال' : 'غیرفعال'}</Badge></TableCell>
                                <TableCell>
                                    <div className="flex gap-1">
                                        <Dialog open={editingId === c.id} onOpenChange={(o) => setEditingId(o ? c.id : null)}>
                                            <DialogTrigger asChild>
                                                <Button size="icon" variant="ghost"><Pencil className="h-4 w-4" /></Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader><DialogTitle>ویرایش دسته‌بندی</DialogTitle></DialogHeader>
                                                <CategoryForm
                                                    category={c}
                                                    isSaving={updateCategory.isPending}
                                                    onSubmit={async (data) => { await updateCategory.mutateAsync({ id: c.id, payload: data }); setEditingId(null); }}
                                                />
                                            </DialogContent>
                                        </Dialog>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size="icon" variant="ghost" className="text-destructive">✕</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>حذف دسته‌بندی؟</AlertDialogTitle>
                                                    <AlertDialogDescription>اگر محصولی به «{c.name}» متصل باشد، حذف انجام نمی‌شود.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>انصراف</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(c.id)}>حذف</AlertDialogAction>
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