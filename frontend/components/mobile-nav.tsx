'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useCallback } from 'react';
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

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
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
    <div className="fixed inset-0 z-50">
      {/* Overlay with luxury blur */}
      <div
        className="fade-in absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <nav
        className="slide-in-start relative z-10 flex h-full w-72 flex-col bg-background shadow-2xl"
        aria-label="منوی موبایل"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          {/* Logo Placement for Mobile Drawer */}
          <Link href="/" onClick={onClose}>
            <Image
              src="/logo.png"
              alt={SITE_NAME}
              width={120}
              height={40}
              className="h-8 w-auto sm:h-10 mix-blend-multiply" /* <-- This is the fix */
              priority
            />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-sm text-foreground transition-colors hover:bg-secondary"
            aria-label="بستن منو"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* User section */}
        <div className="border-b border-border px-5 py-4">
          {isAuthenticated && user ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">{user.full_name || user.email}</p>
              <div className="flex gap-4">
                <Link href="/profile" onClick={onClose} className="text-xs text-muted-foreground transition-colors hover:text-accent">
                  پروفایل
                </Link>
                <Link href="/orders" onClick={onClose} className="text-xs text-muted-foreground transition-colors hover:text-accent">
                  سفارشات
                </Link>
                <button type="button" onClick={() => { logout(); onClose(); }} className="text-xs text-destructive transition-colors hover:opacity-80">
                  خروج
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" onClick={onClose} className="text-sm font-medium text-foreground transition-colors hover:text-accent">
                ورود
              </Link>
              <span className="h-3 w-px bg-border" aria-hidden="true" />
              <Link href="/register" onClick={onClose} className="text-sm font-medium text-foreground transition-colors hover:text-accent">
                ثبت‌نام
              </Link>
            </div>
          )}
        </div>

        {/* Links */}
        <ul className="flex-1 overflow-y-auto py-2">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={onClose}
                className="block px-5 py-3 text-sm text-foreground transition-colors hover:bg-secondary hover:text-accent"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => { onClose(); openCart(); }}
              className="block w-full px-5 py-3 text-right text-sm text-foreground transition-colors hover:bg-secondary hover:text-accent"
            >
              سبد خرید
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}