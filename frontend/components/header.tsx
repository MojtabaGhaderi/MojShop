'use client';

import Link from 'next/link';
import { useState } from 'react';
import { NAV_LINKS, SITE_NAME } from '@/lib/constants';
import { useCart } from '@/hooks/use-cart';
import MobileNav from './mobile-nav';

export default function Header() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { itemCount } = useCart();

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

          {/* Actions: search + cart */}
          <div className="flex items-center gap-2">
            {/* Search icon (mobile) */}
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
          </div>
        </div>
      </header>

      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </>
  );
}
