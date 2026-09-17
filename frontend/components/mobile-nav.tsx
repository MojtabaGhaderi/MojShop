'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { NAV_LINKS, SITE_NAME } from '@/lib/constants';
import { useCartDrawer } from '@/context/cart-drawer-context';
import type { AuthUser } from '@/types';

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  user: AuthUser | null;
  isAuthenticated: boolean;
  logout: () => void;
}

export default function MobileNav({
  open,
  onClose,
  user,
  isAuthenticated,
  logout,
}: MobileNavProps) {
  const { open: openCart } = useCartDrawer();

  const handleEscape = React.useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  React.useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, handleEscape]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 select-none" dir="rtl">
      {/* ── 1. Frosted Scrim Backdrop ── */}
      <div
        className="fixed inset-0 bg-primary/40 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── 2. Editorial Alabaster Drawer Panel ── */}
      <nav
        className="fixed inset-y-0 start-0 z-50 flex h-full w-84 max-w-[85vw] flex-col border-e border-[#E8E2D1] bg-gradient-to-b from-[#FDFCFA] via-[#FAF7F0] to-[#F5EFE1] shadow-[0_25px_60px_rgba(23,59,87,0.25)] backdrop-blur-2xl transition-transform duration-300 ease-out animate-in slide-in-from-start"
        aria-label="منوی دسترسی موبایل"
      >
        {/* Fine Alabaster Film-Grain Noise */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.028] mix-blend-overlay"
          aria-hidden="true"
        >
          <filter id="mobile-nav-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#mobile-nav-grain)" />
        </svg>

        {/* Inner Specular Highlight */}
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/80" />

        {/* ── Header: Centered Logo with Absolute Close Button ── */}
        <div className="relative z-10 flex h-20 items-center justify-center border-b border-[#E8E2D1]/80 px-6">
          <Link
            href="/"
            onClick={onClose}
            aria-label={SITE_NAME}
            className="flex items-center justify-center transition-opacity hover:opacity-85"
          >
            <Image
              src="/logo2.png"
              alt={SITE_NAME}
              width={160}
              height={50}
              priority
              className="h-11 w-auto object-contain"
            />
          </Link>

          {/* Close button placed on inline-end (top left in RTL) */}
          <button
            type="button"
            onClick={onClose}
            className="absolute end-4 top-1/2 -translate-y-1/2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-border/70 bg-white/70 text-foreground transition-all duration-200 hover:border-accent hover:bg-white active:scale-95 shadow-2xs"
            aria-label="بستن منو"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Single Unified Vertical Column ── */}
        <div className="relative z-10 flex-1 overflow-y-auto px-6 py-6 scrollbar-thin">
          <div className="flex flex-col space-y-6">

            {/* 1. Primary Store & Catalog Navigation */}
            <div className="space-y-1">
              <span className="block text-[10px] font-medium tracking-widest text-accent uppercase pb-2">
                مجموعه‌ها و دسترسی
              </span>
              <ul className="space-y-1">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className="group flex items-center justify-between rounded-xl py-3 px-2 text-sm font-medium text-foreground transition-all duration-200 hover:bg-white/80 hover:ps-3 hover:text-accent"
                    >
                      <span>{link.label}</span>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-muted-foreground/40 transition-transform duration-200 group-hover:-translate-x-1 group-hover:text-accent"
                      >
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Subtle Atelier Hairline Divider */}
            <div className="h-px w-full bg-[#E8E2D1]/80" />

            {/* 2. Client & Atelier Services (Single Column Flow) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between pb-2">
                <span className="text-[10px] font-medium tracking-widest text-accent uppercase">
                  حساب کاربری و خدمات
                </span>
                {isAuthenticated && user && (
                  <span className="text-[11px] font-medium text-muted-foreground truncate max-w-[130px]">
                    {user.full_name || user.email}
                  </span>
                )}
              </div>

              {isAuthenticated && user ? (
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="/profile"
                      onClick={onClose}
                      className="flex items-center justify-between rounded-xl py-2.5 px-2 text-xs font-medium text-foreground/85 transition-all hover:bg-white/80 hover:ps-3 hover:text-accent"
                    >
                      <span>پروفایل کاربری</span>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/orders"
                      onClick={onClose}
                      className="flex items-center justify-between rounded-xl py-2.5 px-2 text-xs font-medium text-foreground/85 transition-all hover:bg-white/80 hover:ps-3 hover:text-accent"
                    >
                      <span>پیگیری و تاریخچه سفارش‌ها</span>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </Link>
                  </li>
                  <li className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        onClose();
                      }}
                      className="flex w-full items-center justify-between rounded-xl py-2.5 px-2 text-xs font-medium text-destructive transition-all hover:bg-rose-50/60 hover:ps-3 cursor-pointer"
                    >
                      <span>خروج از حساب کاربری</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                    </button>
                  </li>
                </ul>
              ) : (
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="/login"
                      onClick={onClose}
                      className="flex items-center justify-between rounded-xl py-2.5 px-2 text-xs font-medium text-foreground/85 transition-all hover:bg-white/80 hover:ps-3 hover:text-accent"
                    >
                      <span>ورود به حساب کاربری</span>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/register"
                      onClick={onClose}
                      className="flex items-center justify-between rounded-xl py-2.5 px-2 text-xs font-medium text-foreground/85 transition-all hover:bg-white/80 hover:ps-3 hover:text-accent"
                    >
                      <span>عضویت در باشگاه مشتریان</span>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </Link>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* ── Anchored Luxury Cart CTA ── */}
        <div className="relative z-10 border-t border-[#E8E2D1]/80 bg-white/60 p-5 backdrop-blur-md">
          <button
            type="button"
            onClick={() => {
              onClose();
              openCart();
            }}
            className="flex h-12 w-full cursor-pointer items-center justify-between rounded-xl bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-[0_4px_16px_rgba(23,59,87,0.18)] transition-all hover:bg-primary/95 active:scale-[0.99]"
          >
            <div className="flex items-center gap-2.5">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 8h14l-1 12H6L5 8Z" />
                <path d="M9 8V6a3 3 0 0 1 6 0v2" />
              </svg>
              <span>مشاهده سبد خرید</span>
            </div>
            <span className="text-[10px] text-primary-foreground/75 font-mono">
              باز کردن کشو ←
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}