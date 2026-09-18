// frontend/app/(admin)/dashboard/layout.tsx
'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { SITE_NAME } from '@/lib/constants';

import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    FolderTree,
    Users,
    Tags,
    Menu,
    ImageIcon,
    LayoutTemplate,
    ShieldCheck,
    Settings2,
    ExternalLink,
    LogOut,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface NavSection {
    title: string;
    items: {
        href: string;
        label: string;
        icon: React.ComponentType<{ className?: string }>;
    }[];
}

const NAV_GROUPS: NavSection[] = [
    {
        title: 'مرور و فروش',
        items: [
            { href: '/dashboard', label: 'آمار و گزارش‌ها', icon: LayoutDashboard },
            { href: '/dashboard/orders', label: 'سفارش‌ها', icon: ShoppingCart },
            { href: '/dashboard/customers', label: 'مشتریان', icon: Users },
        ],
    },
    {
        title: 'آتلیه و کاتالوگ',
        items: [
            { href: '/dashboard/products', label: 'آثار و محصولات', icon: Package },
            { href: '/dashboard/categories', label: 'دسته‌بندی‌ها', icon: FolderTree },
            { href: '/dashboard/tags', label: 'برچسب‌ها', icon: Tags },
        ],
    },
    {
        title: 'ویترین و پیکربندی',
        items: [
            { href: '/dashboard/home-sections', label: 'ریل‌های صفحه اول', icon: LayoutTemplate },
            { href: '/dashboard/banners', label: 'بنرهای تبلیغاتی', icon: ImageIcon },
            { href: '/dashboard/trust-badges', label: 'ستون‌های اعتماد', icon: ShieldCheck },
            { href: '/dashboard/settings', label: 'تنظیمات و فوتر', icon: Settings2 },
        ],
    },
];

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
    return (
        <div className="flex h-full flex-col justify-between py-2">
            <div className="space-y-6">
                {NAV_GROUPS.map((group) => (
                    <div key={group.title} className="space-y-1.5">
                        <span className="px-3 text-[10px] font-semibold tracking-wider text-accent uppercase">
                            {group.title}
                        </span>
                        <div className="space-y-0.5">
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={onNavigate}
                                        className={cn(
                                            'group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-200',
                                            active
                                                ? 'border border-accent/30 bg-accent/15 text-accent shadow-2xs font-semibold'
                                                : 'text-foreground/75 hover:bg-white/80 hover:text-foreground hover:ps-3.5'
                                        )}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <Icon className={cn('h-4 w-4 transition-colors', active ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground')} />
                                            <span>{item.label}</span>
                                        </div>
                                        {active && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Storefront Return & Version */}
            <div className="border-t border-[#E8E2D1]/80 pt-4 px-2 space-y-2">
                <Link
                    href="/"
                    target="_blank"
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-white/80 hover:text-foreground"
                >
                    <span>مشاهده وب‌سایت</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                </Link>
                <div className="px-3 text-[10px] text-muted-foreground/60 font-mono">
                    Mowj Studio v1.0
                </div>
            </div>
        </div>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading, isAuthenticated, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

    React.useEffect(() => {
        if (isLoading) return;
        if (!isAuthenticated || !user?.is_admin) router.replace('/login');
    }, [isLoading, isAuthenticated, user, router]);

    if (isLoading || !user?.is_admin) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F7F5F0]">
                <div className="flex items-center gap-3 rounded-2xl border border-[#E8E2D1] bg-white/80 px-6 py-4 shadow-sm backdrop-blur-md">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                    <span className="text-xs font-medium text-muted-foreground">در حال بارگذاری پنل مدیریت...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col md:flex-row">
            {/* ── Mobile Header ── */}
            <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#E8E2D1] bg-white/80 px-4 backdrop-blur-md md:hidden">
                <div className="flex items-center gap-3">
                    <Image src="/logo2.png" alt={SITE_NAME} width={100} height={32} className="h-7 w-auto object-contain" />
                    <span className="text-xs font-bold text-foreground">پنل مدیریت</span>
                </div>

                <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                    <SheetTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-9 w-9 border border-[#E8E2D1] bg-white/60">
                            <Menu className="h-5 w-5 text-foreground" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-72 border-e border-[#E8E2D1] bg-[#FAF7F0] p-5">
                        <div className="mb-6 flex items-center justify-between border-b border-[#E8E2D1] pb-4">
                            <Image src="/logo2.png" alt={SITE_NAME} width={110} height={36} className="h-8 w-auto object-contain" />
                            <span className="text-[11px] font-semibold text-accent">آتلیه موج</span>
                        </div>
                        <SidebarContent pathname={pathname} onNavigate={() => setMobileNavOpen(false)} />
                    </SheetContent>
                </Sheet>
            </div>

            {/* ── Desktop Architectural Sidebar ── */}
            <aside className="hidden w-64 shrink-0 flex-col border-s border-[#E8E2D1] bg-gradient-to-b from-[#FAF7F0] via-[#F7F4EC] to-[#F2EDE1] p-5 md:flex">
                {/* Header Marquee */}
                <div className="mb-6 flex items-center gap-3 border-b border-[#E8E2D1] pb-5">
                    <Link href="/" className="transition-opacity hover:opacity-85">
                        <Image src="/logo2.png" alt={SITE_NAME} width={120} height={38} className="h-9 w-auto object-contain" priority />
                    </Link>
                    <div className="h-6 w-px bg-[#E8E2D1]" />
                    <div>
                        <span className="block text-[11px] font-bold text-foreground leading-tight">پنل مدیریت</span>
                        <span className="block text-[9px] text-accent font-medium">سفارش‌ها و محتوا</span>
                    </div>
                </div>

                {/* Navigation list */}
                <div className="flex-1 overflow-y-auto scrollbar-thin pe-1">
                    <SidebarContent pathname={pathname} />
                </div>

                {/* User bar */}
                <div className="mt-4 flex items-center justify-between rounded-xl border border-[#E8E2D1] bg-white/70 p-2.5 shadow-2xs">
                    <div className="min-w-0 pr-1">
                        <p className="truncate text-xs font-semibold text-foreground">{user.full_name || 'مدیر فروشگاه'}</p>
                        <p className="truncate text-[10px] text-muted-foreground font-mono">{user.email}</p>
                    </div>
                    <button
                        type="button"
                        onClick={logout}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-600"
                        title="خروج از حساب"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </aside>

            {/* ── Main Canvas Viewport ── */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-6xl">{children}</div>
            </main>
        </div>
    );
}