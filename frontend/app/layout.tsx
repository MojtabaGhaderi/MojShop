import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/constants';

const vazir = Vazirmatn({
  subsets: ['arabic'],
  variable: '--font-vazir',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'fa_IR',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={`${vazir.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
