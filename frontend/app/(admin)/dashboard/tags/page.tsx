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

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

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
            className="space-y-4"
            onSubmit={(event) => {
                event.preventDefault();

                onSubmit({
                    name,
                    slug,
                });
            }}
        >
            <div className="space-y-2">
                <Label htmlFor="tag-name">
                    نام
                </Label>

                <Input
                    id="tag-name"
                    value={name}
                    onChange={(event) =>
                        handleNameChange(event.target.value)
                    }
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="tag-slug">
                    اسلاگ
                </Label>

                <Input
                    id="tag-slug"
                    value={slug}
                    onChange={(event) => {
                        setSlug(event.target.value);
                        setSlugTouched(true);
                    }}
                    required
                />
            </div>

            <DialogFooter>
                <Button
                    type="submit"
                    disabled={isSaving}
                >
                    {isSaving
                        ? 'در حال ذخیره...'
                        : 'ذخیره'}
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

    const [editingId, setEditingId] =
        useState<number | null>(null);

    const [createOpen, setCreateOpen] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);


    async function handleDelete(id: number) {
        setError(null);

        try {
            await deleteTag.mutateAsync(id);
        } catch (err: any) {
            setError(
                err?.response?.data?.detail ??
                'خطا در حذف برچسب'
            );
        }
    }


    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">
                    برچسب‌ها
                </h1>

                <Dialog
                    open={createOpen}
                    onOpenChange={setCreateOpen}
                >
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="me-2 h-4 w-4" />
                            افزودن برچسب
                        </Button>
                    </DialogTrigger>

                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                برچسب جدید
                            </DialogTitle>
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
                                    setError(
                                        err?.response?.data?.detail ??
                                        'خطا در ایجاد برچسب'
                                    );
                                }
                            }}
                        />
                    </DialogContent>
                </Dialog>
            </div>


            {error && (
                <p className="text-sm text-destructive">
                    {error}
                </p>
            )}


            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>
                                نام
                            </TableHead>

                            <TableHead>
                                اسلاگ
                            </TableHead>

                            <TableHead className="w-24">
                                عملیات
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell
                                    colSpan={3}
                                    className="py-8 text-center text-muted-foreground"
                                >
                                    در حال بارگذاری...
                                </TableCell>
                            </TableRow>
                        )}

                        {tags?.map((tag) => (
                            <TableRow key={tag.id}>
                                <TableCell className="font-medium">
                                    {tag.name}
                                </TableCell>

                                <TableCell className="text-muted-foreground">
                                    {tag.slug}
                                </TableCell>

                                <TableCell>
                                    <div className="flex gap-1">

                                        <Dialog
                                            open={editingId === tag.id}
                                            onOpenChange={(open) =>
                                                setEditingId(
                                                    open
                                                        ? tag.id
                                                        : null
                                                )
                                            }
                                        >
                                            <DialogTrigger asChild>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>

                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>
                                                        ویرایش برچسب
                                                    </DialogTitle>
                                                </DialogHeader>

                                                <TagForm
                                                    tag={tag}
                                                    isSaving={
                                                        updateTag.isPending
                                                    }
                                                    onSubmit={async (data) => {
                                                        try {
                                                            setError(null);

                                                            await updateTag.mutateAsync({
                                                                id: tag.id,
                                                                payload: data,
                                                            });

                                                            setEditingId(null);
                                                        } catch (err: any) {
                                                            setError(
                                                                err?.response?.data?.detail ??
                                                                'خطا در ویرایش برچسب'
                                                            );
                                                        }
                                                    }}
                                                />
                                            </DialogContent>
                                        </Dialog>


                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="text-destructive"
                                                >
                                                    ✕
                                                </Button>
                                            </AlertDialogTrigger>

                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>
                                                        حذف برچسب؟
                                                    </AlertDialogTitle>

                                                    <AlertDialogDescription>
                                                        این برچسب از محصولاتی که
                                                        به آن متصل هستند نیز
                                                        حذف خواهد شد.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>

                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>
                                                        انصراف
                                                    </AlertDialogCancel>

                                                    <AlertDialogAction
                                                        onClick={() =>
                                                            handleDelete(tag.id)
                                                        }
                                                    >
                                                        حذف
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