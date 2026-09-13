'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { NAV_LINKS, SITE_NAME } from '@/lib/constants';
import { useShopCart } from '@/hooks/use-shop-cart';
import { useCartDrawer } from '@/context/cart-drawer-context';
import { useAuth } from '@/hooks/use-auth';
import MobileNav from './mobile-nav';

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { itemCount } = useShopCart();
  const { open: openCart } = useCartDrawer();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isHome) return;
    function handleScroll() { setScrolled(window.scrollY > 80); }
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHome]);

  const floating = isHome && !scrolled;
  const textClass = floating ? 'text-surface' : 'text-primary';
  const mutedTextClass = floating ? 'text-surface/80' : 'text-primary-muted';
  const hoverBgClass = floating ? 'hover:bg-surface/10' : 'hover:bg-surface-sunken';

  return (
    <>
      <header className={`sticky top-0 z-40 transition-colors duration-300 ${floating ? 'bg-transparent' : 'border-b border-border-default bg-surface/95 backdrop-blur-sm'}`}>
        <div className="mx-auto grid h-14 max-w-7xl grid-cols-3 items-center px-4 sm:h-16 sm:px-6">
          <div className="flex items-center gap-6">
            <button type="button" onClick={() => setMobileNavOpen(true)} className={`flex h-10 w-10 items-center justify-center rounded-lg ${textClass} transition-colors ${hoverBgClass} md:hidden`} aria-label="باز کردن منو">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
            <nav className="hidden items-center gap-7 md:flex" aria-label="منوی اصلی">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className={`text-sm tracking-wide ${mutedTextClass} transition-colors hover:text-accent`}>{link.label}</Link>
              ))}
            </nav>
          </div>

          <Link href="/" className={`justify-self-center text-sm font-medium tracking-[0.18em] ${textClass}`}>{SITE_NAME}</Link>

          <div className="flex items-center justify-self-end gap-2">
            <Link href="/products" className={`flex h-10 w-10 items-center justify-center rounded-lg ${textClass} transition-colors ${hoverBgClass}`} aria-label="جستجو">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            </Link>

            <button type="button" onClick={openCart} className={`relative flex h-10 w-10 items-center justify-center rounded-lg ${textClass} transition-colors ${hoverBgClass}`} aria-label={`سبد خرید (${itemCount} کالا)`}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>
              {itemCount > 0 && <span className="absolute -top-0.5 -end-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-on-accent">{itemCount > 99 ? '99+' : itemCount}</span>}
            </button>

            {isLoading ? (
              <div className={`hidden h-10 w-10 animate-pulse rounded-lg ${floating ? 'bg-surface/10' : 'bg-surface-sunken'} sm:block`} />
            ) : isAuthenticated ? (
              <div className="relative hidden sm:block">
                <button type="button" onClick={() => setUserMenuOpen(!userMenuOpen)} className={`flex h-10 items-center gap-2 rounded-lg px-3 text-sm ${textClass} transition-colors ${hoverBgClass}`}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  <span className="max-w-[80px] truncate">{user?.full_name || user?.email || 'کاربر'}</span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute end-0 top-full z-20 mt-1 w-44 rounded-md border border-border-default bg-surface-elevated py-1">
                      <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-primary transition-colors hover:bg-surface-sunken">پروفایل</Link>
                      <Link href="/orders" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-primary transition-colors hover:bg-surface-sunken">سفارشات</Link>
                      <div className="my-1 border-t border-border-default" />
                      <button onClick={() => { logout(); setUserMenuOpen(false); }} className="block w-full px-4 py-2 text-right text-sm text-error transition-colors hover:bg-surface-sunken">خروج</button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden items-center gap-1 sm:flex">
                <Link href="/login" className={`flex h-10 items-center rounded-lg px-3 text-sm ${textClass} transition-colors ${hoverBgClass}`}>ورود</Link>
                <Link href="/register" className="flex h-10 items-center rounded-lg bg-accent px-3 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover">ثبت‌نام</Link>
              </div>
            )}
          </div>
        </div>
      </header>
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} user={user} isAuthenticated={isAuthenticated} logout={logout} />
    </>
  );
}