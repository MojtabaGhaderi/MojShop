
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
    function handleScroll() {
      setScrolled(window.scrollY > 24);
    }

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  /*
   * The header always has its own light surface.
   *
   * At the top:
   *   - more transparent
   *   - subtle blur
   *
   * After scrolling:
   *   - more opaque
   *   - subtle bottom border
   *
   * This avoids the old problem of light text sitting on the
   * light homepage background.
   */
  const headerBackground = scrolled
    ? 'bg-surface/90 border-border-default'
    : 'bg-surface/70 border-transparent';

  const textClass = 'text-primary';
  const mutedTextClass = 'text-primary-muted';

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
            {/* Mobile menu */}
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className={`flex h-11 w-11 items-center justify-start ${textClass} transition-opacity hover:opacity-60 md:hidden`}
              aria-label="باز کردن منو"
            >
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            </button>

            {/* Desktop navigation */}
            <nav
              className="hidden items-center gap-8 md:flex"
              aria-label="منوی اصلی"
            >
              {NAV_LINKS.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== '/' && pathname.startsWith(link.href));

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative py-2 text-sm tracking-wide transition-colors ${isActive
                      ? 'text-primary'
                      : `${mutedTextClass} hover:text-primary`
                      }`}
                  >
                    {link.label}

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

          <Link
            href="/"
            aria-label={SITE_NAME}
            className="justify-self-center"
          >
            {/*
             * Temporary logo container.
             *
             * Replace the contents of this div with the real
             * Mowj logo once the logo file is available.
             *
             * Keeping the container dimensions stable means the
             * rest of the header won't need redesigning later.
             */}
            <div className="flex h-11 min-w-24 items-center justify-center px-2">
              <span className="text-sm font-medium tracking-[0.22em] text-primary">
                {SITE_NAME}
              </span>
            </div>
          </Link>

          {/* =====================================================
              RIGHT / ACTIONS
          ====================================================== */}

          <div className="flex items-center justify-self-end">
            {/* Search */}
            <Link
              href="/products"
              className="flex h-11 w-11 items-center justify-center text-primary transition-opacity hover:opacity-60"
              aria-label="جستجو"
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7.5" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" />
              </svg>
            </Link>

            {/* Cart */}
            <button
              type="button"
              onClick={openCart}
              className="relative flex h-11 w-11 items-center justify-center text-primary transition-opacity hover:opacity-60"
              aria-label={`سبد خرید (${itemCount} کالا)`}
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 8h14l-1 12H6L5 8Z" />
                <path d="M9 8V6a3 3 0 0 1 6 0v2" />
              </svg>

              {itemCount > 0 && (
                <span
                  className="absolute right-1.5 top-1.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-semibold leading-none text-on-accent"
                  aria-hidden="true"
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            {/* =================================================
                AUTH
            ================================================== */}

            {isLoading ? (
              <div
                className="ml-2 hidden h-10 w-20 animate-pulse bg-surface-sunken sm:block"
                aria-hidden="true"
              />
            ) : isAuthenticated ? (
              <div className="relative ml-1 hidden sm:block">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((open) => !open)}
                  className="flex h-11 items-center gap-2 px-3 text-sm text-primary transition-opacity hover:opacity-60"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                >
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="7" r="4" />
                    <path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2" />
                  </svg>

                  <span className="max-w-[100px] truncate">
                    {user?.full_name || user?.email || 'کاربر'}
                  </span>

                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''
                      }`}
                    aria-hidden="true"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <>
                    {/* Click-away layer */}
                    <button
                      type="button"
                      className="fixed inset-0 z-10 h-full w-full cursor-default"
                      onClick={() => setUserMenuOpen(false)}
                      aria-label="بستن منوی کاربر"
                    />

                    {/* User menu */}
                    <div
                      className="absolute end-0 top-full z-20 mt-2 w-48 border border-border-default bg-surface-elevated py-1 shadow-sm"
                      role="menu"
                    >
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-primary transition-colors hover:bg-surface-sunken"
                        role="menuitem"
                      >
                        پروفایل
                      </Link>

                      <Link
                        href="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-primary transition-colors hover:bg-surface-sunken"
                        role="menuitem"
                      >
                        سفارشات
                      </Link>

                      <div className="my-1 border-t border-border-default" />

                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="block w-full px-4 py-2.5 text-right text-sm text-error transition-colors hover:bg-surface-sunken"
                        role="menuitem"
                      >
                        خروج
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="ml-1 hidden items-center gap-1 sm:flex">
                <Link
                  href="/login"
                  className="flex h-11 items-center px-3 text-sm text-primary transition-opacity hover:opacity-60"
                >
                  ورود
                </Link>

                <Link
                  href="/register"
                  className="flex h-10 items-center bg-accent px-4 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover"
                >
                  ثبت‌نام
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile navigation drawer */}
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

