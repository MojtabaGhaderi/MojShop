// frontend/app/(admin)/dashboard/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAdminSiteSettings, useUpdateSiteSettings, type SiteSettingsData } from '@/hooks/use-admin-storefront';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Check, Loader2 } from 'lucide-react';

export default function AdminSettingsPage() {
    const { data: settings, isLoading } = useAdminSiteSettings();
    const updateSettings = useUpdateSiteSettings();

    const [form, setForm] = useState<SiteSettingsData>({
        site_title: '',
        tagline: '',
        bio: '',
        phone: '',
        email: '',
        instagram_handle: '',
        telegram_handle: '',
        address: '',
        support_hours: '',
    });

    const [savedSuccess, setSavedSuccess] = useState(false);

    useEffect(() => {
        if (settings) {
            setForm({
                site_title: settings.site_title ?? '',
                tagline: settings.tagline ?? '',
                bio: settings.bio ?? '',
                phone: settings.phone ?? '',
                email: settings.email ?? '',
                instagram_handle: settings.instagram_handle ?? '',
                telegram_handle: settings.telegram_handle ?? '',
                address: settings.address ?? '',
                support_hours: settings.support_hours ?? '',
            });
        }
    }, [settings]);

    const handleChange = (key: keyof SiteSettingsData, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateSettings.mutateAsync(form);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center text-xs text-muted-foreground">
                در حال بارگذاری تنظیمات فروشگاه...
            </div>
        );
    }

    return (
        <div className="space-y-6 select-none" dir="rtl">
            <div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-accent">پیکربندی پایه</span>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">تنظیمات فروشگاه و فوتر</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Identity Section */}
                <Card className="rounded-2xl border-[#E8E2D1] bg-white/80 shadow-2xs backdrop-blur-md">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold text-foreground">هویت و روایت برند</CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                            عناوین و متونی که در هدر، فوتر و تگ‌های جستجوی گوگل نمایش داده می‌شوند.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-foreground">عنوان فروشگاه</Label>
                                <Input
                                    value={form.site_title}
                                    onChange={(e) => handleChange('site_title', e.target.value)}
                                    placeholder="موج گالری"
                                    className="h-10 rounded-xl border-[#E8E2D1] bg-white text-xs"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-foreground">شعار برند (Tagline)</Label>
                                <Input
                                    value={form.tagline}
                                    onChange={(e) => handleChange('tagline', e.target.value)}
                                    placeholder="گالری زیورآلات نقره دست‌ساز"
                                    className="h-10 rounded-xl border-[#E8E2D1] bg-white text-xs"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-foreground">بیوگرافی و داستان برند (فوتر)</Label>
                            <Textarea
                                rows={3}
                                value={form.bio}
                                onChange={(e) => handleChange('bio', e.target.value)}
                                placeholder="خلق آثاری از جنس نقره خالص با الهام از امواج بی‌پایان دریا..."
                                className="rounded-xl border-[#E8E2D1] bg-white text-xs leading-relaxed"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Information */}
                <Card className="rounded-2xl border-[#E8E2D1] bg-white/80 shadow-2xs backdrop-blur-md">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold text-foreground">ارتباط با مشتریان و آتلیه</CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                            شماره‌های پشتیبانی، ساعات پاسخگویی و نشانی نمایش داده شده در پاورقی سایت.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-foreground">تلفن پشتیبانی</Label>
                                <Input
                                    dir="ltr"
                                    value={form.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    placeholder="۰۲۱-۸۸۸۸۸۸۸۸"
                                    className="h-10 rounded-xl border-[#E8E2D1] bg-white font-mono text-xs"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-foreground">نشانی ایمیل</Label>
                                <Input
                                    dir="ltr"
                                    value={form.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    placeholder="info@mowjgallery.com"
                                    className="h-10 rounded-xl border-[#E8E2D1] bg-white font-mono text-xs"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-foreground">اینستاگرام</Label>
                                <Input
                                    dir="ltr"
                                    value={form.instagram_handle}
                                    onChange={(e) => handleChange('instagram_handle', e.target.value)}
                                    placeholder="@mowj_gallery"
                                    className="h-10 rounded-xl border-[#E8E2D1] bg-white font-mono text-xs"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-foreground">تلگرام پشتیبانی</Label>
                                <Input
                                    dir="ltr"
                                    value={form.telegram_handle}
                                    onChange={(e) => handleChange('telegram_handle', e.target.value)}
                                    placeholder="@mowj_support"
                                    className="h-10 rounded-xl border-[#E8E2D1] bg-white font-mono text-xs"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-foreground">ساعات پاسخگویی و روزهای کاری</Label>
                            <Input
                                value={form.support_hours}
                                onChange={(e) => handleChange('support_hours', e.target.value)}
                                placeholder="شنبه تا پنج‌شنبه از ساعت ۱۰:۰۰ الی ۱۹:۰۰"
                                className="h-10 rounded-xl border-[#E8E2D1] bg-white text-xs"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-foreground">آدرس آتلیه / دفتر مرکزی</Label>
                            <Input
                                value={form.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                                placeholder="تهران، خیابان ولیعصر..."
                                className="h-10 rounded-xl border-[#E8E2D1] bg-white text-xs"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Action Button */}
                <div className="flex items-center gap-3">
                    <Button
                        type="submit"
                        disabled={updateSettings.isPending}
                        className="h-11 rounded-xl bg-accent px-6 text-xs font-semibold text-white hover:bg-accent-hover shadow-2xs cursor-pointer"
                    >
                        {updateSettings.isPending ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                در حال ذخیره تغییرات...
                            </span>
                        ) : (
                            'ذخیره تمام تنظیمات'
                        )}
                    </Button>

                    {savedSuccess && (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 animate-in fade-in">
                            <Check className="h-4 w-4" />
                            تنظیمات با موفقیت به‌روزرسانی شد.
                        </span>
                    )}
                </div>
            </form>
        </div>
    );
}