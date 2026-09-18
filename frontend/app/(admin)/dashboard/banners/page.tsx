// frontend/app/(admin)/dashboard/banners/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Pencil, UploadCloud, Loader2 } from 'lucide-react';
import { useAdminBanners, useCreateBanner, useUpdateBanner, useDeleteBanner } from '@/hooks/use-admin-banners';
import { api } from '@/lib/api';
import type { Banner, BannerPlacement } from '@/types';

function BannerForm({
    banner,
    onSubmit,
    isSaving,
}: {
    banner: Banner | null;
    onSubmit: (data: Partial<Banner>) => void;
    isSaving: boolean;
}) {
    const [imageUrl, setImageUrl] = useState(banner?.image_url ?? '');
    const [secondaryImageUrl, setSecondaryImageUrl] = useState(banner?.secondary_image_url ?? '');
    const [title, setTitle] = useState(banner?.title ?? '');
    const [subtitle, setSubtitle] = useState(banner?.subtitle ?? '');
    const [linkUrl, setLinkUrl] = useState(banner?.link_url ?? '');
    const [placement, setPlacement] = useState<BannerPlacement>(banner?.placement ?? 'hero');
    const [sortOrder, setSortOrder] = useState(String(banner?.sort_order ?? 0));
    const [isActive, setIsActive] = useState(banner?.is_active ?? true);

    const [uploadingPrimary, setUploadingPrimary] = useState(false);
    const [uploadingSecondary, setUploadingSecondary] = useState(false);

    // Upload file directly to FastAPI backend and receive the public URL
    const uploadImage = async (file: File, isPrimary: boolean) => {
        const formData = new FormData();
        formData.append('file', file);

        if (isPrimary) setUploadingPrimary(true);
        else setUploadingSecondary(true);

        try {
            const { data } = await api.post<{ url: string }>('/uploads/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (isPrimary) setImageUrl(data.url);
            else setSecondaryImageUrl(data.url);
        } catch {
            alert('خطا در بارگذاری تصویر روی سرور');
        } finally {
            if (isPrimary) setUploadingPrimary(false);
            else setUploadingSecondary(false);
        }
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit({
                    image_url: imageUrl,
                    secondary_image_url: secondaryImageUrl || undefined,
                    title: title || undefined,
                    subtitle: subtitle || undefined,
                    link_url: linkUrl || undefined,
                    placement,
                    sort_order: Number(sortOrder),
                    is_active: isActive,
                });
            }}
            className="space-y-4 pt-2"
        >
            {/* Primary Image */}
            <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">تصویر اصلی بنر</Label>
                <div className="flex gap-2">
                    <Input
                        dir="ltr"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        required
                        placeholder="آدرس اینترنتی یا فایل آپلود کنید..."
                        className="h-10 rounded-xl border-[#E8E2D1] bg-white font-mono text-xs"
                    />
                    <label className="flex h-10 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-accent/40 bg-accent/10 px-3.5 text-xs font-semibold text-accent transition-colors hover:bg-accent/20">
                        {uploadingPrimary ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <UploadCloud className="h-4 w-4" />
                                <span>آپلود</span>
                            </>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingPrimary}
                            onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) uploadImage(f, true);
                            }}
                        />
                    </label>
                </div>
                {imageUrl && (
                    <div className="mt-1.5 overflow-hidden rounded-xl border border-[#E8E2D1]">
                        <img src={imageUrl} alt="پیش‌نمایش" className="h-24 w-full object-cover" />
                    </div>
                )}
            </div>

            {/* Secondary Image (Visible for Bottom Feature Banner) */}
            {placement === 'feature' && (
                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">تصویر دوم بنر (چیدمان زوج روایی)</Label>
                    <div className="flex gap-2">
                        <Input
                            dir="ltr"
                            value={secondaryImageUrl}
                            onChange={(e) => setSecondaryImageUrl(e.target.value)}
                            placeholder="آدرس یا آپلود عکس دوم..."
                            className="h-10 rounded-xl border-[#E8E2D1] bg-white font-mono text-xs"
                        />
                        <label className="flex h-10 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-accent/40 bg-accent/10 px-3.5 text-xs font-semibold text-accent transition-colors hover:bg-accent/20">
                            {uploadingSecondary ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <UploadCloud className="h-4 w-4" />
                                    <span>آپلود</span>
                                </>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={uploadingSecondary}
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) uploadImage(f, false);
                                }}
                            />
                        </label>
                    </div>
                    {secondaryImageUrl && (
                        <div className="mt-1.5 overflow-hidden rounded-xl border border-[#E8E2D1]">
                            <img src={secondaryImageUrl} alt="پیش‌نمایش دوم" className="h-24 w-full object-cover" />
                        </div>
                    )}
                </div>
            )}

            <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">عنوان بنر (اختیاری)</Label>
                <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: جلوه ماندگار نقره"
                    className="h-10 rounded-xl border-[#E8E2D1] bg-white text-xs"
                />
            </div>

            <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">زیرعنوان (اختیاری)</Label>
                <Input
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="مثال: طراحی منحصربه‌فرد با الهام از خطوط مینیمال"
                    className="h-10 rounded-xl border-[#E8E2D1] bg-white text-xs"
                />
            </div>

            <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">لینک ارجاع (کلیک روی بنر)</Label>
                <Input
                    dir="ltr"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="/products?tag=featured"
                    className="h-10 rounded-xl border-[#E8E2D1] bg-white font-mono text-xs"
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">جایگاه نمایش</Label>
                    <Select value={placement} onValueChange={(v) => setPlacement(v as BannerPlacement)}>
                        <SelectTrigger className="h-10 rounded-xl border-[#E8E2D1] bg-white text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-[#E8E2D1] bg-[#FAF7F0]">
                            <SelectItem value="hero">اسلایدر هیرو (بالای صفحه)</SelectItem>
                            <SelectItem value="feature">روایت اثر (بالای فوتر)</SelectItem>
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

            <div className="flex items-center justify-between rounded-xl border border-[#E8E2D1] bg-white/60 p-3">
                <Label className="text-xs font-semibold text-foreground">فعال در ویترین</Label>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>

            <DialogFooter className="pt-2">
                <Button
                    type="submit"
                    disabled={isSaving || uploadingPrimary || uploadingSecondary}
                    className="h-10 rounded-xl bg-accent text-white hover:bg-accent-hover shadow-2xs cursor-pointer"
                >
                    {isSaving ? 'در حال ذخیره...' : 'ثبت بنر'}
                </Button>
            </DialogFooter>
        </form>
    );
}

