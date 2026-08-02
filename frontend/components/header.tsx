'use client';

import Link from 'next/link';
import { useState } from 'react';
import { NAV_LINKS, SITE_NAME } from '@/lib/constants';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import MobileNav from './mobile-nav';

export default function Header() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border-default bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6">
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-primary transition-colors hover:bg-surface-sunken"
            aria-label="باز کردن منو"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>

          {/* Logo */}
          <Link href="/" className="text-lg font-bold text-primary sm:text-xl">
            {SITE_NAME}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex" aria-label="منوی اصلی">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-primary-muted transition-colors hover:text-accent"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions: search + cart + auth */}
          <div className="flex items-center gap-2">
            {/* Search icon */}
            <Link
              href="/products"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-primary transition-colors hover:bg-surface-sunken"
              aria-label="جستجو"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </Link>

            {/* Cart icon */}
            <Link
              href="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-lg text-primary transition-colors hover:bg-surface-sunken"
              aria-label={`سبد خرید (${itemCount} کالا)`}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -end-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-on-accent">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* Auth section */}
            {isLoading ? (
              <div className="hidden h-10 w-10 animate-pulse rounded-lg bg-surface-sunken sm:block" />
            ) : isAuthenticated ? (
              /* Logged in — user dropdown */
              <div className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-primary transition-colors hover:bg-surface-sunken"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span className="max-w-[80px] truncate">
                    {user?.full_name || user?.email || 'کاربر'}
                  </span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute end-0 top-full z-20 mt-1 w-44 rounded-lg border border-border-default bg-surface py-1 shadow-lg">
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-primary transition-colors hover:bg-surface-sunken"
                      >
                        پروفایل
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-primary transition-colors hover:bg-surface-sunken"
                      >
                        سفارشات
                      </Link>
                      <div className="my-1 border-t border-border-default" />
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-right text-sm text-red-500 transition-colors hover:bg-surface-sunken"
                      >
                        خروج
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Logged out — login/register buttons */
              <div className="hidden items-center gap-2 sm:flex">
                <Link
                  href="/login"
                  className="flex h-10 items-center rounded-lg px-3 text-sm font-medium text-primary transition-colors hover:bg-surface-sunken"
                >
                  ورود
                </Link>
                <Link
                  href="/register"
                  className="flex h-10 items-center rounded-lg bg-accent px-3 text-sm font-medium text-white transition-colors hover:bg-accent/90"
                >
                  ثبت‌نام
                </Link>
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