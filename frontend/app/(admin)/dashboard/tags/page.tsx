// frontend/app/(admin)/dashboard/tags/page.tsx
'use client';

import { useState } from 'react';
import {
    useAdminTags,
    useCreateTag,
    useUpdateTag,
    useDeleteTag,
    type TagPayload,
} from '@/hooks/use-admin-tags';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil } from 'lucide-react';
import { slugify } from '@/lib/utils';
import type { Tag } from '@/types';

function TagForm({
    tag,
    onSubmit,
    isSaving,
}: {
    tag: Tag | null;
    onSubmit: (data: TagPayload) => void;
    isSaving: boolean;
}) {
    const [name, setName] = useState(tag?.name ?? '');
    const [slug, setSlug] = useState(tag?.slug ?? '');
    const [slugTouched, setSlugTouched] = useState(!!tag);

    function handleNameChange(value: string) {
        setName(value);
        if (!slugTouched) {
            setSlug(slugify(value));
        }
    }

    return (
        <form
            className="space-y-4 pt-2"
            onSubmit={(event) => {
                event.preventDefault();
                onSubmit({ name, slug });
            }}
        >
            <div className="space-y-1.5">
                <Label htmlFor="tag-name" className="text-xs font-semibold text-foreground">نام برچسب</Label>
                <Input
                    id="tag-name"
                    value={name}
                    onChange={(event) => handleNameChange(event.target.value)}
                    required
                    className="h-10 rounded-xl border-[#E8E2D1] bg-white"
                />
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="tag-slug" className="text-xs font-semibold text-foreground">اسلاگ لاتین (URL)</Label>
                <Input
                    id="tag-slug"
                    dir="ltr"
                    value={slug}
                    onChange={(event) => {
                        setSlug(event.target.value);
                        setSlugTouched(true);
                    }}
                    required
                    className="h-10 rounded-xl border-[#E8E2D1] bg-white font-mono text-xs"
                />
            </div>

            <DialogFooter className="pt-2">
                <Button type="submit" disabled={isSaving} className="h-10 rounded-xl bg-accent text-white hover:bg-accent-hover shadow-2xs">
                    {isSaving ? 'در حال ذخیره...' : 'ثبت برچسب'}
                </Button>
            </DialogFooter>
        </form>
    );
}

export default function AdminTagsPage() {
    const { data: tags, isLoading } = useAdminTags();
    const createTag = useCreateTag();
    const updateTag = useUpdateTag();
    const deleteTag = useDeleteTag();

    const [editingId, setEditingId] = useState<number | null>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleDelete(id: number) {
        setError(null);
        try {
            await deleteTag.mutateAsync(id);
        } catch (err: any) {
            setError(err?.response?.data?.detail ?? 'خطا در حذف برچسب');
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-accent">آتلیه و ساختار</span>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">برچسب‌ها (Tags)</h1>
                </div>

                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-10 rounded-xl bg-accent text-white hover:bg-accent-hover shadow-2xs">
                            <Plus className="me-1.5 h-4 w-4" /> افزودن برچسب
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="rounded-2xl border-[#E8E2D1] bg-[#FAF7F0] sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-base font-bold">برچسب جدید</DialogTitle>
                        </DialogHeader>
                        <TagForm
                            tag={null}
                            isSaving={createTag.isPending}
                            onSubmit={async (data) => {
                                try {
                                    setError(null);
                                    await createTag.mutateAsync(data);
                                    setCreateOpen(false);
                                } catch (err: any) {
                                    setError(err?.response?.data?.detail ?? 'خطا در ایجاد برچسب');
                                }
                            }}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {error && (
                <div className="rounded-xl border border-rose-300 bg-rose-50/80 p-3 text-xs text-rose-800 backdrop-blur-sm">
                    {error}
                </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-[#E8E2D1] bg-white/80 shadow-2xs backdrop-blur-md">
                <Table>
                    <TableHeader className="bg-[#FAF7F0]/80">
                        <TableRow className="border-[#E8E2D1] hover:bg-transparent">
                            <TableHead className="text-xs font-semibold text-foreground">نام برچسب</TableHead>
                            <TableHead className="text-xs font-semibold text-foreground">اسلاگ URL</TableHead>
                            <TableHead className="w-24 text-center text-xs font-semibold text-foreground">عملیات</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={3} className="py-12 text-center text-xs text-muted-foreground">
                                    در حال بارگذاری برچسب‌ها...
                                </TableCell>
                            </TableRow>
                        )}

                        {tags?.map((tag) => (
                            <TableRow key={tag.id} className="border-[#E8E2D1]/60 transition-colors hover:bg-accent/[0.03]">
                                <TableCell className="text-xs font-semibold text-foreground">{tag.name}</TableCell>
                                <TableCell className="font-mono text-xs text-muted-foreground">{tag.slug}</TableCell>
                                <TableCell>
                                    <div className="flex items-center justify-center gap-1">
                                        <Dialog
                                            open={editingId === tag.id}
                                            onOpenChange={(open) => setEditingId(open ? tag.id : null)}
                                        >
                                            <DialogTrigger asChild>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-accent/10 hover:text-accent">
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                            </DialogTrigger>

                                            <DialogContent className="rounded-2xl border-[#E8E2D1] bg-[#FAF7F0] sm:max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle className="text-base font-bold">ویرایش برچسب</DialogTitle>
                                                </DialogHeader>

                                                <TagForm
                                                    tag={tag}
                                                    isSaving={updateTag.isPending}
                                                    onSubmit={async (data) => {
                                                        try {
                                                            setError(null);
                                                            await updateTag.mutateAsync({
                                                                id: tag.id,
                                                                payload: data,
                                                            });
                                                            setEditingId(null);
                                                        } catch (err: any) {
                                                            setError(err?.response?.data?.detail ?? 'خطا در ویرایش برچسب');
                                                        }
                                                    }}
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
                                                    <AlertDialogTitle className="text-base font-bold">حذف برچسب؟</AlertDialogTitle>
                                                    <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
                                                        این برچسب از تمام آثاری که به آن متصل هستند جدا خواهد شد.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>

                                                <AlertDialogFooter className="gap-2 sm:gap-0">
                                                    <AlertDialogCancel className="rounded-xl border-[#E8E2D1]">انصراف</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDelete(tag.id)}
                                                        className="rounded-xl bg-rose-600 text-white hover:bg-rose-700"
                                                    >
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