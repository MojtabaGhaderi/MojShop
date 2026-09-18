// frontend/app/(admin)/dashboard/home-sections/page.tsx
'use client';

import { useState } from 'react';
import {
    useAdminHomeSections,
    useCreateHomeSection,
    useUpdateHomeSection,
    useDeleteHomeSection,
    type AdminHomeSection,
} from '@/hooks/use-admin-storefront';
import { useCategories } from '@/hooks/use-categories';
import { useAdminTags } from '@/hooks/use-admin-tags';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';

function HomeSectionForm({
    section,
    onSubmit,
    isSaving,
}: {
    section: AdminHomeSection | null;
    onSubmit: (data: Partial<AdminHomeSection>) => void;
    isSaving: boolean;
}) {
    const { data: categories } = useCategories();
    const { data: tags } = useAdminTags();

    const [title, setTitle] = useState(section?.title ?? '');
    const [subtitle, setSubtitle] = useState(section?.subtitle ?? '');
    const [sectionType, setSectionType] = useState(section?.section_type ?? 'tag');
    const [tagId, setTagId] = useState<string>(section?.tag_id ? String(section.tag_id) : 'none');
    const [categoryId, setCategoryId] = useState<string>(section?.category_id ? String(section.category_id) : 'none');
    const [viewAllHref, setViewAllHref] = useState(section?.view_all_href ?? '/products');
    const [sortOrder, setSortOrder] = useState(String(section?.sort_order ?? 0));
    const [isActive, setIsActive] = useState(section?.is_active ?? true);

    const handleTypeChange = (val: string) => {
        setSectionType(val);
        if (val === 'latest') {
            setViewAllHref('/products?sort=newest');
        }
    };

    const handleTagChange = (val: string) => {
        setTagId(val);
        const selectedTag = tags?.find((t) => String(t.id) === val);
        if (selectedTag) {
            setViewAllHref(`/products?tag=${selectedTag.slug}`);
            if (!title) setTitle(selectedTag.name);
        }
    };

    const handleCategoryChange = (val: string) => {
        setCategoryId(val);
        const selectedCat = categories?.find((c) => String(c.id) === val);
        if (selectedCat) {
            setViewAllHref(`/products?category=${selectedCat.slug}`);
            if (!title) setTitle(selectedCat.name);
        }
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit({
                    title,
                    subtitle: subtitle || undefined,
                    section_type: sectionType,
                    tag_id: sectionType === 'tag' && tagId !== 'none' ? Number(tagId) : null,
                    category_id: sectionType === 'category' && categoryId !== 'none' ? Number(categoryId) : null,
                    view_all_href: viewAllHref || '/products',
                    sort_order: Number(sortOrder) || 0,
                    is_active: isActive,
                });
            }}
            className="space-y-4 pt-2"
        >
            <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">عنوان ریل (فارسی)</Label>
                <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: انگشترهای منتخب دست‌ساز"
                    required
                    className="h-10 rounded-xl border-[#E8E2D1] bg-white text-xs"
                />
            </div>

            <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">زیرعنوان (اختیاری)</Label>
                <Input
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="مثال: آثاری با امضای اختصاصی آتلیه موج"
                    className="h-10 rounded-xl border-[#E8E2D1] bg-white text-xs"
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">منبع انتخاب محصولات</Label>
                    <Select value={sectionType} onValueChange={handleTypeChange}>
                        <SelectTrigger className="h-10 rounded-xl border-[#E8E2D1] bg-white text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-[#E8E2D1] bg-[#FAF7F0]">
                            <SelectItem value="tag">بر اساس برچسب (پیشنهادی)</SelectItem>
                            <SelectItem value="category">بر اساس دسته‌بندی</SelectItem>
                            <SelectItem value="latest">جدیدترین‌های کل فروشگاه</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {sectionType === 'tag' ? (
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-foreground">انتخاب برچسب هدف</Label>
                        <Select value={tagId} onValueChange={handleTagChange}>
                            <SelectTrigger className="h-10 rounded-xl border-[#E8E2D1] bg-white text-xs">
                                <SelectValue placeholder="انتخاب برچسب" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-[#E8E2D1] bg-[#FAF7F0]">
                                <SelectItem value="none">بدون برچسب</SelectItem>
                                {tags?.map((t) => (
                                    <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                ) : sectionType === 'category' ? (
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-foreground">انتخاب دسته‌بندی هدف</Label>
                        <Select value={categoryId} onValueChange={handleCategoryChange}>
                            <SelectTrigger className="h-10 rounded-xl border-[#E8E2D1] bg-white text-xs">
                                <SelectValue placeholder="انتخاب دسته‌بندی" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-[#E8E2D1] bg-[#FAF7F0]">
                                <SelectItem value="none">بدون دسته‌بندی</SelectItem>
                                {categories?.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                ) : (
                    <div className="space-y-1.5 opacity-50 pointer-events-none">
                        <Label className="text-xs font-semibold text-foreground">هدف</Label>
                        <Input disabled value="تمامی محصولات جدید" className="h-10 rounded-xl border-[#E8E2D1] bg-muted/40 text-xs" />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">لینک دکمه «مشاهده همه»</Label>
                    <Input
                        dir="ltr"
                        value={viewAllHref}
                        onChange={(e) => setViewAllHref(e.target.value)}
                        className="h-10 rounded-xl border-[#E8E2D1] bg-white font-mono text-xs"
                        required
                    />
                </div>

                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">ترتیب اولویت نمایش</Label>
                    <Input
                        type="number"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="h-10 rounded-xl border-[#E8E2D1] bg-white font-mono text-xs"
                    />
                </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-[#E8E2D1] bg-white/60 p-3">
                <Label className="text-xs font-semibold text-foreground">فعال در صفحه اول</Label>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>

            <DialogFooter className="pt-2">
                <Button type="submit" disabled={isSaving} className="h-10 rounded-xl bg-accent text-white hover:bg-accent-hover shadow-2xs">
                    {isSaving ? 'در حال ذخیره...' : 'ثبت تنظیمات ریل'}
                </Button>
            </DialogFooter>
        </form>
    );
}

export default function AdminHomeSectionsPage() {
    const { data: sections, isLoading } = useAdminHomeSections();
    const createSection = useCreateHomeSection();
    const updateSection = useUpdateHomeSection();
    const deleteSection = useDeleteHomeSection();

    const [createOpen, setCreateOpen] = useState(false);
    const [editingSection, setEditingSection] = useState<AdminHomeSection | null>(null);

    return (
        <div className="space-y-6 select-none" dir="rtl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-accent">ویترین و چیدمان</span>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">ریل‌های صفحه نخست</h1>
                </div>

                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-10 rounded-xl bg-accent text-white hover:bg-accent-hover shadow-2xs">
                            <Plus className="me-1.5 h-4 w-4" /> افزودن ریل جدید
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-2xl border-[#E8E2D1] bg-[#FAF7F0] sm:max-w-md" dir="rtl">
                        <DialogHeader className="text-start">
                            <DialogTitle className="text-base font-bold">ایجاد ریل جدید در صفحه نخست</DialogTitle>
                        </DialogHeader>
                        <HomeSectionForm
                            section={null}
                            isSaving={createSection.isPending}
                            onSubmit={async (data) => {
                                await createSection.mutateAsync(data);
                                setCreateOpen(false);
                            }}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#E8E2D1] bg-white/80 shadow-2xs backdrop-blur-md">
                <Table>
                    <TableHeader className="bg-[#FAF7F0]/80">
                        <TableRow className="border-[#E8E2D1] hover:bg-transparent">
                            <TableHead className="text-xs font-semibold text-foreground">عنوان ریل</TableHead>
                            <TableHead className="text-xs font-semibold text-foreground">منبع انتخاب</TableHead>
                            <TableHead className="text-xs font-semibold text-foreground">لینک ارجاع</TableHead>
                            <TableHead className="text-xs font-semibold text-foreground">ترتیب</TableHead>
                            <TableHead className="text-xs font-semibold text-foreground">وضعیت</TableHead>
                            <TableHead className="w-24 text-center text-xs font-semibold text-foreground">عملیات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={6} className="py-12 text-center text-xs text-muted-foreground">
                                    در حال دریافت اطلاعات ریل‌ها...
                                </TableCell>
                            </TableRow>
                        )}
                        {!isLoading && (!sections || sections.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={6} className="py-12 text-center text-xs text-muted-foreground">
                                    ریلی برای صفحه نخست تعریف نشده است.
                                </TableCell>
                            </TableRow>
                        )}
                        {sections?.map((sec) => (
                            <TableRow key={sec.id} className="border-[#E8E2D1]/60 transition-colors hover:bg-accent/[0.03]">
                                <TableCell>
                                    <p className="text-xs font-semibold text-foreground">{sec.title}</p>
                                    {sec.subtitle && <p className="text-[11px] text-muted-foreground">{sec.subtitle}</p>}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="text-[11px]">
                                        {sec.section_type === 'tag' ? 'برچسب ویژه' : sec.section_type === 'category' ? 'دسته‌بندی' : 'جدیدترین‌ها'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-mono text-xs text-muted-foreground">{sec.view_all_href}</TableCell>
                                <TableCell className="font-mono text-xs text-foreground">{sec.sort_order}</TableCell>
                                <TableCell>
                                    <Switch
                                        checked={sec.is_active}
                                        onCheckedChange={(checked) => updateSection.mutate({ id: sec.id, payload: { is_active: checked } })}
                                    />
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center justify-center gap-1">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => setEditingSection(sec)}
                                            className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-accent/10 hover:text-accent"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-rose-50 hover:text-rose-600">
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="rounded-2xl border-[#E8E2D1] bg-[#FAF7F0]" dir="rtl">
                                                <AlertDialogHeader className="text-start">
                                                    <AlertDialogTitle className="text-base font-bold">حذف این ریل از صفحه اول؟</AlertDialogTitle>
                                                    <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
                                                        این ریل از صفحه اول برداشته می‌شود ولی تگ‌ها و محصولات مربوط به آن بدون تغییر باقی می‌مانند.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter className="gap-2 sm:gap-0">
                                                    <AlertDialogCancel className="rounded-xl border-[#E8E2D1]">انصراف</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => deleteSection.mutate(sec.id)} className="rounded-xl bg-rose-600 text-white hover:bg-rose-700">
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

            <Dialog open={!!editingSection} onOpenChange={(o) => !o && setEditingSection(null)}>
                <DialogContent className="rounded-2xl border-[#E8E2D1] bg-[#FAF7F0] sm:max-w-md" dir="rtl">
                    <DialogHeader className="text-start">
                        <DialogTitle className="text-base font-bold">ویرایش ریل صفحه اول</DialogTitle>
                    </DialogHeader>
                    {editingSection && (
                        <HomeSectionForm
                            section={editingSection}
                            isSaving={updateSection.isPending}
                            onSubmit={async (data) => {
                                await updateSection.mutateAsync({ id: editingSection.id, payload: data });
                                setEditingSection(null);
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}