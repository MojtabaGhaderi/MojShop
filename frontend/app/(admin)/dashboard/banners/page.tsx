'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { useAdminBanners, useCreateBanner, useUpdateBanner, useDeleteBanner } from '@/hooks/use-admin-banners';
import type { Banner, BannerPlacement } from '@/types';

function BannerForm({ onSubmit, isSaving }: { onSubmit: (data: Partial<Banner>) => void; isSaving: boolean }) {
    const [imageUrl, setImageUrl] = useState('');
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [placement, setPlacement] = useState<BannerPlacement>('hero');
    const [sortOrder, setSortOrder] = useState('0');

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit({ image_url: imageUrl, title: title || undefined, subtitle: subtitle || undefined, link_url: linkUrl || undefined, placement, sort_order: Number(sortOrder), is_active: true }); }} className="space-y-4">
            <div className="space-y-2"><Label>آدرس تصویر</Label><Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required /></div>
            <div className="space-y-2"><Label>عنوان (اختیاری)</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div className="space-y-2"><Label>زیرعنوان (اختیاری)</Label><Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} /></div>
            <div className="space-y-2"><Label>لینک (اختیاری)</Label><Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="/products?category=necklaces" /></div>
            <div className="space-y-2">
                <Label>جایگاه</Label>
                <Select value={placement} onValueChange={(v) => setPlacement(v as BannerPlacement)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="hero">بالای صفحه اصلی</SelectItem>
                        <SelectItem value="feature">بالای فوتر</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2"><Label>ترتیب نمایش</Label><Input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} /></div>
            <DialogFooter><Button type="submit" disabled={isSaving}>{isSaving ? 'در حال ذخیره...' : 'ذخیره'}</Button></DialogFooter>
        </form>
    );
}

export default function AdminBannersPage() {
    const { data: banners, isLoading } = useAdminBanners();
    const createBanner = useCreateBanner();
    const updateBanner = useUpdateBanner();
    const deleteBanner = useDeleteBanner();
    const [open, setOpen] = useState(false);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">بنرها</h1>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild><Button><Plus className="me-2 h-4 w-4" /> افزودن بنر</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>بنر جدید</DialogTitle></DialogHeader>
                        <BannerForm isSaving={createBanner.isPending} onSubmit={async (data) => { await createBanner.mutateAsync(data); setOpen(false); }} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader><TableRow><TableHead>تصویر</TableHead><TableHead>عنوان</TableHead><TableHead>جایگاه</TableHead><TableHead>فعال</TableHead><TableHead className="w-16">عملیات</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {isLoading && <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">در حال بارگذاری...</TableCell></TableRow>}
                        {banners?.map((b) => (
                            <TableRow key={b.id}>
                                <TableCell><img src={b.image_url} alt="" className="h-12 w-20 rounded object-cover" /></TableCell>
                                <TableCell>{b.title ?? '—'}</TableCell>
                                <TableCell>{b.placement === 'hero' ? 'بالای صفحه' : 'بالای فوتر'}</TableCell>
                                <TableCell><Switch checked={b.is_active} onCheckedChange={(checked) => updateBanner.mutate({ id: b.id, payload: { is_active: checked } })} /></TableCell>
                                <TableCell><Button size="icon" variant="ghost" onClick={() => deleteBanner.mutate(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}