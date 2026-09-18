// frontend/app/(admin)/layout.tsx
import * as React from 'react';
import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: `پنل مدیریت — ${SITE_NAME}`,
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7F5F0] text-foreground antialiased selection:bg-accent/20 selection:text-accent-foreground" dir="rtl">
      {children}
    </div>
  );
}