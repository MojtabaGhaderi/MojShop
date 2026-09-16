'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import { NAV_LINKS, SITE_NAME } from '@/lib/constants';
import { useShopCart } from '@/hooks/use-shop-cart';
import { useCartDrawer } from '@/context/cart-drawer-context';
import { useAuth } from '@/hooks/use-auth';

import MobileNav from './mobile-nav';

export default function Header() {
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { itemCount } = useShopCart();
  const { open: openCart } = useCartDrawer();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 24);
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Structural header background logic using new Canvas tokens
  const headerBackground = scrolled
    ? 'bg-background/95 border-border shadow-sm'
    : 'bg-background/70 border-transparent';

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md transition-all duration-300 ${headerBackground}`}
      >
        <div className="mx-auto grid h-16 max-w-[1440px] grid-cols-3 items-center px-5 sm:h-[72px] sm:px-8 lg:px-10">

          {/* =====================================================
              LEFT / NAVIGATION
          ====================================================== */}
          <div className="flex min-w-0 items-center">
            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="flex h-11 w-11 items-center justify-start text-foreground transition-colors hover:text-accent md:hidden"
              aria-label="باز کردن منو"
            >
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            </button>

            {/* Desktop navigation */}
            <nav className="hidden items-center gap-8 md:flex" aria-label="منوی اصلی">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative py-2 text-sm tracking-wide transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground hover:text-accent'
                      }`}
                  >
                    {link.label}
                    {/* Active State Indicator using Client Blue */}
                    {isActive && (
                      <span className="absolute inset-x-0 -bottom-1 mx-auto h-px w-4 bg-accent" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* =====================================================
              CENTER / LOGO
          ====================================================== */}
          <Link href="/" aria-label={SITE_NAME} className="justify-self-center transition-opacity hover:opacity-85">
            <div className="flex items-center justify-center">
              <Image
                src="/logo2.png"
                alt={SITE_NAME}
                width={400}
                height={150}
                priority
                className="!h-14 !w-auto sm:!h-20 lg:!h-20 max-w-none"
              />
            </div>
          </Link>

          {/* =====================================================
              RIGHT / ACTIONS
          ====================================================== */}
          <div className="flex items-center gap-2 justify-self-end sm:gap-4">

            {/* Search */}
            <Link
              href="/products"
              className="flex h-11 w-11 items-center justify-center text-foreground transition-colors hover:text-accent"
              aria-label="جستجو"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7.5" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" />
              </svg>
            </Link>

            {/* Cart with Client Blue Badge */}
            <button
              type="button"
              onClick={openCart}
              className="relative flex h-11 w-11 items-center justify-center text-foreground transition-colors hover:text-accent"
              aria-label={`سبد خرید (${itemCount} کالا)`}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 8h14l-1 12H6L5 8Z" />
                <path d="M9 8V6a3 3 0 0 1 6 0v2" />
              </svg>

              {itemCount > 0 && (
                <span
                  className="absolute right-1.5 top-1.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold leading-none text-accent-foreground"
                  aria-hidden="true"
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            {/* =================================================
                AUTH - Editorial Text Links (No heavy buttons)
            ================================================== */}
            {isLoading ? (
              <div className="ml-2 hidden h-5 w-16 animate-pulse bg-muted sm:block" aria-hidden="true" />
            ) : isAuthenticated ? (
              <div className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((open) => !open)}
                  className="flex h-11 items-center gap-2 text-sm text-foreground transition-colors hover:text-accent"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                >
                  <span className="max-w-[100px] truncate">
                    {user?.full_name || user?.email || 'کاربر'}
                  </span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <>
                    <button type="button" className="fixed inset-0 z-10 h-full w-full cursor-default" onClick={() => setUserMenuOpen(false)} aria-label="بستن منوی کاربر" />
                    <div className="absolute end-0 top-full z-20 mt-2 w-48 rounded-sm border border-border bg-card py-1 shadow-md" role="menu">
                      <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-accent/10 hover:text-accent-foreground" role="menuitem">پروفایل</Link>
                      <Link href="/orders" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-accent/10 hover:text-accent-foreground" role="menuitem">سفارشات</Link>
                      <div className="my-1 border-t border-border" />
                      <button type="button" onClick={() => { logout(); setUserMenuOpen(false); }} className="block w-full px-4 py-2.5 text-right text-sm text-destructive transition-colors hover:bg-destructive/10" role="menuitem">خروج</button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden items-center gap-3 text-sm text-muted-foreground sm:flex">
                <Link href="/login" className="transition-colors hover:text-accent">ورود</Link>
                <span className="h-3 w-px bg-border" aria-hidden="true" />
                <Link href="/register" className="text-foreground transition-colors hover:text-accent">ثبت‌نام</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <MobileNav
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        user={user}
        isAuthenticated={isAuthenticated}
        logout={logout}
      />
    </>
  );
}