'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    FolderTree,
    Users,
    Tags,
    Menu
} from 'lucide-react'; import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

const NAV_ITEMS = [
    { href: '/dashboard', label: 'داشبورد', icon: LayoutDashboard },
    { href: '/dashboard/products', label: 'محصولات', icon: Package },
    { href: '/dashboard/orders', label: 'سفارش‌ها', icon: ShoppingCart },
    { href: '/dashboard/categories', label: 'دسته‌بندی‌ها', icon: FolderTree },
    { href: '/dashboard/tags', label: 'برچسب‌ها', icon: Tags },
    { href: '/dashboard/customers', label: 'مشتریان', icon: Users },
];

function SidebarNav({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
    return (
        <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                            'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                            active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    useEffect(() => {
        if (isLoading) return;
        if (!isAuthenticated || !user?.is_admin) router.replace('/login');
    }, [isLoading, isAuthenticated, user, router]);

    if (isLoading || !user?.is_admin) {
        return (
            <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
                در حال بررسی دسترسی...
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col md:flex-row">
            <div className="flex items-center justify-between border-b p-3 md:hidden">
                <span className="text-lg font-semibold">پنل مدیریت</span>
                <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                    <SheetTrigger asChild>
                        <Button size="icon" variant="ghost"><Menu className="h-5 w-5" /></Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-64">
                        <div className="mb-6 mt-4 px-1 text-lg font-semibold">پنل مدیریت</div>
                        <SidebarNav pathname={pathname} onNavigate={() => setMobileNavOpen(false)} />
                    </SheetContent>
                </Sheet>
            </div>

            <aside className="hidden w-60 shrink-0 border-l bg-muted/30 p-4 md:block">
                <div className="mb-6 px-2 text-lg font-semibold">پنل مدیریت</div>
                <SidebarNav pathname={pathname} />
            </aside>

            <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
    );
}