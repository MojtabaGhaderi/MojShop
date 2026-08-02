'use client';

import Link from 'next/link';
import { useEffect, useCallback } from 'react';
import { NAV_LINKS, SITE_NAME } from '@/lib/constants';
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
      {/* Overlay */}
      <div
        className="fade-in absolute inset-0 bg-primary/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <nav
        className="slide-in-start relative z-10 flex h-full w-72 flex-col bg-surface shadow-lg"
        aria-label="منوی موبایل"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-default px-4 py-4">
          <span className="text-lg font-bold text-primary">{SITE_NAME}</span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-primary transition-colors hover:bg-surface-sunken"
            aria-label="بستن منو"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* User section */}
        <div className="border-b border-border-default px-4 py-3">
          {isAuthenticated && user ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-primary">{user.full_name || user.email}</p>
              <div className="flex gap-3">
                <Link
                  href="/profile"
                  onClick={onClose}
                  className="text-xs text-accent hover:underline"
                >
                  پروفایل
                </Link>
                <Link
                  href="/orders"
                  onClick={onClose}
                  className="text-xs text-accent hover:underline"
                >
                  سفارشات
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="text-xs text-red-500 hover:underline"
                >
                  خروج
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link
                href="/login"
                onClick={onClose}
                className="text-sm font-medium text-accent hover:underline"
              >
                ورود
              </Link>
              <Link
                href="/register"
                onClick={onClose}
                className="text-sm font-medium text-accent hover:underline"
              >
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
                className="block px-4 py-3 text-sm font-medium text-primary transition-colors hover:bg-surface-sunken hover:text-accent"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/cart"
              onClick={onClose}
              className="block px-4 py-3 text-sm font-medium text-primary transition-colors hover:bg-surface-sunken hover:text-accent"
            >
              سبد خرید
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}