export default function AdminBannersPage() {
    const { data: banners, isLoading } = useAdminBanners();
    const createBanner = useCreateBanner();
    const updateBanner = useUpdateBanner();
    const deleteBanner = useDeleteBanner();

    const [open, setOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

    return (
        <div className="space-y-6 select-none" dir="rtl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-accent">ویترین و تصویر</span>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">بنرهای تبلیغاتی</h1>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-10 rounded-xl bg-accent text-white hover:bg-accent-hover shadow-2xs">
                            <Plus className="me-1.5 h-4 w-4" /> بنر جدید
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-2xl border-[#E8E2D1] bg-[#FAF7F0] sm:max-w-md" dir="rtl">
                        <DialogHeader className="text-start">
                            <DialogTitle className="text-base font-bold">ایجاد بنر جدید</DialogTitle>
                        </DialogHeader>
                        <BannerForm
                            banner={null}
                            isSaving={createBanner.isPending}
                            onSubmit={async (data) => {
                                await createBanner.mutateAsync(data);
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
                            <TableHead className="text-xs font-semibold text-foreground">پیش‌نمایش</TableHead>
                            <TableHead className="text-xs font-semibold text-foreground">عنوان</TableHead>
                            <TableHead className="text-xs font-semibold text-foreground">جایگاه</TableHead>
                            <TableHead className="text-xs font-semibold text-foreground">ترتیب</TableHead>
                            <TableHead className="text-xs font-semibold text-foreground">فعال</TableHead>
                            <TableHead className="w-24 text-center text-xs font-semibold text-foreground">عملیات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={6} className="py-12 text-center text-xs text-muted-foreground">
                                    در حال دریافت بنرها...
                                </TableCell>
                            </TableRow>
                        )}
                        {!isLoading && (!banners || banners.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={6} className="py-12 text-center text-xs text-muted-foreground">
                                    هیچ بنری ثبت نشده است.
                                </TableCell>
                            </TableRow>
                        )}
                        {banners?.map((b) => (
                            <TableRow key={b.id} className="border-[#E8E2D1]/60 transition-colors hover:bg-accent/[0.03]">
                                <TableCell>
                                    <div className="flex items-center gap-1.5">
                                        <img
                                            src={b.image_url}
                                            alt=""
                                            className="h-12 w-20 rounded-xl border border-[#E8E2D1] object-cover shadow-2xs"
                                        />
                                        {b.secondary_image_url && (
                                            <img
                                                src={b.secondary_image_url}
                                                alt=""
                                                className="h-12 w-12 rounded-xl border border-[#E8E2D1] object-cover shadow-2xs"
                                                title="تصویر مکمل"
                                            />
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-xs font-semibold text-foreground">{b.title ?? '—'}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                    {b.placement === 'hero' ? 'اسلایدر هیرو (بالا)' : 'روایت اثر (پایین)'}
                                </TableCell>
                                <TableCell className="font-mono text-xs text-foreground">{b.sort_order}</TableCell>
                                <TableCell>
                                    <Switch
                                        checked={b.is_active}
                                        onCheckedChange={(checked) => updateBanner.mutate({ id: b.id, payload: { is_active: checked } })}
                                    />
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center justify-center gap-1">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => setEditingBanner(b)}
                                            className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-accent/10 hover:text-accent"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => deleteBanner.mutate(b.id)}
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

            <Dialog open={!!editingBanner} onOpenChange={(o) => !o && setEditingBanner(null)}>
                <DialogContent className="rounded-2xl border-[#E8E2D1] bg-[#FAF7F0] sm:max-w-md" dir="rtl">
                    <DialogHeader className="text-start">
                        <DialogTitle className="text-base font-bold">ویرایش بنر</DialogTitle>
                    </DialogHeader>
                    {editingBanner && (
                        <BannerForm
                            banner={editingBanner}
                            isSaving={updateBanner.isPending}
                            onSubmit={async (data) => {
                                await updateBanner.mutateAsync({ id: editingBanner.id, payload: data });
                                setEditingBanner(null);
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}